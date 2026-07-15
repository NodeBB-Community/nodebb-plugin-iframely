'use strict';

const LRU = require('lru-cache');
const url = require('url');
const moment = require('moment');
const crypto = require('crypto');

const async = nodebb.require('async');
const nconf = nodebb.require('nconf');
const winston = nodebb.require('winston');
const validator = nodebb.require('validator');
const meta = nodebb.require('./src/meta');
const routeHelpers = nodebb.require('./src/routes/helpers');

const postCache = nodebb.require('./src/posts/cache');

const controllers = require('./lib/controllers');

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const DEFAULT_CACHE_MAX_AGE_DAYS = 1;

const iframely = {
	config: undefined,
	apiBase: 'http://iframe.ly/api/iframely?origin=nodebb&align=left',
	htmlRegex: /(?:<p[^>]*>|<br\s*\/?>|^)<a.+?href="(.+?)".*?>(.*?)<\/a>(?:<br\s*\/?>|<\/p>)?/gm,
};
let app;

iframely.init = function (params, callback) {
	const { router } = params;

	app = params.app;

	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/iframely', controllers.renderAdminPage);

	meta.settings.get('iframely', function (err, config) {
		if (err) {
			return callback(err);
		}
		config.blacklist = (config.blacklist && config.blacklist.split(',')) || [];

		iframely.config = config;

		let cacheMaxAgeDays = getIntValue(config.cacheMaxAgeDays, DEFAULT_CACHE_MAX_AGE_DAYS);
		if (cacheMaxAgeDays < DEFAULT_CACHE_MAX_AGE_DAYS) {
			cacheMaxAgeDays = DEFAULT_CACHE_MAX_AGE_DAYS;
		}
		iframely.cache = LRU({
			maxAge: cacheMaxAgeDays * ONE_DAY_MS,
		});

		callback();
	});
};

iframely.updateConfig = function (data) {
	if (data.plugin === 'iframely') {
		winston.verbose('[plugin/iframely] Config updated');
		postCache.reset();
		data.settings.blacklist = data.settings.blacklist.split(',');
		iframely.config = data.settings;
	}
};

iframely.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: '/plugins/iframely',
		icon: 'fa-link',
		name: 'Iframely',
	});

	callback(null, header);
};

