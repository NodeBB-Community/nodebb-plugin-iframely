<div class="iframely-link">

	<!-- IF show_title -->
	<div>
		<a href="{embed.meta.canonical}" target="_blank" rel="nofollow">

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
				<a href="{url}" target="_blank" rel="nofollow">
					{widget_html}
				</a>
			<!-- ELSE -->

				<!-- IF hideWidgetForPreview -->

					<script>
						function showIframelyPreview(that) {
							var $parent = $(that).parent();
							var html = $parent.attr('data-html');
							$parent.html(html);
							return false;
						}
					</script>
					<div data-html="{embedHtmlEscaped}">
						[<a href="{embed.meta.canonical}" target="_blank">{domain}</a>:
						<!-- IF title -->
						{title},
						<!-- ENDIF title -->
						<a href="#" onclick="return showIframelyPreview(this);">click to preview</a>]
					</div>

				<!-- ELSE -->
					{widget_html}
				<!-- ENDIF hideWidgetForPreview -->

			<!-- ENDIF embedIsImg -->
		</div>
	<!-- ENDIF widget_html -->

</div>