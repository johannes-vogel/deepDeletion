/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"web/manage-Shippers/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});