'use strict';

const { FORUM_URL, UPLOADS_URL } = require('./constants');
const { meta, moment } = require('./nodebb');


/**
 * @param {any} value
 * @param {number} defaultValue
 * @returns {number}
 */
function getIntValue(value, defaultValue = 0) {
	const intValue = parseInt(value, 10);
	if (typeof intValue === 'number' && !isNaN(intValue)) {
		return intValue;
	}
	return defaultValue;
}

/**
 * @param {string} value
 * @param {number} maxlength
 * @returns {string}
 */
function shortenText(value, maxlength = 130) {
	if (!value) {
		return '';
	}

	let result = `${value}`;
	const maxsize = maxlength || 130;

	if (result.length <= maxsize) {
		return result;
	}

	result = result.substr(0, maxlength);

	const m = result.match(/(.*)[. ,/-]/);
	if (m) {
		result = m[1];
		return `${m[1]}...`;
	}

	return `${result}...`;
}

/**
 * @param {number} duration
 * @returns {string}
 */
function getDuration(duration) {
	if (!duration) {
		return '';
	}

	let seconds = duration % 60;
	let minutes = Math.floor((duration - seconds) / 60);
	const hours = Math.floor(minutes / 60);
	minutes %= 60;

	if (seconds < 10) {
		seconds = `0${seconds}`;
	}

	if (minutes < 10) {
		minutes = `0${minutes}`;
	}

	return `${(hours ? (`${hours}:`) : '') + minutes}:${seconds}`;
}

/**
 * @param {number} x
 * @returns {string}
 */
function numberWithCommas(x) {
	const parts = x.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
	return parts.join('.');
}

/**
 * @param {number} views
 * @returns {string}
 */
function getViews(views) {
	if (!views) {
		return '';
	}
	if (views > 1000000) {
		return `${numberWithCommas((views / 1000000).toFixed(1))}Mln`;
	}
	if (views > 1000) {
		return `${numberWithCommas((views / 1000).toFixed(1))}K`;
	}
	return numberWithCommas(views);
}

/**
 * @param {string | Date} input
 * @returns {string}
 */
function getDate(input) {
	if (!input) {
		return '';
	}

	const date = new Date(input);
	if (!date || isNaN(date.getTime())) {
		return '';
	}

	const language = meta.config.defaultLang || 'en_GB';
	let result = moment(date).locale(language).format('MMM D');
	if (date.getFullYear() !== new Date().getFullYear()) {
		result = `${result}, ${date.getFullYear()}`;
	}

	return result;
}

/**
 * @param {import('url').UrlWithStringQuery} target
 * @returns {boolean}
 */
function isInternalLink(target) {
	if (target.host !== FORUM_URL.host || target.path.indexOf(FORUM_URL.path) !== 0) {
		return false;
	}
	if (target.host !== UPLOADS_URL.host || target.path.indexOf(UPLOADS_URL.path) !== 0) {
		return true;
	}
	return false;
}

module.exports = {
	getIntValue,
	shortenText,
	getDuration,
	getViews,
	getDate,
	isInternalLink,
};
