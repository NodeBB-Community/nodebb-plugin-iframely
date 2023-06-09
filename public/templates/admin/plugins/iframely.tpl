<div class="acp-page-container">
	<!-- IMPORT admin/partials/settings/header.tpl -->

	<div class="row m-0">
		<div id="spy-container" class="col-12 col-md-8 px-0 mb-4" tabindex="0">
			<form role="form" class="iframely-settings">
				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">API Settings</h5>

					<div class="">
						<div class="alert alert-info">
							<p>
								Use Iframely as a cloud or self-hosted <a href="https://github.com/itteco/iframely" target="_blank">open-source</a> API.
							</p>
							<p>
								Get cloud <a href="https://iframely.com" target="_blank">API key here</a>.
							</p>
						</div>
						<div class="mb-3">
							<label class="form-label" for="endpoint">API key or endpoint address:</label>
							<input type="text" id="endpoint" name="endpoint" title="API Key" class="form-control input-lg" placeholder="Your API Key or http:// endpoint" />
						</div>
						<div>
							<label class="form-label" for="endpoint">Cache Time-To-Live, days:</label>
							<input type="text" id="cacheMaxAgeDays" name="cacheMaxAgeDays" title="Cache Time-To-Live, days" class="form-control input-lg" placeholder="Number of days to keep Iframely API data in memory cache, default 1 day" />
						</div>
					</div>
				</div>

				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">Disable parsing on negative votes</h5>
					<div class="">
						<div>
							<p>
								Iframely uses +/- vote to check when to parse URL to show previews.
							</p>
							<label class="form-label" for="doNoteParseIfVotesLessThen">
								Ignore URLs when +/- vote gets below this value (-10 by default):
							</label>
							<input type="text" id="doNoteParseIfVotesLessThen" name="doNoteParseIfVotesLessThen" class="form-control" placeholder="-10" />
						</div>
					</div>
				</div>

				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">Or ignore some domains</h5>
					<div class="">
						<p>
							Iframely won't even try to parse URLs from these domains (e.g. your own domain makes sense here).
						</p>
						<div>
							<label class="form-label" for="blacklist">Domains to skip:</label>
							<input type="text" id="blacklist" name="blacklist" class="form-control"/>
						</div>
					</div>
				</div>

				<div class="">
					<h5 class="fw-bold tracking-tight settings-header">Image Proxy</h5>
					<div class="">
						<div class="mb-3">
							<p>
								Optional (but recommended) <a href="https://github.com/atmos/camo" target="_blank">Camo</a> server settings to proxy images under SSL and avoid hot-linking.
							</p>
							<label class="form-label" for="endpoint">Camo Proxy Host:</label>
							<input type="text" id="camoProxyHost" name="camoProxyHost" class="form-control input-lg" placeholder="http://" />
						</div>
						<div>
							<label class="form-label" for="endpoint">Camo Hash Key:</label>
							<input type="text" id="camoProxyKey" name="camoProxyKey" class="form-control input-lg" placeholder="" />
						</div>
					</div>
				</div>
			</form>
		</div>

		<!-- IMPORT admin/partials/settings/toc.tpl -->
	</div>
</div>
