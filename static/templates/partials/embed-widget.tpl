<div class="panel panel-default">
    <div class="panel-body">
        <div class="media iframely-embed">
            <!-- IF links.thumbnail.length -->
            <!-- BEGIN links.thumbnail -->
            <!-- IF @first -->
            <div class="media-left">
                <a href="{url}" target="_blank">
                    <img class="media-object" src="{links.thumbnail.href}" alt="{meta.title}" />
                </a>
            </div>
            <!-- ENDIF @first -->
            <!-- END links.thumbnail -->
            <!-- ENDIF links.thumbnail.length -->
            <div class="media-body">
                <h4 class="media-heading">
                    <a href="{url}" target="_blank">{meta.title}</a>
                </h4>
                <span class="text-muted">{meta.author}</span>
                <p class="description">{meta.description}</p>
            </div>

            <div class="media">
                {html}
            </divclass>
        </div>
    </div>
</div>