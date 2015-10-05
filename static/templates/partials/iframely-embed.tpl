<div class="iframely-link">

	<a href="{url}" target="_blank" rel="nofollow">

		<!-- IF links.icon.length -->
		<!-- BEGIN links.icon -->
		<!-- IF @first -->
		<img src="{../href}" class="thumb pull-left" />
		<!-- ENDIF @first -->
		<!-- END links.icon -->
		<!-- ENDIF links.icon.length -->

		{domain}
	</a>

	<a href="{url}" class="toggle-embed" data-iframely-embed="{escaped_html}" rel="nofollow">{toggle_label}</a>
	<!-- IF !widget_html -->
	<div class="iframely-container" style="display: none;"></div>
	<!-- ENDIF !widget_html -->
	<!-- IF widget_html -->
	<div class="iframely-container">
		{widget_html}
	</div>
	<!-- ENDIF widget_html -->
</div>