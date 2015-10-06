<div class="panel panel-default panel-iframely">
    <div class="panel-body">
        <div class="media iframely-embed">

            <!-- IF meta -->
            <div class="text-muted iframely-meta one-line">
                {meta}
            </div>
            <!-- ENDIF meta -->

            <!-- IF title -->
            <h4 class="media-heading">
                <a href="{embed.url}" target="_blank" rel="nofollow" class="one-line">{title}</a>
            </h4>
            <!-- ENDIF title -->

            <!-- IF embed.html -->
            <div class="media">
                {embed.html}
            </div>
            <!-- ENDIF embed.html -->

            <!-- IF description -->
            <p class="description">
                {description}
            </p>
            <!-- ENDIF description -->

            <!-- IF more_label -->
            <p class="description">
                <a href="{embed.url}" target="_blank" rel="nofollow">{more_label} {domain}</a>
            </p>
            <!-- ENDIF more_label -->

        </div>
    </div>
</div>