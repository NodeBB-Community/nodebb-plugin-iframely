<form role="form" class="iframely-settings">
	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Settings</div>
		<div class="col-sm-10 col-xs-12">
			<div class="alert alert-info">
				<p>
					If you have your own account with Iframely and with to use your own API key,
					you may enter it below.
				</p>
			</div>
			<div class="form-group">
				<label for="key">API Key</label>
				<input type="text" id="key" name="key" title="API Key" class="form-control input-lg" placeholder="API Key" />
			</div>
			<div class="checkbox">
				<label for="simple" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
					<input type="checkbox" class="mdl-switch__input" id="simple" name="simple" />
					<span class="mdl-switch__label">Simple Embed</span>
				</label>
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Domain Blacklist</div>
		<div class="col-sm-10 col-xs-12">
			<div class="form-group">
				<label for="blacklist">Blacklisted Domains</label>
				<input type="text" id="blacklist" name="blacklist" title="Blacklisted Domains" class="form-control" placeholder="domain1.com, domain2.com" />
			</div>
			<div class="checkbox">
				<label for="enableBlacklist" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
					<input type="checkbox" class="mdl-switch__input" id="enableBlacklist" name="enableBlacklist" />
					<span class="mdl-switch__label">Enable Blacklist</span>
				</label>
			</div>
		</div>
	</div>
</form>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>