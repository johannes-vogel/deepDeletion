sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, Device, MessageBox, MessageToast, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("web.manage-Shippers.controller.ServiceList", {
		
		onInit: function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			this.oModel = oOwnerComponent.getModel();
			this.oRouter.getRoute("CarrierMaster").attachPatternMatched(this._onObjectMatched, this);
		},
		
		_onObjectMatched: function (oEvent) {
			
			if (oEvent) {
				this.sCarrierId = oEvent.getParameter("arguments").carrierId;
				this.sObjectId = oEvent.getParameter("arguments").objectId;
			}
			
			// build filter array
			var aFilter = [];
			aFilter.push(new Filter("CarrierId", FilterOperator.EQ, this.sCarrierId));
			var oList = this.byId("ServiceList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},
		
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},
		_showObject : function (oItem) {
			var that = this;
			that.oRouter.navTo("Service", {
				objectId: oItem.getBindingContext().getProperty("UUID")
			});
		}

	});

});