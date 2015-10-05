<div class="panel panel-default panel-iframely">
    <div class="panel-body">
        <div class="media iframely-embed">

            <div class="text-muted iframely-meta one-line">
                {embed.meta.author}

                <!-- IF date -->
                &nbsp;&nbsp;/&nbsp;&nbsp;
                {date}
                <!-- ENDIF date -->

                <!-- IF price -->
                &nbsp;&nbsp;/&nbsp;&nbsp;
                {price}
                <!-- ENDIF price -->

                <!-- IF duration -->
                &nbsp;&nbsp;/&nbsp;&nbsp;
                {duration}
                <!-- ENDIF duration -->

                <!-- IF views -->
                &nbsp;&nbsp;/&nbsp;&nbsp;
                {views} views
                <!-- ENDIF views -->

                <!-- IF category -->
                &nbsp;&nbsp;/&nbsp;&nbsp;
                {category}
                <!-- ENDIF category -->

            </div>

            <h4 class="media-heading">
                <a href="{embed.url}" target="_blank" rel="nofollow" class="one-line">{embed.meta.title}</a>
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