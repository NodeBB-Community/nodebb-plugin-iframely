<div class="panel panel-default panel-iframely">
    <div class="panel-body">
        <div class="media iframely-embed">

            <div class="text-muted iframely-meta">
                {embed.meta.author}

                <!-- IF date -->
                &nbsp;&nbsp;/&nbsp;&nbsp;

                {date}
                <!-- ENDIF date -->
            </div>

            <h4 class="media-heading">
                <a href="{embed.url}" target="_blank" rel="nofollow" class="title">{embed.meta.title}</a>
            </h4>

            <div class="media">
                {embed.html}
            </div>

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