/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0, no-use-before-define:0 */
/*eslint-env node, es6 */
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/ui/core/routing/History",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType"
], function (BaseController, JSONModel, MessageToast, MessageBox, Sorter, History, formatter, Filter, FilterOperator, FilterType) {
	"use strict";

	return BaseController.extend("web.manage-Shippers.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		
		/**
		 *  Hook for initializing the controller
		 */
		onInit : function () {
			
			this.InitializeBase();
			
			// Retreive Global App view from base controller
			var oModel = this.getGlobalModel("appView"); 
			
			// Set App view to current view
			this.getView().setModel(oModel, "appView"); 
			
			
			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#ManageShippers-display"
			}, true);
			
		},
		

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject : function (oItem) {
			var that = this;

			oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
				that.getRouter().navTo("object", {
					objectId_Old: oItem.getBindingContext().getProperty("UUID"),
					objectId : sObjectPath.slice("/Shippers".length) // /Products(3)->(3)
				});
			});
		},
		
		onInputChange: function () {
			this.setUIChanges();
		},
		
		onCreate : function () {
			var oList = this.byId("shipperList"),
				oBinding = oList.getBinding("items"),
				oContext = oBinding.create({
					"Company"	: "",
					"Symbol"	: ""
				});

			this.setUIChanges();

			oList.getItems().some(function (oItem) {
				if (oItem.getBindingContext() === oContext) {
					oItem.focus();
					oItem.setSelected(true);
					return true;
				}
			});
		},
		
		onDelete : function () {
			var oSelected = this.byId("shipperList").getSelectedItem();

			if (oSelected) {
				oSelected.getBindingContext().delete("$auto").then(function () {
					MessageToast.show(this._getText("deletionSuccessMessage"));
				}.bind(this), function (oError) {
					MessageBox.error(oError.message);
				});
			}
		},
		
		
		
		onRefresh : function () {
			var oBinding = this.byId("shipperList").getBinding("items");

			if (oBinding.hasPendingChanges()) {
				MessageBox.error(this._getText("refreshNotPossibleMessage"));
				return;
			}
			oBinding.refresh();
			MessageToast.show(this._getText("refreshSuccessMessage"));
		},
		
		onResetDataSource : function () {
			
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var that = this;
			MessageBox.information(
				this.getText("confirmResetShipperData"),
				{
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function(sAction) {
						if(sAction==='OK') {
							that.showBusyIndicator(120000, 0);
							fetch('../../shipexec2/refreshShipperData')
							.then((response) => {
								that.hideBusyIndicator();
								that.onRefresh();
							})
							.catch((error) => {
								that.hideBusyIndicator();
								that.onRefresh();
								console.error('Error:', error);
							});
						}
					}
				}
			);
		},
		
		onResetChanges : function () {
			this.byId("shipperList").getBinding("items").resetChanges();
			this._bTechnicalErrors = false; 
			this.setUIChanges();
		},
		
		onSearch : function () {
			var oView = this.getView(),
				sValue = oView.byId("searchField").getValue(),
				oFilter = new Filter("Company", FilterOperator.Contains, sValue);

			oView.byId("shipperList").getBinding("items").filter(oFilter, FilterType.Application);
		},

		onSort : function () {
			var oView = this.getView(),
				aStates = [undefined, "asc", "desc"],
				aStateTextIds = ["sortNone", "sortAscending", "sortDescending"],
				sMessage,
				iOrder = oView.getModel("appView").getProperty("/order");

			iOrder = (iOrder + 1) % aStates.length;
			var sOrder = aStates[iOrder];

			oView.getModel("appView").setProperty("/order", iOrder);
			oView.byId("shipperList").getBinding("items").sort(sOrder && new Sorter("Company", sOrder === "desc"));

			sMessage = this._getText("sortMessage", [this._getText(aStateTextIds[iOrder])]);
			MessageToast.show(sMessage);
		}

	});
});