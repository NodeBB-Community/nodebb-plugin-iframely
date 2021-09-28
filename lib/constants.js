'use strict';

const url = require('url');
const { nconf } = require('./nodebb');


module.exports = {
	HTML_REGEX: /(?:<p[^>]*>|<br\s*\/?>|^)<a.+?href="(.+?)".*?>(.*?)<\/a>(?:<br\s*\/?>|<\/p>)?/gm,

	ONE_DAY_MS: 1000 * 60 * 60 * 24,
	DEFAULT_CACHE_MAX_AGE_DAYS: 1,

	FORUM_URL: url.parse(nconf.get('url')),
	UPLOADS_URL: url.parse(url.resolve(nconf.get('url'), nconf.get('upload_url'))),

	API_BASE: 'https://iframe.ly/api/iframely?origin=nodebb&align=left',
};
