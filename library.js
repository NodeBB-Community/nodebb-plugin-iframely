'use strict';

const LRU = require('lru-cache');
const url = require('url');

const api = require('./lib/api');
const { DEFAULT_CACHE_MAX_AGE_DAYS, HTML_REGEX, ONE_DAY_MS } = require('./lib/constants');
const controllers = require('./lib/controllers');
const embed = require('./lib/embed');
const logger = require('./lib/logger');
const { lodash, meta, postCache, routesHelpers } = require('./lib/nodebb');
const { getIntValue, isInternalLink } = require('./lib/utils');


let app;

/**
 * @type {{ cache: LRU<string, any>, config: any }}
 */
const iframely = {
	cache: null,
	config: undefined,
};

iframely.init = async function (params) {
	app = params.app;

	const { router, middleware } = params;
	routesHelpers.setupAdminPageRoute(router, `/admin/plugins/iframely`, middleware, [], controllers.renderAdminPage);

	const config = await meta.settings.get('iframely');
	config.blacklist = (config.blacklist && config.blacklist.split(',')) || [];

	iframely.config = config;

	const cacheMaxAgeDays = Math.max(getIntValue(config.cacheMaxAgeDays), DEFAULT_CACHE_MAX_AGE_DAYS);
	iframely.cache = new LRU({
		maxAge: cacheMaxAgeDays * ONE_DAY_MS,
	});
};

/**
 * Called on `action:settings.set`
 */
iframely.updateConfig = async function (data) {
	if (data.plugin === 'iframely') {
		logger.verbose('Config updated');

		postCache.reset();

		data.settings.blacklist = data.settings.blacklist.split(',');
		iframely.config = data.settings;
	}
};

/**
 * Called on `filter:admin.header.build`
 */
iframely.addAdminNavigation = async function (header) {
	header.plugins.push({
		route: '/plugins/iframely',
		icon: 'fa-link',
		name: 'Iframely',
	});
	return header;
};

/**
 * Called on `filter:parse.raw` and `filter:parse.post`
 */
iframely.replace = async function (raw, options = {}) {
	if (raw && typeof raw !== 'string' && raw.hasOwnProperty('postData') && raw.postData.hasOwnProperty('content')) {
		/**
		 *	If a post object is received (`filter:parse.post`),
		 *	instead of a plain string, call self.
		 */
		raw.postData.content = await iframely.replace(raw.postData.content, {
			votes: getIntValue(raw.postData.votes),
			isPost: true,
		});
		return raw;
	}

	// Skip parsing post with negative votes.
	if (options && options.isPost) {
		const votes = getIntValue(options.votes, 0);
		if (votes < getIntValue(iframely.config.doNoteParseIfVotesLessThen, -10)) {
			return raw;
		}
	}

	const urls = getExternalNotBlacklistedLinksFromText(raw);
	const isPreview = !options || !options.isPost;

	try {
		for (const chunk of lodash.chunk(urls, 10)) {
			// eslint-disable-next-line no-await-in-loop
			const parsedEmbeds = await Promise.all(chunk.map(data => iframely.query(data)));
			const embeds = parsedEmbeds.filter(Boolean);

			for (const embedData of embeds) {
				// eslint-disable-next-line no-await-in-loop
				raw = await embed.renderEmbed(
					app, raw, embedData,
					{ camoSettings: { key: iframely.config.camoProxyKey, host: iframely.config.camoProxyHost }, isPreview }
				);
			}
		}
	} catch (err) {
		logger.error(`[plugin/iframely] Could not parse embed! ${err.message}. Urls: ${urls}`);
	}

	return raw;
};

iframely.query = async function (data) {
	if (iframely.cache.has(data.url)) {
		logger.verbose(`Retrieving '${data.url}' from cache...`);

		return {
			url: data.url,
			match: data.match,
			embed: iframely.cache.get(data.url),
			fromCache: true,
		};
	}

	logger.verbose(`Querying '${data.url}' via Iframely...`);

	const embedData = await api.query(data, iframely.config.endpoint);
	iframely.cache.set(data.url, embedData);
	return {
		url: data.url,
		match: data.match,
		embed: embedData,
		fromCache: false,
	};
};

/**
 * @param {string} host
 * @returns {boolean}
 */
function hostInBlacklist(host) {
	return iframely.config.blacklist && iframely.config.blacklist.includes(host);
}

/**
 * @param {string} raw
 * @returns {Set<string>}
 */
function getExternalNotBlacklistedLinksFromText(raw) {
	const urls = [];
	const urlsDict = {};

	// Isolate matches
	while (true) {
		const match = HTML_REGEX.exec(raw);
		if (!match) {
			break;
		}

		// Eliminate trailing slashes for comparison purposes
		[1, 2].forEach((key) => {
			if (match[key].endsWith('/')) {
				match[key] = match[key].slice(0, -1);
			}
		});

		const [fullmatch, link, anchor] = match;

		// Only match if it is a naked link (no anchor text)
		let target;
		try {
			target = url.parse(link);
		} catch (err) {
			continue; // eslint-disable-line no-continue
		}

		const isLinkLikeAnchor = link === anchor || link === encodeURI(anchor) || target.host + target.path === anchor;
		if (isLinkLikeAnchor && !hostInBlacklist(target.host) && !(link in urlsDict) && !isInternalLink(target)) {
			// Also eliminate duplicates and internal links
			urlsDict[link] = true;
			urls.push({
				match: fullmatch,
				url: link,
			});
		}
	}

	return urls;
}

module.exports = iframely;
