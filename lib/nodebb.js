'use strict';

module.exports = {
	async: require.main.require('async'),
	lodash: require.main.require('lodash'),
	nconf: require.main.require('nconf'),
	validator: require.main.require('validator'),
	winston: require.main.require('winston'),

	meta: require.main.require('./src/meta'),
	postCache: require.main.require('./src/posts/cache'),
	routesHelpers: require.main.require('./src/routes/helpers'),
};
