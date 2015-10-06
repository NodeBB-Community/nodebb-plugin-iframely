"use strict";

var controllers = require('./lib/controllers'),
	meta = module.parent.require('./meta'),
	request = module.parent.require('request'),
	async = module.parent.require('async'),
	nconf = module.parent.require('nconf'),
	winston = module.parent.require('winston'),
	templates = module.parent.require('templates.js'),

	postCache = module.parent.require('./posts/cache'),
	LRU = require('lru-cache'),
	url = require('url'),
	escapeHtml = require('escape-html'),

	iframely = {
		config: undefined,
		apiBase: 'http://nodebb.iframe.ly/api',
		apiBaseWithKey: 'https://iframe.ly/api',
		cache: LRU({
			maxAge: 1000*60*60*24	// one day
		}),
		htmlRegex: /<a.+?href="(.+?)".*?>(.*?)<\/a>/g
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
			votes: parseInt(raw.postData.votes)
		}, function(err, html) {
			raw.postData.content = html;
			return callback(err, raw);
		});
	} else {
		var urls = [],
			match;

		// Isolate matches
		while(match = iframely.htmlRegex.exec(raw)) {
			// Only match if it is a naked link (no anchor text)

			var target = url.parse(match[1]),
				text = url.parse(match[2]);

			if (((match[1] === match[2]) || (target.host + target.path === match[2])) && !hostInBlacklist(target.host)) {
				urls.push(match[1]);
			}
		}

		// Eliminate duplicates and internal links
		urls = urls.filter(function(url, idx) {
			return urls.indexOf(url) === idx && url.indexOf(nconf.get('url')) !== 0;
		});

		async.waterfall([
			// Query urls from iFramely, in batches of 10
			async.apply(async.mapLimit, urls, 10, iframely.query),

			// Replace post text as necessary
			function(embeds, next) {
				async.reduce(embeds.filter(Boolean), raw, function(html, embed, next) {

					var replaceRegex = new RegExp('<a.+?href="' + embed.url.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + '".*?>.*?</a>', 'g');

					if (embed.rel.indexOf('summary') > -1 && embed.rel.indexOf('app') === -1) {
						// Skip summary cards.
						var image = getImage(embed);
						if (image) {
							embed.html = '<img src="' + image + '" />';
						} else {
							app.render('partials/iframely-link-title', {embed: embed}, function(err, parsed) {

								if (err) {
									winston.error('[plugin/iframely] Could not parse embed! ' + err.message);
									return next(null, html);
								}

								next(null, html.replace(replaceRegex, parsed));
							});
						}
					}

					// Start detect collapsed.

					var collapseWidget = iframely.config.mode === 'alwaysCollapse';

					if (alwaysCollapseDomain(embed.url)) {
						collapseWidget = true;
					} else if (alwaysExpandDomain(embed.url)) {
						collapseWidget = false;
					}

					if (options && typeof options.votes === 'number') {

						if (iframely.config.collapseOnVotes === 'on') {
							if (options.votes <= getIntValue(iframely.config.collapseOnVotesCount, -1)) {
								collapseWidget = true;
							}
						}

						if (iframely.config.expandOnVotes === 'on') {
							if (options.votes >= getIntValue(iframely.config.expandOnVotesCount, 1)) {
								collapseWidget = false;
							}
						}
					}

					// End detect collapsed.

					var context = {};

					context.domain = getDomain(embed);
					context.description = shortenText(embed.meta.description, 300);

					if (embed.rel.indexOf('player') > -1 || embed.rel.indexOf('gifv') > -1) {
						context.show_label = 'view media';
						context.hide_label = 'hide media';
						context.more_label = 'view on';

					} else if (embed.rel.indexOf('image') > -1) {
						context.show_label = 'view image';
						context.hide_label = 'hide image';
						context.more_label = 'view on';

					} else if (embed.rel.indexOf('file') > -1) {
						context.show_label = 'view file';
						context.hide_label = 'hide file';

					} else if (embed.rel.indexOf('app') > -1 || embed.rel.indexOf('reader') > -1) {
						context.show_label = 'view it';
						context.hide_label = 'hide it';

					} else {
						context.show_label = 'view details';
						context.hide_label = 'hide details';

						if (embed.meta.media == 'reader') {
							// TODO: check usage.
							context.more_label = 'read on';
						} else if (!embed.html) {
							// TODO: check usage.
							context.more_label = 'visit';
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

					context.embed = embed;

					function renderWidgetWrapper(err, embed_widget) {

						if (err) {
							winston.error('[plugin/iframely] Could not parse embed! ' + err.message);
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

							next(null, html.replace(replaceRegex, parsed));
						});
					}

					if (embed.rel.indexOf('app') > -1 || embed.rel.indexOf('reader') > -1 || embed.rel.indexOf('survey') > -1) {
						renderWidgetWrapper(null, embed.html);
					} else {
						app.render('partials/iframely-widget-card', context, renderWidgetWrapper);
					}

				}, next);
			}
		], callback);
	}
};

iframely.query = function(url, callback) {
	if (iframely.cache.has(url)) {
		winston.verbose('[plugin/iframely] Retrieving \'' + url + '\' from cache...');
		setImmediate(function() {
			callback(null, iframely.cache.get(url));
		});
	} else {
		winston.verbose('[plugin/iframely] Querying \'' + url + '\' via iFramely...')
		request({
			url: iframely[iframely.config.key ? 'apiBaseWithKey' : 'apiBase'] + '/iframely?url=' + url + (iframely.config.key ? '?api_key=' + iframely.config.key : ''),
			json: true
		}, function(err, res, body) {
			if (err) {
				winston.error('[plugin/iframely] Encountered error querying iFramely API: ' + err.message);
				return callback();
			} else {
				if (res.statusCode === 200 && body) {
					iframely.cache.set(url, body);
					return callback(null, body);
				} else {
					return callback();
				}
			}
		});
	}
};

function hostInBlacklist(host) {
	if (iframely.config.enableBlacklist === 'on') {
		return iframely.config.blacklist.indexOf(host) > -1;
	} else {
		return false;
	}
}

function alwaysExpandDomain(urlToCheck) {
	var parsed = url.parse(urlToCheck);
	return iframely.config.expandDomains && iframely.config.expandDomains.indexOf(parsed.host) > -1;
}

function alwaysCollapseDomain(urlToCheck) {
	var parsed = url.parse(urlToCheck);
	return iframely.config.collapseDomains && iframely.config.collapseDomains.indexOf(parsed.host) > -1;
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

	var months = [
		"Jan",
		"Feb",
		"March",
		"April",
		"May",
		"June",
		"July",
		"Aug",
		"Sept",
		"Oct",
		"Nov",
		"Dec"
	];

	var onDate = '';
	if (date) {
		date = new Date(date);
		if (date && !isNaN(date.getTime())) {
			onDate = months[date.getMonth()] + ' ' + date.getDate();
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