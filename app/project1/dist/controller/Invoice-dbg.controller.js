sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (
    Controller,
    Filter,
    FilterOperator,
    MessageToast
) {
    "use strict";

    return Controller.extend("project1.controller.Invoice", {

        onInit: function () {
        },

        onInvoiceFilterChange: function () {
        },
        onDeleteInvoice: function () {
            const oTable = this.byId("invoiceTable");
            const oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                sap.m.MessageToast.show("Please select an invoice to delete.");
                return;
            }

            const oContext = oSelectedItem.getBindingContext();

            oContext.delete().then(() => {
                sap.m.MessageToast.show("Invoice deleted successfully.");
                oTable.removeSelections(true);
            }).catch((oError) => {
                console.error("Delete failed:", oError);
                sap.m.MessageToast.show("Failed to delete invoice.");
            });
        },
        onpoFilterChange: function () { 
            this._applyPOFilters(); 
        },
            _applyPOFilters: function () { 
             const oTable = this.byId("poTable"); 
             var oBinding = oTable.getBinding("items"); 
             if (!oBinding) { 
                return; 
            } 
            var aFilters = []; 
            var aPOCodeKeys = this.byId("poFilter").getSelectedKeys(); 
            if (aPOCodeKeys.length > 0) { 
                var aCodeFilters = aPOCodeKeys.map(function (sKey) { 
                    return new Filter( "poNumber", FilterOperator.EQ, sKey ); 
                }); 
                    aFilters.push( new Filter({ filters: aCodeFilters, and: false 

                    }) );
                 }           
             
                  oBinding.filter(aFilters); 
                },

    });
});