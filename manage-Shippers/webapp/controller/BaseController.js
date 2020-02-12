sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType"
], function (Controller, UIComponent, mobileLibrary, JSONModel, MessageToast, MessageBox, Filter, FilterOperator, FilterType) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return Controller.extend("web.manage-Shippers.controller.BaseController", {
		
		InitializeBase  : function () {
			
			var oMessageManager = sap.ui.getCore().getMessageManager();
			var oMessageModel = oMessageManager.getMessageModel();
			var oMessageModelBinding = oMessageModel.bindList("/", undefined, [], new Filter("technical", FilterOperator.EQ, true));
			oMessageModelBinding.attachChange(this.onMessageBindingChange, this);
			this.getOwnerComponent().setModel(oMessageModel, "message");
			//this.getView().setModel(oMessageModel, "message");
			
			var oModel = new JSONModel({busy : false, hasUIChanges : false, order : 0, carrierId: null});
			this.getOwnerComponent().setModel(oModel, "appView");
			//this.getView().setModel(oModel, "appView");
			this._bTechnicalErrors = false;
			
		},
		getText : function (sTextId, aArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
		},
		getGlobalModel : function (sName) {
			return this.getOwnerComponent().getModel(sName);
		},
		setGlobalModel : function (oModel, sName) {
			return this.getOwnerComponent().setModel(oModel, sName);
		},
		hideBusyIndicator : function() {
			sap.ui.core.BusyIndicator.hide();
		},
		showBusyIndicator : function (iDuration, iDelay) {
			sap.ui.core.BusyIndicator.show(iDelay);

			if (iDuration && iDuration > 0) {
				if (this._sTimeoutId) {
					clearTimeout(this._sTimeoutId);
					this._sTimeoutId = null;
				}

				this._sTimeoutId = setTimeout(function() {
					this.hideBusyIndicator();
				}.bind(this), iDuration);
			}
		},
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},
		
		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle : function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress : function () {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},
		
		onSave : function () {
			var fnSuccess = function () {
				this._setBusy(false);
				MessageToast.show(this._getText("changesSentMessage"));
				this.setUIChanges(false);
			}.bind(this);

			var fnError = function (oError) {
				this._setBusy(false);
				this.setUIChanges(false);
				MessageBox.error(oError.message);
			}.bind(this);

			this._setBusy(true); // Lock UI until submitBatch is resolved.
			this.getView().getModel().submitBatch("ShipperGroup").then(fnSuccess, fnError);
			this._bTechnicalErrors = false; // If there were technical errors, a new save resets them.
		},
		
		onMessageBindingChange : function (oEvent) {
			var aContexts = oEvent.getSource().getContexts(),
				aMessages,
				bMessageOpen = false;

			if (bMessageOpen || !aContexts.length) {
				return;
			}

			// Extract and remove the technical messages
			aMessages = aContexts.map(function (oContext) {
				return oContext.getObject();
			});
			sap.ui.getCore().getMessageManager().removeMessages(aMessages);

			this.setUIChanges(true);
			this._bTechnicalErrors = true;
			MessageBox.error(aMessages[0].message, {
				id : "serviceErrorMessageBox",
				onClose : function () {
					bMessageOpen = false;
				}
			});

			bMessageOpen = true;
		},
		
		_getText : function (sTextId, aArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);

		},
		
		onInputChange : function (oEvt) {
			if (oEvt.getParameter("escPressed")) {
				this.setUIChanges();
			} else {
				this.setUIChanges(true);
			}
		},
		
		setUIChanges : function (bHasUIChanges) {
			if (this._bTechnicalErrors) {
				// If there is currently a technical error, then force 'true'.
				bHasUIChanges = true;
			} else if (bHasUIChanges === undefined) {
				bHasUIChanges = this.getView().getModel().hasPendingChanges();
			}
			
			
			var oModel = this.getView().getModel("appView");
			if ( bHasUIChanges !== oModel.getProperty("/hasUIChanges")) {
				oModel.setProperty("/hasUIChanges", bHasUIChanges);
				this.setGlobalModel(oModel, "appView");
				
				var oData = {bHasUIChanges: bHasUIChanges};
				var oEventBus = sap.ui.getCore().getEventBus();
				oEventBus.publish("setAppView", "setAppView", oData );
			}
				
		},
		
		_setBusy : function (bIsBusy) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/busy", bIsBusy);
		},
		/**
		* Adds a history entry in the FLP page history
		* @public
		* @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
		* @param {boolean} bReset If true resets the history before the new entry is added
		*/
		addHistoryEntry: (function() {
			var aHistoryEntries = [];

			return function(oEntry, bReset) {
				if (bReset) {
					aHistoryEntries = [];
				}

			var bInHistory = aHistoryEntries.some(function(oHistoryEntry) {
				return oHistoryEntry.intent === oEntry.intent;
			});

				if (!bInHistory) {
					aHistoryEntries.push(oEntry);
					this.getOwnerComponent().getService("ShellUIService").then(function(oService) {
						oService.setHierarchy(aHistoryEntries);
					});
				}
			};
		})()
	});

});