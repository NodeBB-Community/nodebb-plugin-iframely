<div class="iframely-link">
	<!-- IF links.icon.length -->
	<!-- BEGIN links.icon -->
	<!-- IF @first -->
	<img src="{../href}" class="thumb pull-left" />
	<!-- ENDIF @first -->
	<!-- END links.icon -->
	<!-- ENDIF links.icon.length -->
	<a href="{url}" data-iframely-embed="{escaped_html}">{url} [{toggle_label}]</a>
	<!-- IF !widget_html -->
	<div style="display: none;"></div>
	<!-- ENDIF !widget_html -->
	<!-- IF widget_html -->
	<div>
		{widget_html}
	</div>
	<!-- ENDIF widget_html -->
</div>