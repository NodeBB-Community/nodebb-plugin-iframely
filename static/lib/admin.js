'use strict';
/* globals $, app, socket */

define('admin/plugins/iframely', ['settings'], function(Settings) {

	var ACP = {};

	ACP.init = function() {
		Settings.load('iframely', $('.iframely-settings'));

		$('#save').on('click', function() {
			Settings.save('iframely', $('.iframely-settings'), function() {
				app.alert({
					type: 'success',
					alert_id: 'iframely-saved',
					title: 'Settings Saved',
					message: 'Please reload your NodeBB to apply these settings',
					clickfn: function() {
						socket.emit('admin.reload');
					}
				});
			});
		});
	};

	return ACP;
});