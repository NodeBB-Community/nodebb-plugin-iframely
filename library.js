"use strict";

var controllers = require('./lib/controllers'),
	meta = module.parent.require('./meta'),
	request = module.parent.require('request'),
	async = module.parent.require('async'),
	nconf = module.parent.require('nconf'),
	winston = module.parent.require('winston'),
	templates = module.parent.require('templates.js'),
	translator = require.main.require('./public/src/modules/translator'),
	meta = require.main.require('./src/meta'),

	postCache = module.parent.require('./posts/cache'),
	LRU = require('lru-cache'),
	url = require('url'),
	moment = require('moment'),
	escapeHtml = require('escape-html'),
    crypto = require('crypto'),

	iframely = {
		config: undefined,
		apiBase: 'https://iframe.ly/api/iframely?origin=nodebb&align=left',
		cache: LRU({
			maxAge: 1000*60*60*24	// one day
		}),
		htmlRegex: /<a.+?href="(.+?)".*?>(.*?)<\/a>/g,
		usedWords: [
			"view-media",
			"hide-media",
			"view-on",
			"view-image",
			"hide-image",
			"view-file",
			"hide-file",
			"view-it",
			"hide-it",
			"view-details",
			"hide-details",
			"read-on",
			"visit"
		]
	},
	app;


