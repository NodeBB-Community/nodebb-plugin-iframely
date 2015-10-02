"use strict";

(function() {

    $(document).ready(function() {
        $('body').on('click', '[data-iframely-embed]', function(e) {
            e.preventDefault();
            var $this = $(this);
            var text = $this.text();
            var $container = $this.parent().find('>div');

            if ($container.is(':visible')) {
                text = text.replace('[HIDE]', '[SHOW]');
                $this.text(text);
                $container.slideUp(200, function() {
                    $container.html('');
                });
            } else {
                text = text.replace('[SHOW]', '[HIDE]');
                $this.text(text);
                var html = $this.attr('data-iframely-embed');
                $container.html(html).slideDown(200);
            }
        });
    });
}());