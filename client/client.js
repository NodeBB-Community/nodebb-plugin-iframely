'use strict';

/* global iframely */

$(document).ready(function () {
	$(window).on('action:ajaxify.end action:posts.loaded action:composer.preview', function () {
		/**
		 * Iframely requires to call `iframely.load();` after widgets loaded to page.
		 * `action:ajaxify.end`         - triggered when posts rendered on page.
		 * `action:posts.loaded`        - triggered when you are on a topic page and a new post is sent to the client.
		 * `action:composer.preview`    - triggered when new preview rendered in composer.
		 * In both cases Iframely need to initialize widgets.
		 */
		iframely.load();
	});

	$(window).on('action:composer.preview', function () {
		/**
		 * This logic prevents widget flickering while editing post in composer.
		 * When user opens post editor, widget will be collapsed and `click to prevew` button will be shown.
		 * Click event on that button will show widget expanded.
		 * Click button rendered in template:
		 * `static/templates/partials/iframely-widget-wrapper.tpl`
		 */
		$('.iframely-container a[data-iframely-show-preview]').one('click', function (e) {
			e.stopPropagation();
			var $parent = $(this).parent();
			var html = $parent.attr('data-html');
			$parent.html(html);
			return false;
		});
	});
});



