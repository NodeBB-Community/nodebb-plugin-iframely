"use strict";

(function() {

    $(document).ready(function() {
        $('body').on('click', '[data-iframely-embed]', function(e) {
            e.preventDefault();
            var $this = $(this);
            var text = $this.text();
            if (text.indexOf('[SHOW]') > -1) {
                text = text.replace('[SHOW]', '[HIDE]');
            } else {
                text = text.replace('[HIDE]', '[SHOW]');
            }
            $this.text(text);
            var html = $this.attr('data-iframely-embed');
            var $container = $this.parent().find('>div');
            $this.attr('data-iframely-embed', $container.html());
            $container.html(html);
        });
    });
}());