iframely.replace = function (raw, options, callback) {
	if (typeof options === 'function') {
		callback = options;
	}

	if (raw && typeof raw !== 'string' && raw.hasOwnProperty('postData') && raw.postData.hasOwnProperty('content')) {
		/**
		 * If a post object is received (`filter:post.parse`),
		 * instead of a plain string, call self.
		 */

		iframely.replace(raw.postData.content, {
			votes: parseInt(raw.postData.votes),
			isPost: true,
		}, function (err, html) {
			raw.postData.content = html;
			return callback(err, raw);
		});

	} else {
		const isPreview = !options || !options.isPost;
		// Skip parsing post with negative votes.
		if (options && options.isPost) {
			const votes = (options && typeof options.votes === 'number') ? options.votes : 0;
			if (votes < getIntValue(iframely.config.doNoteParseIfVotesLessThen, -10)) {
				return callback(null, raw);
			}
		}

		const urls = [];
		const urlsDict = {};
		let match;

		// Isolate matches
		// eslint-disable-next-line no-cond-assign
		while (match = iframely.htmlRegex.exec(raw)) {
			// Eliminate trailing slashes for comparison purposes
			[1, 2].forEach((key) => {
				if (match[key].endsWith('/')) {
					match[key] = match[key].slice(0, -1);
				}
			});

			// Only match if it is a naked link (no anchor text)
			let target;
			try {
				target = url.parse(match[1]);
			} catch (err) {
				target = '';
			}

			if ((
				(match[1] === match[2]) ||
				(match[1] === encodeURI(match[2])) ||
				(target.host + target.path === match[2])
			) && !hostInBlacklist(target.host)) {

				const uri = match[1];

				// Eliminate duplicates and internal links
				if (!(uri in urlsDict) && !isInternalLink(target)) {
					urlsDict[uri] = true;
					urls.push({
						match: match[0],
						url: uri,
					});
				}
			}
		}

		async.waterfall([
			// Query urls from Iframely, in batches of 10
			async.apply(async.mapLimit, urls, 10, iframely.query),

			function (embeds, next) {
				async.reduce(embeds.filter(Boolean), raw, function (html, data, next) {
					const { embed, match, url, fromCache } = data;
					let embedHtml = embed.html;

					const hideWidgetForPreview = isPreview && fromCache;

					let generateCardWithImage = false;

					const icon = getIcon(embed);
					const image = getImage(embed);
					const scriptSrc = getScriptSrc(embedHtml);
					// Allow only `iframe.ly/embed.js` script.
					const isIframelyWidget = scriptSrc && (
						/^(?:https:)?\/\/(?:\w+\.)iframe\.ly\/embed\.js/.test(scriptSrc) ||
						/^(?:https:)?\/\/if-cdn\.com\/embed\.js/.test(scriptSrc) ||
						/^(?:https:)?\/\/iframely\.net\/embed\.js/.test(scriptSrc)
					);

					const isSanitized = !scriptSrc || isIframelyWidget;

					if (embedHtml && isSanitized) {
						// Render embedHtml.
					} else if (image) {
						// Render card with image.
						generateCardWithImage = image;
					} else {
						// No embed code, no image. Show link with title only.
						app.render('partials/iframely-link-title', {
							title: embed.meta.title || url,
							embed: embed,
							icon: icon,
							url: url,
						}, function (err, parsed) {
							if (err) {
								winston.error('[plugin/iframely] Could not parse embed: ' + err.message + '. Url: ' + url);
								return next(null, html);
							}

							next(null, html.replace(match, parsed));
						});
						return;
					}

					// Format meta info.
					const metaInfo = [];

					if (generateCardWithImage) {
						if (embed.meta.author) {
							metaInfo.push(embed.meta.author);
						}

						const date = getDate(embed.meta.date);
						if (date) {
							metaInfo.push(date);
						}

						const currency = embed.meta.currency_code || embed.meta.currency;
						const price = embed.meta.price ? (embed.meta.price + (currency ? (' ' + currency) : '')) : null;
						if (price) {
							metaInfo.push(price);
						}

						const duration = getDuration(embed.meta.duration);
						if (duration) {
							metaInfo.push(duration);
						}

						const views = getViews(embed.meta.views);
						if (views) {
							metaInfo.push(views);
						}

						if (embed.meta.category) {
							metaInfo.push(embed.meta.category);
						}
					}

					// END Format meta info.

					embedHtml = wrapHtmlImages(embedHtml);
					const title = shortenText(embed.meta.title, 200);

					const context = {
						show_title: false,
						domain: getDomain(embed),
						title: title || false,
						description: shortenText(embed.meta.description, 300),
						favicon: wrapImage(icon),
						embed: embed,
						url: url,
						metaString: metaInfo.length ? metaInfo.join('&nbsp;&nbsp;/&nbsp;&nbsp;') : false,
						embedHtml: embedHtml,
						embedIsImg: /^<img[^>]+>$/.test(embedHtml),
						image: generateCardWithImage,
						hideWidgetForPreview: hideWidgetForPreview,
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
							winston.error('[plugin/iframely] Could not parse embed: ' + err.message + '. Url: ' + url);
							return next(null, html);
						}

						embed_widget = embed_widget ? embed_widget : false;

						context.widget_html = embed_widget;

						if (hideWidgetForPreview && embed_widget) {
							context.embedHtmlEscaped = validator.escape(embed_widget);
						}

						app.render('partials/iframely-widget-wrapper', context, function (err, parsed) {
							if (err) {
								winston.error('[plugin/iframely] Could not parse embed! ' + err.message + '. Url: ' + url);
								return next(null, html);
							}

							next(null, html.replace(match, parsed));
						});
					}

					if (generateCardWithImage) {
						app.render('partials/iframely-widget-card', context, renderWidgetWrapper);
					} else {
						renderWidgetWrapper(null, context.embedHtml);
					}

				}, next);
			},
		], function (error, html) {
			if (error) {
				winston.error('[plugin/iframely] Could not parse embed! ' + error.message + '. Urls: ' + urls);
			}

			callback(null, html);
		});
	}
};

