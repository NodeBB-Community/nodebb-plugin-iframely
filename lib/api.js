'use strict';

const undici = require('undici');

const { API_BASE } = require('./constants');
const logger = require('./logger');


const IframelyAPI = {};

IframelyAPI.query = async function (data, endpoint = '') {
	if (!endpoint) {
		logger.error('No API key or endpoint configured, skipping Iframely');
		return null;
	}

	const custom_endpoint = /^https?:\/\//i.test(endpoint);
	let iframelyAPI = custom_endpoint ? endpoint : `${API_BASE}&api_key=${endpoint}`;
	iframelyAPI += `${iframelyAPI.indexOf('?') > -1 ? '&' : '?'}url=${encodeURIComponent(data.url)}`;
	if (custom_endpoint) {
		iframelyAPI += '&group=true';
	}

	try {
		const response = await undici.request(iframelyAPI);
		if (response.statusCode === 404) {
			logger.verbose(`Not found: ${data.url}`);
			return null;
		}

		const json = await response.body.json();
		if (response.statusCode !== 200 || !json) {
			logger.verbose(`Iframely responded with error: ${JSON.stringify(json)}. Url: ${data.url}. Api call: ${iframelyAPI}`);
			return null;
		}

		if (!json.meta || !json.links) {
			logger.error(`Invalid Iframely API response. Url: ${data.url}. Api call: ${iframelyAPI}. Body: ${JSON.stringify(json)}`);
			return null;
		}

		return json;
	} catch (err) {
		logger.error(`Encountered error querying Iframely API: ${err.message}. Url: ${data.url}. Api call: ${iframelyAPI}`);
		return null;
	}
};

module.exports = IframelyAPI;
