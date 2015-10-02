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
		<div class="col-sm-2 col-xs-12 settings-header">Widgets Default Settings</div>
		<div class="col-sm-10 col-xs-12">
			<p>
				<strong>Expanded Widget</strong> - is widget from iframely. It is iframe with embedded content inside: image, player, app etc. May take time to load.
			</p>
			<p>
				<strong>Collapsed Widget</strong> - is NodeBB rendered widget card with title and thumbnail. This wiget is loaded faster. User may click 'Expand' button to load and see Expanded Widget.
			</p>
			<p>
				You may select if you want all widgets to be expanded or collapsed by default.
			</p>
			<div class="form-group">
				<select class="form-control" name="mode">
					<option value="alwaysExpand">Always Show Expanded Widget</option>
					<option value="alwaysCollapse">Always Collapse Widget And Show Preview With 'Expand' Button</option>
				</select>
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Domains exclusions</div>
		<div class="col-sm-10 col-xs-12">
			<p>
				Also you may add exclusions for what to expand or to collapse depending on url domain.
			</p>
			<div class="form-group">
				<label for="expandDomains">Always Expand Widget On Domains</label>
				<input type="text" id="expandDomains" name="expandDomains" class="form-control" placeholder="domain.com" />
			</div>
			<div class="form-group">
				<label for="collapseDomains">Always Collapse Widget On Domains</label>
				<input type="text" id="collapseDomains" name="collapseDomains" class="form-control" placeholder="domain.com" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Post Voting</div>
		<div class="col-sm-10 col-xs-12">
			<div class="checkbox">
				<p>
					Whether to expand widget if post have particular count of votes or more.
				</p>
				<label for="expandOnVotes" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
					<input type="checkbox" class="mdl-switch__input" id="expandOnVotes" name="expandOnVotes" />
					<span class="mdl-switch__label">Expand Widget on Votes Count</span>
				</label>
				<input type="text" id="expandOnVotesCount" name="expandOnVotesCount" class="form-control" placeholder="1" />
			</div>
			<div class="checkbox">
				<p>
					Whether to collapse widget if post have particular count of votes or less.
				</p>
				<label for="collapseOnVotes" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
					<input type="checkbox" class="mdl-switch__input" id="collapseOnVotes" name="collapseOnVotes" />
					<span class="mdl-switch__label">Collapse Widget on Votes Count</span>
				</label>
				<input type="text" id="collapseOnVotesCount" name="collapseOnVotesCount" class="form-control" placeholder="-1" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">[[iframely:blacklisted_domains]]</div>
		<div class="col-sm-10 col-xs-12">
			<p>
				Domains Blaclist allows you to disable parsing and showing any widgets for particular domains.
			</p>
			<div class="checkbox">
				<label for="enableBlacklist" class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
					<input type="checkbox" class="mdl-switch__input" id="enableBlacklist" name="enableBlacklist" />
					<span class="mdl-switch__label">Enable Blacklist</span>
				</label>
			</div>
			<div class="form-group">
				<label for="blacklist">Blacklisted Domains</label>
				<input type="text" id="blacklist" name="blacklist" class="form-control" placeholder="domain.com" />
			</div>
		</div>
	</div>
</form>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>