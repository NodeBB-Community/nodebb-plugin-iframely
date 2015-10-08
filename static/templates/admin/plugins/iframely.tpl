<form role="form" class="iframely-settings">
	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">[[iframely:api-settings-section]]</div>
		<div class="col-sm-10 col-xs-12">
			<div class="alert alert-info">
				<p>
					[[iframely:api-settings-info-1]]
				</p>
				<p>
					[[iframely:api-settings-info-2]]
				</p>
			</div>
			<div class="form-group">
				<label for="endpoint">[[iframely:api-key-or-address-label]]</label>
				<input type="text" id="endpoint" name="endpoint" class="form-control input-lg" placeholder="[[iframely:api-key-or-address-placeholder]]" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">Camo Proxy</div>
		<div class="col-sm-10 col-xs-12">
			<div class="form-group">
				<label for="endpoint">camoProxyHost</label>
				<input type="text" id="camoProxyHost" name="camoProxyHost" class="form-control input-lg" placeholder="camoProxyHost" />
			</div>
			<div class="form-group">
				<label for="endpoint">camoProxyKey</label>
				<input type="text" id="camoProxyKey" name="camoProxyKey" class="form-control input-lg" placeholder="camoProxyKey" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">[[iframely:expand-on-votes-section]]</div>
		<div class="col-sm-10 col-xs-12">
			<div class="form-group">
				<p>
					[[iframely:expand-on-votes-info-1]]
				</p>
				<p>
					[[iframely:expand-on-votes-info-2]]
				</p>				
				<label for="expandOnVotesCount">
					[[iframely:expand-on-votes-label]]
				</label>
				<input type="text" id="expandOnVotesCount" name="expandOnVotesCount" class="form-control" placeholder="0" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">[[iframely:domains-settings-section]]</div>
		<div class="col-sm-10 col-xs-12">
			<div class="form-group">
				<label for="expandDomains">[[iframely:domains-expand-label]]</label>
				<input type="text" id="expandDomains" name="expandDomains" class="form-control" placeholder="www.domain.com" />
			</div>
			<div class="form-group">
				<label for="collapseDomains">[[iframely:domains-collapse-label]]</label>
				<input type="text" id="collapseDomains" name="collapseDomains" class="form-control" placeholder="www.domain.com" />
			</div>
		</div>
	</div>

	<div class="row">
		<div class="col-sm-2 col-xs-12 settings-header">[[iframely:blacklist-domains-section]]</div>
		<div class="col-sm-10 col-xs-12">
			<p>
				[[iframely:blacklist-domains-info]]
			</p>
			<div class="form-group">
				<label for="blacklist">[[iframely:blacklist-domains-label]]</label>
				<input type="text" id="blacklist" name="blacklist" class="form-control" placeholder="www.domain.com" />
			</div>
		</div>

	</div>

</form>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>