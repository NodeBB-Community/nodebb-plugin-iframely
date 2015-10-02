<form role="form" class="iframely-settings">
	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Settings</div>
		<div class="col-sm-10 col-xs-12">
			<div class="alert alert-info">
				<p>
					If you have your own account with Iframely and with to use your own API key,
					you may enter it below.
				</p>
				<p>
					You can retritve own API key <a href="https://iframely.com">here</a>.
				</p>
			</div>
			<div class="form-group">
				<label for="key">API Key</label>
				<input type="text" id="key" name="key" title="API Key" class="form-control input-lg" placeholder="API Key" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Widgets Settings</div>
		<div class="col-sm-10 col-xs-12">
			<div class="form-group">
				<select class="form-control" name="mode">
					<option value="alwaysExpand">Always Show Expanded Widget</option>
					<option value="alwaysCollapse">Always Collapse Widget And Show Preview With 'Expand' Button</option>
				</select>
			</div>
			<div class="form-group">
				<label for="expandDomains">Always Expand Widget On Domains</label>
				<input type="text" id="expandDomains" name="expandDomains" title="expandDomains" class="form-control" placeholder="domain.com" />
			</div>
			<div class="form-group">
				<label for="collapseDomains">Always Collapse Widget On Domains</label>
				<input type="text" id="collapseDomains" name="collapseDomains" title="collapseDomains" class="form-control" placeholder="domain.com" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">[[iframely:blacklisted_domains]]</div>
		<div class="col-sm-10 col-xs-12">
			<div class="checkbox">
				<label for="enableBlacklist" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
					<input type="checkbox" class="mdl-switch__input" id="enableBlacklist" name="enableBlacklist" />
					<span class="mdl-switch__label">Enable Blacklist</span>
				</label>
			</div>
			<div class="form-group">
				<label for="blacklist">Blacklisted Domains</label>
				<input type="text" id="blacklist" name="blacklist" title="Blacklisted Domains" class="form-control" placeholder="domain.com" />
			</div>
		</div>
	</div>
</form>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>