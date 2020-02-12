/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0, no-use-before-define:0 */
/*eslint-env node, es6 */
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel, MessageType, formatter, movementFactory) {
	"use strict"; 

	return BaseController.extend("web.manage-Shippers.controller.CarrierMasterHeader", {

		formatter: formatter,
		
		onInit: function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			this.oModel = oOwnerComponent.getModel();
			this.oRouter.getRoute("object").attachPatternMatched(this._onObjectMatched, this);

		},
		
		_onObjectMatched: function (oEvent) {
			
			var sObjectId = oEvent.getParameter("arguments").objectId;
			if (!sObjectId) {
				return;
			}
			
		},
		
		setUIChanges : function (bHasUIChanges) {
			var oData = {bHasUIChanges: bHasUIChanges};
	    	var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("setObjectUIChanges", "setObjectUIChanges", oData );
		},
		
	    _addMessage: function(iMessage, iMessageType) {
	    	var oData = {message: iMessage, messageType: iMessageType};
	    	var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("addObjectMessage", "addObjectMessage", oData );
	    },
	    _getText : function (sTextId, aArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
		},
		setLiveChanges: function(oEvent) {
			
			if (this.getView().getModel("appView").getProperty("/hasUIChanges") === false) {
				this.getView().getModel("appView").setProperty("/hasUIChanges", true);
				this.setUIChanges(true);
			} 
		}
	});

});

