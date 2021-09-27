'use strict';

const { winston } = require('./nodebb');


module.exports = {
	verbose: msg => winston.verbose(`[plugin/iframely] ${msg}`),
	error: msg => winston.error(`[plugin/iframely] ${msg}`),
	warn: msg => winston.warn(`[plugin/iframely] ${msg}`),
};
