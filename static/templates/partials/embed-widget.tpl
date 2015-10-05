<div class="panel panel-default panel-iframely">
    <div class="panel-body">
        <div class="media iframely-embed">

            <div class="text-muted iframely-meta">
                {meta.author}

                <!-- IF date -->
                &nbsp;&nbsp;/&nbsp;&nbsp;

                {date}
                <!-- ENDIF date -->
            </div>

            <h4 class="media-heading">
                <a href="{url}" target="_blank">{meta.title}</a>
            </h4>

            <div class="media">
                {html}
            </div>

            <!-- IF description -->
            <p>
                {description}
            </p>
            <!-- ENDIF description -->

            <a href="{url}" target="_blank">read on {domain}</a>

        </div>
    </div>
</div>