iframely.init = function(params, callback) {
	var router = params.router,
		hostMiddleware = params.middleware,
		hostControllers = params.controllers;

	app = params.app;
		
	router.get('/admin/plugins/iframely', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
	router.get('/api/admin/plugins/iframely', controllers.renderAdminPage);

	meta.settings.get('iframely', function(err, config) {

		config.blacklist = (config.blacklist && config.blacklist.split(',')) || [];
		config.expandDomains = (config.expandDomains && config.expandDomains.split(',')) || [];
		config.collapseDomains = (config.collapseDomains && config.collapseDomains.split(',')) || [];

		iframely.config = config;
	});

	callback();
};

iframely.updateConfig = function(data) {
	if (data.plugin === 'iframely') {
		winston.verbose('[plugin/iframely] Config updated');
		postCache.reset();
		data.settings.blacklist = data.settings.blacklist.split(',');
		iframely.config = data.settings;
	}
};

iframely.addAdminNavigation = function(header, callback) {
	header.plugins.push({
		route: '/plugins/iframely',
		icon: 'fa-link',
		name: 'Iframely'
	});

	callback(null, header);
};

iframely.replace = function(raw, options, callback) {

	if (typeof options === 'function') {
		callback = options;
	}

	if (raw && typeof raw !== 'string' && raw.hasOwnProperty('postData') && raw.postData.hasOwnProperty('content')) {

		/**
		 *	If a post object is received (`filter:post.parse`),
		 *	instead of a plain string, call self.
		 */
		iframely.replace(raw.postData.content, {
			votes: parseInt(raw.postData.votes),
			isPost: true
		}, function(err, html) {
			raw.postData.content = html;
			return callback(err, raw);
		});
	} else {
		var urls = [],
			urlsDict = {},
			match;

		// Isolate matches
		while(match = iframely.htmlRegex.exec(raw)) {
			// Only match if it is a naked link (no anchor text)

			var target = url.parse(match[1]);

			if ((
				(match[1] === match[2]) ||
				(match[1] === encodeURI(match[2])) ||
				(target.host + target.path === match[2])

				) && !hostInBlacklist(target.host)) {

				var uri = match[1];

				// Eliminate duplicates and internal links
				if (!(uri in urlsDict) && uri.indexOf(nconf.get('url')) !== 0) {
					urls.push({
						match: match[0],
						url: uri
					});
				}
			}
		}

		async.waterfall([

			function(cb) {

				async.parallel({

					// Query urls from Iframely, in batches of 10
					embeds: async.apply(async.mapLimit, urls, 10, iframely.query),

					words: getTranslationsDict

				}, cb);
			},

			function(data, next) {

				var embeds = data.embeds;
				var words = data.words;

				async.reduce(embeds.filter(Boolean), raw, function(html, data, next) {

					var embed = data.embed;
					var match = data.match;

					if (!embed.html || (embed.rel.indexOf('summary') > -1 && embed.rel.indexOf('app') === -1)) {
						// Skip summary cards.
						var image = getImage(embed);
						if (image) {
							embed.html = '<img src="' + wrapImage(image) + '" />';
						} else {
							app.render('partials/iframely-link-title', {embed: embed}, function(err, parsed) {

								if (err) {
									winston.error('[plugin/iframely] Could not parse embed: ' + err.message);
									return next(null, html);
								}

								next(null, html.replace(match, parsed));
							});
							return;
						}
					}

					// Start detect collapsed/expanded mode.

					var collapseWidget = true;
					var votes = (options && typeof options.votes === 'number') ? options.votes : 0;

					if (options) {
						if (votes >= getIntValue(iframely.config.expandOnVotesCount, 0)) {
							collapseWidget = false;
						}
					}

					// Expand small image.
					if (votes===0 && (embed.rel.indexOf('file') > -1 && embed.rel.indexOf('image') > -1) || embed.rel.indexOf('gifv') > -1) {
						var size = embed.links.file && embed.links.file[0].content_length;
						if (size < 200 * 1024) {
							collapseWidget = false;
						}
					}

					if (alwaysCollapseDomain(embed.url)) {
						collapseWidget = true;
					} else if (alwaysExpandDomain(embed.url)) {
						collapseWidget = false;
					}

					if (!options || !options.isPost) {
						// Expand preview.
						collapseWidget = false;
					}

					// End detect collapsed.

					var context = {};

					if (embed.rel.indexOf('file') > -1) {
						context.domain = getFilename(embed);
						if (embed.rel.indexOf('image') > -1) {
							var size = getFilesize(embed);
							if (size) {
								context.domain += ' (' + size + ')';
							}
						}
					} else {
						context.domain = getDomain(embed);
					}

					context.title = shortenText(embed.meta.title, 200);
					context.description = shortenText(embed.meta.description, 300);

					context.favicon = wrapImage(embed.links.icon && embed.links.icon[0].href);

					if (embed.rel.indexOf('player') > -1 || embed.rel.indexOf('gifv') > -1) {
						context.show_label = words['view-media'];
						context.hide_label = words['hide-media'];

						if (embed.rel.indexOf('gifv') > -1) {
							context.title = null;
							context.description = null;
							context.more_label = null;
						} else {
							context.more_label = words['view-on'];
						}

					} else if (embed.rel.indexOf('image') > -1) {
						context.show_label = words['view-image'];
						context.hide_label = words['hide-image'];

						if (embed.rel.indexOf('file') > -1) {
							context.more_label = null;
						} else {
							context.more_label = words['view-on'];
						}

					} else if (embed.rel.indexOf('file') > -1) {
						context.show_label = words['view-file'];
						context.hide_label = words['hide-file'];

					} else if (embed.rel.indexOf('app') > -1 || embed.rel.indexOf('reader') > -1) {
						context.show_label = words['view-it'];
						context.hide_label = words['hide-it'];

					} else {
						context.show_label = words['view-details'];
						context.hide_label = words['hide-details'];

						if (embed.meta.media == 'reader') {
							// TODO: check usage.
							context.more_label = words['read-on'];
						} else if (!embed.html) {
							// TODO: check usage.
							context.more_label = words['visit'];
						}
					}

					// Format meta info.
					var meta = [];

					if (embed.meta.author) {
						meta.push(embed.meta.author);
					}

					var date = getDate(embed.meta.date);
					if (date) {
						meta.push(date);
					}

					var currency = embed.meta.currency_code || embed.meta.currency;
					var price = embed.meta.price ? (embed.meta.price + (currency ? (' ' + currency) : '')) : null;
					if (price) {
						meta.push(price);
					}

					var duration = getDuration(embed.meta.duration);
					if (duration) {
						meta.push(duration);
					}

					var views = getViews(embed.meta.views);
					if (views) {
						meta.push(views);
					}

					if (embed.meta.category) {
						meta.push(embed.meta.category);
					}

					context.meta = meta.join('&nbsp;&nbsp;/&nbsp;&nbsp;');

					// END Format meta info.

					embed.html = wrapHtmlImages(embed.html);

					context.embed = embed;

					function renderWidgetWrapper(err, embed_widget) {

						if (err) {
							winston.error('[plugin/iframely] Could not parse embed: ' + err.message);
							return next(null, html);
						}

						if (collapseWidget) {
							context.escaped_html = escapeHtml(embed_widget);
							context.toggle_label = context.show_label;
							context.widget_html = '';
						} else {
							context.escaped_html = '';
							context.toggle_label = context.hide_label;
							context.widget_html = embed_widget;
						}

						app.render('partials/iframely-widget-wrapper', context, function(err, parsed) {
							if (err) {
								winston.error('[plugin/iframely] Could not parse embed! ' + err.message);
								return next(null, html);
							}

							next(null, html.replace(match, parsed));
						});
					}

					if (embed.rel.indexOf('app') > -1 || embed.rel.indexOf('reader') > -1 || embed.rel.indexOf('survey') > -1) {
						renderWidgetWrapper(null, embed.html);
					} else {
						app.render('partials/iframely-widget-card', context, renderWidgetWrapper);
					}

				}, next);
			}

		], function(error, html) {

			if (error) {
				winston.error('[plugin/iframely] Could not parse embed! ' + err.message);
			}

			callback(null, html);
		});
	}
};

iframely.query = function(data, callback) {
	if (iframely.cache.has(data.url)) {
		winston.verbose('[plugin/iframely] Retrieving \'' + data.url + '\' from cache...');
		setImmediate(function() {
			callback(null, {
				match: data.match,
				embed: iframely.cache.get(data.url)
			});
		});
	} else {
		winston.verbose('[plugin/iframely] Querying \'' + data.url + '\' via Iframely...')

		if (iframely.config.endpoint) {
			var iframelyAPI = /^https?:\/\//i.test(iframely.config.endpoint) ? iframely.config.endpoint : iframely['apiBase'] + '&api_key=' + iframely.config.endpoint;
			iframelyAPI += (iframelyAPI.indexOf('?') > -1 ? '&' : '?') + 'url=' + data.url;

			request({
				url: iframelyAPI,
				json: true
			}, function(err, res, body) {
				if (err) {
					winston.error('[plugin/iframely] Encountered error querying Iframely API: ' + err.message);
					return callback();
				} else {
					if (res.statusCode === 200 && body) {
						iframely.cache.set(data.url, body);
						return callback(null, {
							match: data.match,
							embed: body
						});
					} else {
						return callback();
					}
				}
			});
		} else {
			winston.error('[plugin/iframely] No API key or endpoint configured, skipping Iframely');
		}
	}
};

function hostInBlacklist(host) {
	return iframely.config.blacklist && iframely.config.blacklist.indexOf(host) > -1;
}

function alwaysExpandDomain(urlToCheck) {
	var parsed = url.parse(urlToCheck);
	return iframely.config.expandDomains && iframely.config.expandDomains.indexOf(parsed.host) > -1;
}

function alwaysCollapseDomain(urlToCheck) {
	var parsed = url.parse(urlToCheck);
	return iframely.config.collapseDomains && iframely.config.collapseDomains.indexOf(parsed.host) > -1;
}

function wrapHtmlImages(html) {

	if (html && iframely.config.camoProxyKey && iframely.config.camoProxyHost) {
		return html.replace(/<img[^>]+src=["'][^'"]+["']/gi, function(item) {
			var m = item.match(/(<img[^>]+src=["'])([^'"]+)(["'])/i);
			var url = wrapImage(m[2]);
			return m[1] + url + m[3];
		});

	} else {
		return html;
	}
}

function wrapImage(url) {

	if (url && iframely.config.camoProxyKey && iframely.config.camoProxyHost && url.indexOf(iframely.config.camoProxyHost) === -1) {

		var hexDigest, hexEncodedPath;

		hexDigest = crypto.createHmac('sha1', iframely.config.camoProxyKey).update(url).digest('hex');
		hexEncodedPath = (new Buffer(url)).toString('hex');

		return [
			iframely.config.camoProxyHost.replace(/\/$/, ''),	// Remove tail '/'
			hexDigest,
			hexEncodedPath
		].join('/');

	} else {
		return url;
	}
}

function getTranslationsDict(cb) {
	var dict = {};
	async.each(iframely.usedWords, function(word, cb) {
		translator.translate('[[iframely:' + word + ']]', function(translated) {
			dict[word] = translated;
			cb();
		});
	}, function(error) {
		cb(error, dict);
	});
}

function getIntValue(value, defaultValue) {
	value = parseInt(value);
	if (typeof value === 'number' && !isNaN(value)) {
		return value;
	} else {
		return defaultValue;
	}
}

function shortenText(value, maxlength) {

	if (!value) {
		return '';
	}

	maxlength = maxlength || 130;

	value = '' + value;

	if (value.length <= maxlength) {
		return value;
	} else {

		value = value.substr(0, maxlength);

		var m = value.match(/(.*)[\. ,\/-]/);

		if (m) {
			value = m[1]
			return m[1] + '...';
		}

		return value + '...';
	}
}

function getDuration(duration) {
	if (duration) {
		var seconds = duration % 60;
		var minutes = Math.floor((duration - seconds) / 60);
		var hours = Math.floor(minutes / 60);
		minutes = minutes % 60;

		if (seconds < 10) {
			seconds = '0' + seconds;
		}

		if (minutes < 10) {
			minutes = '0' + minutes;
		}

		return (hours ? (hours + ':') : '') + minutes + ':' + seconds;
	}
}

function numberWithCommas(x) {
	var parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
	return parts.join(".");
}

function getViews(views) {
	if (views) {
		if (views > 1000000) {
			return numberWithCommas((views / 1000000).toFixed(1)) + 'Mln';
		} else if (views > 1000) {
			return numberWithCommas((views / 1000).toFixed(1)) + 'K';
		} else {
			return numberWithCommas(views);
		}
	}
}

function getDomain(embed) {
	var domain = embed.meta && embed.meta.site;
	if (!domain) {
		var url = embed.meta && embed.meta.canonical || embed.url;
		var m = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
		if (m) {
			domain = m[1];
		} else {
			domain = url;
		}
	}
	return domain;
}

function getDate(date) {

	var onDate = '';
	if (date) {
		date = new Date(date);
		if (date && !isNaN(date.getTime())) {

			var language = meta.config.defaultLang || 'en_GB';

			onDate = moment(date).locale(language).format('MMM D');

			if (date.getFullYear() !== new Date().getFullYear()) {
				onDate = onDate + ', ' + date.getFullYear();
			}
		}
	}

	return onDate;
}

function getImage(embed) {
	var image = (embed.links.thumbnail && embed.links.thumbnail[0]) || (embed.links.image && embed.links.image[0]);
	return image && image.href;
}

function getFilename(embed) {
	var m = embed.url.match(/([^\/\.]+\.[^\/\.]+)(?:\?.*)?$/);
	if (m) {
		return m[1];
	} else {
		return getDomain(embed);
	}
}

function getFilesize(embed) {
	var content_length = parseInt(embed.links.file[0].content_length);
	if (!isNaN(content_length)) {
		if (content_length > 1024*1024) {
			content_length = Math.round(content_length / (1024 * 1024)) + ' MB';
		} else {
			content_length = content_length / 1024;
			if (content_length < 10) {
				content_length = content_length.toFixed(1);
			} else {
				content_length = Math.round(content_length);
			}
			content_length += ' KB'
		}
		return content_length;
	}
}

module.exports = iframely;