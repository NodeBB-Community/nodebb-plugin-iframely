"use strict";

var controllers = require('./lib/controllers'),
	meta = module.parent.require('./meta'),
	request = module.parent.require('request'),
	async = module.parent.require('async'),
	winston = module.parent.require('winston'),
	templates = module.parent.require('templates.js'),
	postCache = module.parent.require('./posts/cache'),
	LRU = require('lru-cache'),

	iframely = {
		config: undefined,
		apiBase: 'http://nodebb.iframe.ly/api',
		cache: LRU({
			maxAge: 1000*60*60*24	// one day
		}),
		htmlRegex: /<a.+?href="(.+?)".*?>.*?<\/a>/g
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
		iframely.config = config;
	});

	callback();
};

iframely.updateConfig = function(data) {
	if (data.plugin === 'iframely') {
		winston.verbose('[plugin/iframely] Config updated');
		postCache.reset();
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
			urls.push(match[1]);
		}

		// Eliminate duplicates
		urls = urls.filter(function(url, idx) {
			return urls.indexOf(url) === idx;
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
						next(null, html.replace(replaceRegex, embed.html));
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
			url: iframely.apiBase + '/iframely?url=' + url,
			json: true
		}, function(err, res, body) {
			if (err) {
				winston.error('[plugin/iframely] Encountered error querying iFramely API: ' + err.message);
				return callback();
			} else {
				if (body && body.html) {
					iframely.cache.set(url, body);
					return callback(null, body);
				} else {
					return callback();
				}
			}
		});
	}
};

module.exports = iframely;