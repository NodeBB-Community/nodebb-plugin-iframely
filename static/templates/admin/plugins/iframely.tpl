<form role="form" class="iframely-settings">
	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">API Settings</div>
		<div class="col-sm-10 col-xs-12">
			<div class="alert alert-info">
				<p>
					Use Iframely as a cloud or self-hosted <a href="https://github.com/itteco/iframely" target="_blank">open-source</a> API.
				</p>
				<p>
					Get API Key <a href="https://iframely.com" target="_blank">API key here</a>.
				</p>
			</div>
			<div class="form-group">
				<label for="endpoint">API key or address</label>
				<input type="text" id="endpoint" name="endpoint" title="API Key" class="form-control input-lg" placeholder="Your API Key or http:// endpoint" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Expand/collapse Iframely previews</div>
		<div class="col-sm-10 col-xs-12">
			<div class="form-group">
				<p>
					Iframely uses +/- vote to check when to expand URL previews and when to hide it.
				</p>
				<p>
					To always expand unvoted posts, set 0 as a minumum vote.
				</p>				
				<label for="expandOnVotesCount">
					Always expand previews when vote is over:
				</label>
				<input type="text" id="expandOnVotesCount" name="expandOnVotesCount" class="form-control" placeholder="0" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Previews for specific domains</div>
		<div class="col-sm-10 col-xs-12">
			<div class="form-group">
				<label for="expandDomains">Always expand previews for these domains:</label>
				<input type="text" id="expandDomains" name="expandDomains" class="form-control" placeholder="www.domain.com" />
			</div>
			<div class="form-group">
				<label for="collapseDomains">Always collapse previews for these domains</label>
				<input type="text" id="collapseDomains" name="collapseDomains" class="form-control" placeholder="www.domain.com" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Or ignore domains</div>
		<div class="col-sm-10 col-xs-12">
			<p>
				Iframely won't even try to parse URLs from these domains.
			</p>
			<div class="form-group">
				<label for="blacklist">Domains to skip:</label>
				<input type="text" id="blacklist" name="blacklist" class="form-control" placeholder="www.domain.com" />
			</div>
		</div>

	</div>

</form>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>