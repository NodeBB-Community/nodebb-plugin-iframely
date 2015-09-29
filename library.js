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
		config.blacklist = config.blacklist.split(',');
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

iframely.replace = function(raw, callback) {
	if (typeof raw !== 'string' && raw.hasOwnProperty('postData') && raw.postData.hasOwnProperty('content')) {
		/**
		 *	If a post object is received (`filter:post.parse`),
		 *	instead of a plain string, call self.
		 */
		iframely.replace(raw.postData.content, function(err, html) {
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

			if (match[1] === match[2] || target.host + target.path === match[2] && notInBlacklist(match[1])) {
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
					if (iframely.config.simple !== 'on') {
						app.render('partials/iframely-embed', embed, function(err, parsed) {
							if (err) {
								winston.error('[plugin/iframely] Could not parse embed! ' + err.message);
								return next(null, html);
							}

							next(null, html.replace(replaceRegex, parsed));
						});
					} else {
						if (embed.html) {
							next(null, html.replace(replaceRegex, embed.html));
						} else {
							next(null, html);
						}
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

function notInBlacklist(urlToCheck) {
	if (iframely.config.enableBlacklist === 'on') {
		var parsed = url.parse(urlToCheck);
		return iframely.config.blacklist.indexOf(parsed.host) === -1;
	} else {
		return true;
	}
}

module.exports = iframely;