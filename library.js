"use strict";

var controllers = require('./lib/controllers');
var meta = module.parent.require('./meta');
var request = module.parent.require('request');
var async = module.parent.require('async');
var nconf = module.parent.require('nconf');
var winston = module.parent.require('winston');
var validator = module.parent.require('validator');
var meta = require.main.require('./src/meta');

var postCache = module.parent.require('./posts/cache');
var LRU = require('lru-cache');
var url = require('url');
var moment = require('moment');
var crypto = require('crypto');

var iframely = {
	config: undefined,
	apiBase: 'http://iframe.ly/api/iframely?origin=nodebb&align=left',
	cache: LRU({
		maxAge: 1000*60*60*24	// one day
	}),
	htmlRegex: /<a.+?href="(.+?)".*?>(.*?)<\/a>/g
};
var app;

iframely.init = function(params, callback) {
	var router = params.router,
		hostMiddleware = params.middleware;

	app = params.app;
		
	router.get('/admin/plugins/iframely', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
	router.get('/api/admin/plugins/iframely', controllers.renderAdminPage);

	meta.settings.get('iframely', function(err, config) {

		config.blacklist = (config.blacklist && config.blacklist.split(',')) || [];

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

		// Skip parsing post with negative votes.
		if (options && options.isPost) {
			var votes = (options && typeof options.votes === 'number') ? options.votes : 0;
			if (votes < getIntValue(iframely.config.doNoteParseIfVotesLessThen, -10)) {
				return callback(null, raw);
			}
		}

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

			// Query urls from Iframely, in batches of 10
			async.apply(async.mapLimit, urls, 10, iframely.query),

			function(embeds, next) {

				async.reduce(embeds.filter(Boolean), raw, function(html, data, next) {

					var embed = data.embed;
					var match = data.match;
					var embedHtml = embed.html;

					var generateCard = false;

					if (!embedHtml) {
						var image = getImage(embed);
						if (image) {
							// Generate own card with thumbnail.
							generateCard = true;
							embedHtml = '<img src="' + image + '" />';
						} else {
							// No embed code. Show link with title only.
							app.render('partials/iframely-link-title', {embed: embed}, function (err, parsed) {

								if (err) {
									winston.error('[plugin/iframely] Could not parse embed: ' + err.message);
									return next(null, html);
								}

								next(null, html.replace(match, parsed));
							});
							return;
						}
					}

					// Format meta info.
					var meta = [];

					if (generateCard) {
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
					}

					// END Format meta info.

					var context = {
						show_title: false,
						domain: getDomain(embed),
						title: validator.escape(shortenText(embed.meta.title, 200)),
						description: validator.escape(shortenText(embed.meta.description, 300)),
						favicon: wrapImage(embed.links.icon && embed.links.icon[0].href) || false,
						embed: embed,
						metaString: meta.length ? meta.join('&nbsp;&nbsp;/&nbsp;&nbsp;') : false,
						embedHtml: wrapHtmlImages(embedHtml)
					};

					if (context.title && embed.rel.indexOf('player') > -1 && embed.rel.indexOf('gifv') === -1) {
						context.show_title = true;
					}

					if (embed.rel.indexOf('file') > -1 && embed.rel.indexOf('reader') > -1) {
						context.title = embed.meta.canonical;
						context.show_title = true;
					}

					function renderWidgetWrapper(err, embed_widget) {

						if (err) {
							winston.error('[plugin/iframely] Could not parse embed: ' + err.message);
							return next(null, html);
						}

						context.widget_html = embed_widget;

						app.render('partials/iframely-widget-wrapper', context, function (err, parsed) {
							if (err) {
								winston.error('[plugin/iframely] Could not parse embed! ' + err.message);
								return next(null, html);
							}

							next(null, html.replace(match, parsed));
						});
					}

					if (generateCard) {
						app.render('partials/iframely-widget-card', context, renderWidgetWrapper);
					} else {
						renderWidgetWrapper(null, context.embedHtml);
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
			try {
				callback(null, {
					match: data.match,
					embed: iframely.cache.get(data.url)
				});
			} catch(ex) {
				winston.error('[plugin/iframely] Could not parse embed! ' + ex);
				callback();
			}
		});
	} else {
		winston.verbose('[plugin/iframely] Querying \'' + data.url + '\' via Iframely...')

		if (iframely.config.endpoint) {

			var custom_endpoint = /^https?:\/\//i.test(iframely.config.endpoint);

			var iframelyAPI = custom_endpoint ? iframely.config.endpoint : iframely['apiBase'] + '&api_key=' + iframely.config.endpoint;
			iframelyAPI += (iframelyAPI.indexOf('?') > -1 ? '&' : '?') + 'url=' + data.url;

			if (custom_endpoint) {
				iframelyAPI += '&group=true';
			}

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
						try {
							callback(null, {
								match: data.match,
								embed: body
							});
						} catch(ex) {
							winston.error('[plugin/iframely] Could not parse embed! ' + ex);
							callback();
						}
					} else {
						callback();
					}
				}
			});
		} else {
			winston.error('[plugin/iframely] No API key or endpoint configured, skipping Iframely');
			callback();
		}
	}
};

function hostInBlacklist(host) {
	return iframely.config.blacklist && iframely.config.blacklist.indexOf(host) > -1;
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
	var domain = embed.meta.site;
	if (!domain) {
		var url = embed.meta.canonical;
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

module.exports = iframely;
