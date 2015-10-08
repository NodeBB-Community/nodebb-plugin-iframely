<div class="iframely-link">

	<div>
		<a href="{embed.url}" target="_blank" rel="nofollow">

			<!-- IF favicon -->
			<img src="{favicon}" class="thumb pull-left" />
			<!-- ENDIF favicon -->

			{domain}
		</a>

		<a href="{embed.url}" class="toggle-embed no-select" data-iframely-embed="{escaped_html}" data-show-label="{show_label}" data-hide-label="{hide_label}" rel="nofollow">{toggle_label}</a>
	</div>

	<!-- IF !widget_html -->
	<div class="iframely-container" style="display: none;"></div>
	<!-- ENDIF !widget_html -->
	<!-- IF widget_html -->
	<div class="iframely-container">
		{widget_html}
	</div>
	<!-- ENDIF widget_html -->
</div>