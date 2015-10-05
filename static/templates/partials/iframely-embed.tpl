<div class="iframely-link">

	<div>
		<a href="{embed.url}" target="_blank" rel="nofollow">

			<!-- IF embed.links.icon.length -->
			<!-- BEGIN embed.links.icon -->
			<!-- IF @first -->
			<img src="{../href}" class="thumb pull-left" />
			<!-- ENDIF @first -->
			<!-- END embed.links.icon -->
			<!-- ENDIF embed.links.icon.length -->

			{domain}
		</a>

		<a href="{embed.url}" class="toggle-embed" data-iframely-embed="{escaped_html}" data-show-label="{show_label}" data-hide-label="{hide_label}" rel="nofollow">{toggle_label}</a>
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