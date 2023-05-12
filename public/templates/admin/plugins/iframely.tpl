<form role="form" class="iframely-settings">
	<div class="row mb-4">
		<div class="col-sm-2 col-12 settings-header">API Settings</div>
		<div class="col-sm-10 col-12">
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

	<div class="row mb-4">
		<div class="col-sm-2 col-12 settings-header">Disable parsing on negative votes</div>
		<div class="col-sm-10 col-12">
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

	<div class="row mb-4">
		<div class="col-sm-2 col-12 settings-header">Or ignore some domains</div>
		<div class="col-sm-10 col-12">
			<p>
				Iframely won't even try to parse URLs from these domains (e.g. your own domain makes sense here).
			</p>
			<div>
				<label class="form-label" for="blacklist">Domains to skip:</label>
				<input type="text" id="blacklist" name="blacklist" class="form-control" placeholder="www.domain.com" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-12 settings-header">Image Proxy</div>
		<div class="col-sm-10 col-12">
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

<!-- IMPORT admin/partials/save_button.tpl -->