iframely.query = function (data, callback) {
	if (iframely.cache.has(data.url)) {
		winston.verbose('[plugin/iframely] Retrieving \'' + data.url + '\' from cache...');
		setImmediate(function () {
			try {
				callback(null, {
					url: data.url,
					match: data.match,
					embed: iframely.cache.get(data.url),
					fromCache: true,
				});
			} catch (ex) {
				winston.error('[plugin/iframely] Could not parse embed! ' + ex + '. Url: ' + data.url);
			}
		});
	} else {
		winston.verbose('[plugin/iframely] Querying \'' + data.url + '\' via Iframely...');

		if (iframely.config.endpoint) {

			const custom_endpoint = /^https?:\/\//i.test(iframely.config.endpoint);

			let iframelyAPI = custom_endpoint ? iframely.config.endpoint : iframely['apiBase'] + '&api_key=' + iframely.config.endpoint;
			iframelyAPI += (iframelyAPI.indexOf('?') > -1 ? '&' : '?') + 'url=' + encodeURIComponent(data.url);

			if (custom_endpoint) {
				iframelyAPI += '&group=true';
			}

			fetch(iframelyAPI).catch((err) => {
				winston.error('[plugin/iframely] Encountered error querying Iframely API: ' + err.message + '. Url: ' + data.url + '. Api call: ' + iframelyAPI);
				callback();
			}).then(async (res) => {
				if (!res.ok) {
					winston.error('[plugin/iframely] Encountered error querying Iframely API: ' + res.status + '. Url: ' + data.url + '. Api call: ' + iframelyAPI);
					return callback();
				}
				try {
					if (res.status === 404) {
						winston.verbose('[plugin/iframely] not found: ' + data.url);
						return callback();
					}
					const body = await res.json();

					if (res.status !== 200 || !body) {
						winston.verbose('[plugin/iframely] iframely responded with error: ' + JSON.stringify(body) + '. Url: ' + data.url + '. Api call: ' + iframelyAPI);
						return callback();
					}
					if (!body.meta || !body.links) {
						winston.error('[plugin/iframely] Invalid Iframely API response. Url: ' + data.url + '. Api call: ' + iframelyAPI + '. Body: ' + JSON.stringify(body));
						return callback();
					}

					iframely.cache.set(data.url, body);

					callback(null, {
						url: data.url,
						match: data.match,
						embed: body,
						fromCache: false,
					});
				} catch (ex) {
					winston.error('[plugin/iframely] Could not parse embed! ' + ex.stack + '. Url: ' + data.url + '. Api call: ' + iframelyAPI);
					callback();
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
		return html.replace(/<img[^>]+src=["'][^'"]+["']/gi, function (item) {
			const m = item.match(/(<img[^>]+src=["'])([^'"]+)(["'])/i);
			const url = wrapImage(m[2]);
			return m[1] + url + m[3];
		});
	}

	return html;
}

function wrapImage(url) {
	const { config } = iframely;
	if (url && config?.camoProxyKey && config?.camoProxyHost && !url.includes(config?.camoProxyHost)) {
		const hexDigest = crypto.createHmac('sha1', config.camoProxyKey).update(url).digest('hex');
		const hexEncodedPath = (new Buffer(url)).toString('hex');

		return [
			config.camoProxyHost.replace(/\/$/, ''), // Remove tail '/'
			hexDigest,
			hexEncodedPath,
		].join('/');
	}
	return url;
}

function getIntValue(value, defaultValue) {
	value = parseInt(value);
	if (typeof value === 'number' && !isNaN(value)) {
		return value;
	}
	return defaultValue;
}

function shortenText(value, maxlength) {
	if (!value) {
		return '';
	}

	maxlength = maxlength || 130;

	value = '' + value;

	if (value.length <= maxlength) {
		return value;
	}

	value = value.substr(0, maxlength);

	const m = value.match(/(.*)[. ,/-]/);
	if (m) {
		return m[1] + '...';
	}

	return value + '...';
}

function getDuration(duration) {
	if (duration) {
		let seconds = duration % 60;
		let minutes = Math.floor((duration - seconds) / 60);
		const hours = Math.floor(minutes / 60);
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
	const parts = x.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
	return parts.join('.');
}

function getViews(views) {
	if (views) {
		if (views > 1000000) {
			return numberWithCommas((views / 1000000).toFixed(1)) + 'Mln';
		} else if (views > 1000) {
			return numberWithCommas((views / 1000).toFixed(1)) + 'K';
		}
		return numberWithCommas(views);
	}
}

function getDomain(embed) {
	let domain = embed.meta.site;
	if (!domain) {
		const url = embed.meta.canonical;
		const m = url.match(/(?:https?:\/\/)?(?:www\.)?([^/]+)/i);
		if (m) {
			domain = m[1];
		} else {
			domain = url;
		}
	}
	return domain;
}

function getDate(date) {

	let onDate = '';
	if (date) {
		date = new Date(date);
		if (date && !isNaN(date.getTime())) {

			const language = meta.config.defaultLang || 'en_GB';

			onDate = moment(date).locale(language).format('MMM D');

			if (date.getFullYear() !== new Date().getFullYear()) {
				onDate = onDate + ', ' + date.getFullYear();
			}
		}
	}

	return onDate;
}

function getImage(embed) {
	const image = embed &&
		embed.links && (
		(
			embed.links.thumbnail &&
			embed.links.thumbnail.length &&
			embed.links.thumbnail[0]
		) || (
			embed.links.image &&
			embed.links.image.length &&
			embed.links.image[0]
		)
	);
	return image && image.href;
}

function getIcon(embed) {
	const icon =
		embed &&
		embed.links &&
		embed.links.icon &&
		embed.links.icon.length &&
		embed.links.icon[0];

	return (icon && icon.href) || false;
}

function getScriptSrc(html) {
	const scriptMatch = html && html.match(/<script[^>]+src="([^"]+)"/);
	return scriptMatch && scriptMatch[1];
}

const forumURL = url.parse(nconf.get('url'));
const uploadsURL = url.parse(url.resolve(nconf.get('url'), nconf.get('upload_url')));

function isInternalLink(target) {
	if (target.host !== forumURL.host || target.path.indexOf(forumURL.path) !== 0) {
		return false;
	}
	if (target.host !== uploadsURL.host || target.path.indexOf(uploadsURL.path) !== 0) {
		return true;
	}
	return false;
}

module.exports = iframely;
