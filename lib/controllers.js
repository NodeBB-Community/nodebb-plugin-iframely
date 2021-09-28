'use strict';

const Controllers = {};

Controllers.renderAdminPage = function (req, res) {
	res.render('admin/plugins/iframely', {});
};

module.exports = Controllers;
