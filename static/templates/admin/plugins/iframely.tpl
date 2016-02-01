<form role="form" class="iframely-settings">
	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">API Settings</div>
		<div class="col-sm-10 col-xs-12">
			<div class="alert alert-info">
				<p>
					Use Iframely as a cloud or self-hosted <a href="https://github.com/itteco/iframely" target="_blank">open-source</a> API.
				</p>
				<p>
					Get cloud <a href="https://iframely.com" target="_blank">API key here</a>.
				</p>
			</div>
			<div class="form-group">
				<label for="endpoint">API key or endpoint address:</label>
				<input type="text" id="endpoint" name="endpoint" title="API Key" class="form-control input-lg" placeholder="Your API Key or http:// endpoint" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Disable parsing on negative votes</div>
		<div class="col-sm-10 col-xs-12">
			<div class="form-group">
				<p>
					Iframely uses +/- vote to check when to parse URL to show previews.
				</p>
				<label for="doNoteParseIfVotesLessThen">
					Ignore URLs when +/- vote gets below this value (-10 by default):
				</label>
				<input type="text" id="doNoteParseIfVotesLessThen" name="doNoteParseIfVotesLessThen" class="form-control" placeholder="-10" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Or ignore some domains</div>
		<div class="col-sm-10 col-xs-12">
			<p>
				Iframely won't even try to parse URLs from these domains (e.g. your own domain makes sense here).
			</p>
			<div class="form-group">
				<label for="blacklist">Domains to skip:</label>
				<input type="text" id="blacklist" name="blacklist" class="form-control" placeholder="www.domain.com" />
			</div>
		</div>

	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Image Proxy</div>
		<div class="col-sm-10 col-xs-12">
			<div class="form-group">
				<p>
					Optional (but recommended) <a href="https://github.com/atmos/camo" target="_blank">Camo</a> server settings to proxy images under SSL and avoid hot-linking.
				</p>				
				<label for="endpoint">Camo Proxy Host:</label>
				<input type="text" id="camoProxyHost" name="camoProxyHost" class="form-control input-lg" placeholder="http://" />
			</div>
			<div class="form-group">
				<label for="endpoint">Camo Hash Key:</label>
				<input type="text" id="camoProxyKey" name="camoProxyKey" class="form-control input-lg" placeholder="" />
			</div>
		</div>
	</div>

</form>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>