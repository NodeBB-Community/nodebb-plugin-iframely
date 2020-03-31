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
                <a href="{url}" target="_blank" rel="nofollow noreferrer noopener" class="one-line">
                    <!-- IF favicon -->
                    <img src="{favicon}" class="thumb pull-left not-responsive" />
                    <!-- ENDIF favicon -->
                    {title}
                </a>
            </h4>
            <!-- ENDIF title -->

            <!-- IF image -->
            <div class="media">
                <a href="{url}" target="_blank" rel="nofollow noreferrer noopener">
                    <img src="{image}" alt="{title}" />
                </a>
            </div>
            <!-- ENDIF image -->

            <!-- IF description -->
            <p class="description">
                {description}
            </p>
            <!-- ENDIF description -->
        </div>
    </div>
</div>
