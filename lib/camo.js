'use strict';

const crypto = require('crypto');


/**
 * @param {string} html
 * @param {{ key: string, host: string }} { key: camoProxyKey, host: camoProxyHost }
 * @returns {string}
 */
function wrapHtmlImages(html, { key, host }) {
	if (html && key && host) {
		return html.replace(/<img[^>]+src=["'][^'"]+["']/gi, (item) => {
			const m = item.match(/(<img[^>]+src=["'])([^'"]+)(["'])/i);
			const url = wrapImage(m[2]);
			return m[1] + url + m[3];
		});
	}
	return html;
}

/**
 * @param {string} url
 * @param {{ key: string, host: string }} { key: camoProxyKey, host: camoProxyHost }
 * @returns {string}
 */
function wrapImage(url, { key, host }) {
	if (url && key && host && url.indexOf(host) === -1) {
		const hexDigest = crypto.createHmac('sha1', key).update(url).digest('hex');
		const hexEncodedPath = Buffer.from(url).toString('hex');

		return [
			host.replace(/\/$/, ''),	// Remove tail '/'
			hexDigest,
			hexEncodedPath,
		].join('/');
	}

	return url;
}

module.exports = { wrapHtmlImages, wrapImage };
