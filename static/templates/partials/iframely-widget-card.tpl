<div class="panel panel-default panel-iframely">
    <div class="panel-body">
        <div class="media iframely-embed">

            <!-- IF metaString -->
            <div class="text-muted iframely-meta one-line">
                {metaString}
            </div>
            <!-- ENDIF metaString -->

            <!-- IF title -->
            <h4 class="media-heading">
                <a href="{embed.url}" target="_blank" rel="nofollow" class="one-line">
                    <!-- IF favicon -->
                    <img src="{favicon}" class="thumb pull-left" />
                    <!-- ENDIF favicon -->
                    {title}
                </a>
            </h4>
            <!-- ENDIF title -->

            <!-- IF embedHtml -->
            <div class="media">
                {embedHtml}
            </div>
            <!-- ENDIF embedHtml -->

            <!-- IF description -->
            <p class="description">
                {description}
            </p>
            <!-- ENDIF description -->
        </div>
    </div>
</div>