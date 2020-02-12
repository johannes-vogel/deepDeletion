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

	return BaseController.extend("web.manage-Shippers.controller.CarrierList", {
		
		onInit: function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			this.oModel = oOwnerComponent.getModel();
			this.oRouter.getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			
		},
		
		_onObjectMatched: function (oEvent) {
			
			if (oEvent) {
				this.sObjectId = oEvent.getParameter("arguments").objectId;
			}
			
			// build filter array
			var aFilter = [];
			aFilter.push(new Filter("Shipper_UUID", FilterOperator.EQ, this.sObjectId));
			var oList = this.byId("carrierList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},
		
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},
		_showObject : function (oItem) {
			this.carrierId = oItem.getBindingContext().getProperty("Id");
			this.objectId = oItem.getBindingContext().getProperty("UUID");
			
			var that = this;
			that.oRouter.navTo("CarrierMaster", {
				//objectId: oItem.getBindingContext().oBinding.oContext.getProperty("UUID"), 
				carrierId: this.carrierId,
				objectId: this.objectId
			});
		},
		
		onCreate: function ()  {
			var oList = this.byId("carrierList"),
				oBinding = oList.getBinding("items"),
				oContext = oBinding.create({
					"Shipper_UUID"	: this.sObjectId.replace(/[{()}]/g, ''),
					"Id"			: "",
					"Name"			: "",
					"Symbol"		: ""
				});

			this.setUIChanges();

			oList.getItems().some(function (oItem) {
				if (oItem.getBindingContext() === oContext) {
					oItem.focus();
					oItem.setSelected(true);
					return true;
				}
			});
		}

	});

});