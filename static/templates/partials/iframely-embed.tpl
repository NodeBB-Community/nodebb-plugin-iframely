<div class="iframely-link">
	<!-- IF links.icon.length -->
	<!-- BEGIN links.icon -->
	<!-- IF @first -->
	<img src="{../href}" class="thumb pull-left" />
	<!-- ENDIF @first -->
	<!-- END links.icon -->
	<!-- ENDIF links.icon.length -->
	<a href="{url}">{domain}</a>
	<a href="{url}" class="toggle-embed" data-iframely-embed="{escaped_html}">{toggle_label}</a>
	<!-- IF !widget_html -->
	<div style="display: none;"></div>
	<!-- ENDIF !widget_html -->
	<!-- IF widget_html -->
	<div class="iframely-container">
		{widget_html}
	</div>
	<!-- ENDIF widget_html -->
</div>