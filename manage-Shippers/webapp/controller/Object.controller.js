sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter"
], function (BaseController, JSONModel, History, formatter) {
	"use strict";

	return BaseController.extend("web.manage-Shippers.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			
			// Retreive Global App view from base controller
			var oModel = this.getGlobalModel("appView"); 
			
			// Set App view to current view
			this.getView().setModel(oModel, "appView"); 
			
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("setAppView", "setAppView", this._eBusSetAppView, this);
			
			var oObjectPage = this.getView().byId("ObjectPageLayout");
			oObjectPage.setShowFooter(true);
			
		},
		
		_eBusSetAppView : function (sChannelId, sEventId, oData) {
			// Retreive Global App view from base controller
			var oModel = this.getGlobalModel("appView");
			
			// Set App view to current view
			this.getView().setModel(oModel, "appView");	
		},
		
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress : function () {
			var oViewModel = this.getGlobalModel("appView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object:{
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},


		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched : function (oEvent) {
			var sObjectId =  oEvent.getParameter("arguments").objectId;
			this._bindView("/Shippers" + sObjectId);
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView : function (sObjectPath) {
			var oViewModel = this.getGlobalModel("appView");

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange : function () {
			var oView = this.getView(),
				oViewModel = this.getGlobalModel("appView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			oView.getBindingContext().requestObject().then((function (oObject) {
				var sObjectId = oObject.UUID,
					sObjectName = oObject.ID;

				// Add the object page to the flp routing history
				this.addHistoryEntry({
					title: this.getResourceBundle().getText("objectTitle") + " - " + sObjectName,
					icon: "sap-icon://enter-more",
					intent: "#ManageShippers-display&/Shippers(" + sObjectId + ")"
				});

				oViewModel.setProperty("/busy", false);
				
			}).bind(this));
		}

	});

});