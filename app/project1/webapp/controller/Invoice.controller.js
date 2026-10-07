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
        onInvoiceFilterChange: function () { 
            this._applyInvoiceFilters(); 
        },
        onInStatusFilterChange: function(){
             this._applyInvoiceFilters();
        },
            _applyInvoiceFilters: function () { 
             const oTable = this.byId("invoiceTable"); 
             var oBinding = oTable.getBinding("items"); 
             if (!oBinding) { 
                return; 
            } 
            var aFilters = []; 
            var aInvoiceCodeKeys = this.byId("invoiceFilter").getSelectedKeys(); 
            if (aInvoiceCodeKeys.length > 0) { 
                var aCodeFilters = aInvoiceCodeKeys.map(function (sKey) { 
                    return new Filter( "invoiceNumber", FilterOperator.EQ, sKey ); 
                }); 
                    aFilters.push( new Filter({ filters: aCodeFilters, and: false 

                    }) );
                 }
                   var aInvoiceNumberKeys = this.byId("inStatusFilter") .getSelectedKeys(); 
                  if (aInvoiceNumberKeys.length > 0) { 
                    var aNameFilters = aInvoiceNumberKeys.map(function (sKey) { 
                        return new Filter( "invoiceStatus", FilterOperator.EQ, sKey ); 
                    });
                     aFilters.push( new Filter({ 
                        filters: aNameFilters, and: false 
                    }) );
                 }            
             
                  oBinding.filter(aFilters); 
                },

    });
});