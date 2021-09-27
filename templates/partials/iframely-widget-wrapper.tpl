<div class="iframely-link">

	<!-- IF show_title -->
	<div>
		<a href="{embed.meta.canonical}" target="_blank" rel="nofollow noreferrer noopener">

			<!-- IF favicon -->
			<img src="{favicon}" class="thumb pull-left not-responsive" />
			<!-- ENDIF favicon -->

			{title}
		</a>
	</div>
	<!-- ENDIF show_title -->

	<!-- IF widget_html -->
		<div class="iframely-container">
			<!-- IF embedIsImg -->
				<a href="{url}" target="_blank" rel="nofollow noreferrer noopener">
					{widget_html}
				</a>
			<!-- ELSE -->

				<!-- IF hideWidgetForPreview -->
					<div data-html="{embedHtmlEscaped}">
						[<a href="{embed.meta.canonical}" target="_blank" rel="nofollow noreferrer noopener">{domain}</a>:
						<!-- IF title -->
						{title},
						<!-- ENDIF title -->
						<a href="#" data-iframely-show-preview>click to preview</a>]
					</div>

				<!-- ELSE -->
					{widget_html}
				<!-- ENDIF hideWidgetForPreview -->

			<!-- ENDIF embedIsImg -->
		</div>
	<!-- ENDIF widget_html -->

</div>