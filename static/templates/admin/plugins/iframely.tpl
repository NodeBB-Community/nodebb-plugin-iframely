<div class="row">
	<div class="col-sm-2 col-xs-12 settings-header">Settings</div>
	<div class="col-sm-10 col-xs-12">
		<div class="alert alert-info">
			<p>
				If you have your own account with Iframely and with to use your own API key,
				you may enter it below.
			</p>
		</div>
		<form role="form" class="iframely-settings">
			<div class="form-group">
				<label for="key">API Key</label>
				<input type="text" id="key" name="key" title="API Key" class="form-control input-lg" placeholder="API Key">
			</div>
			<div class="checkbox">
				<label for="simple" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
					<input type="checkbox" class="mdl-switch__input" id="simple" name="simple" />
					<span class="mdl-switch__label">Simple Embed</span>
				</label>
			</div>
		</form>
	</div>
</div>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>