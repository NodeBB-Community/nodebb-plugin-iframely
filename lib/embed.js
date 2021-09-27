'use strict';

const { wrapHtmlImages, wrapImage } = require('./camo');
const logger = require('./logger');
const { validator } = require('./nodebb');
const { getDate, getDuration, getViews, shortenText } = require('./utils');

/**
 * @param {*} embed
 * @returns {string}
 */
function getDomain(embed) {
	const domain = embed.meta.site;
	if (domain) {
		return domain;
	}

	const url = embed.meta.canonical;
	const m = url.match(/(?:https?:\/\/)?(?:www\.)?([^/]+)/i);
	return m ? m[1] : url;
}

/**
 * @param {*} embed
 * @returns {string | boolean}
 */
function getImage(embed) {
	if (!embed || !embed.links) {
		return '';
	}

	const image = (
		(embed.links.thumbnail &&
			embed.links.thumbnail.length &&
			embed.links.thumbnail[0]) ||

		(embed.links.image &&
			embed.links.image.length &&
			embed.links.image[0])
	);

	return image && image.href;
}

/**
 * @param {*} embed
 * @returns {string | boolean}
 */
function getIcon(embed) {
	const icon =
		embed &&
		embed.links &&
		embed.links.icon &&
		embed.links.icon.length &&
		embed.links.icon[0];

	return icon && icon.href;
}

/**
 * @param {string} html
 * @returns {string}
 */
function getScriptSrc(html) {
	const scriptMatch = html && html.match(/<script[^>]+src="([^"]+)"/);
	return scriptMatch && scriptMatch[1];
}

/**
 * @param {*} embed
 * @returns {string[]}
 */
function getMetadada(embed) {
	const metaInfo = [];

	if (embed.meta.author) {
		metaInfo.push(embed.meta.author);
	}

	const date = getDate(embed.meta.date);
	if (date) {
		metaInfo.push(date);
	}

	const currency = embed.meta.currency_code || embed.meta.currency;
	const price = embed.meta.price ? (embed.meta.price + (currency ? (` ${currency}`) : '')) : null;
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

	return metaInfo;
}

async function renderEmbed(app, html, embedData, { camoSettings = {}, isPreview = false } = {}) {
	const { embed, match, url, fromCache } = embedData;
	let { html: embedHtml } = embed;

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
	const hideWidgetForPreview = isPreview && fromCache;

	let generateCardWithImage = false;
	if (embedHtml && isSanitized) {
		// Render embedHtml.
	} else if (image) {
		// Render card with image.
		generateCardWithImage = image;
	} else {
		// No embed code, no image. Show link with title only.
		return app.renderAsync('partials/iframely-link-title', {
			title: embed.meta.title || url,
			embed: embed,
			icon: icon,
			url: url,
		})
			.then(parsed => html.replace(match, parsed))
			.catch((err) => {
				logger.error(`[plugin/iframely] Could not parse embed: ${err.message}. Url: ${url}`);
				return html;
			});
	}

	const metaInfo = generateCardWithImage ?
		getMetadada(embed) :
		[];

	embedHtml = wrapHtmlImages(embedHtml, camoSettings);

	const context = {
		show_title: false,
		domain: getDomain(embed),
		title: validator.escape(shortenText(embed.meta.title, 200)),
		description: validator.escape(shortenText(embed.meta.description, 300)),
		favicon: wrapImage(icon, camoSettings),
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

	if (generateCardWithImage) {
		context.widget_html = await app.renderAsync('partials/iframely-widget-card', context)
			.catch((err) => {
				logger.error(`[plugin/iframely] Could not parse embed: ${err.message}. Url: ${url}`);
				return false;
			});
	} else {
		context.widget_html = context.embedHtml;
	}

	if (hideWidgetForPreview && context.widget_html) {
		context.embedHtmlEscaped = validator.escape(context.widget_html);
	}

	return app.renderAsync('partials/iframely-widget-wrapper', context)
		.then(parsed => html.replace(match, parsed))
		.catch((err) => {
			logger.error(`[plugin/iframely] Could not parse embed! ${err.message}. Url: ${url}`);
			return html;
		});
}

module.exports = { renderEmbed };
