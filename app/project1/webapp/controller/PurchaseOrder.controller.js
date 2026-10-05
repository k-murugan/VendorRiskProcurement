sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent", "sap/m/MessageToast", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"
], (BaseController, UIComponent, MessageToast, Filter, FilterOperator) => {
    "use strict";

    return BaseController.extend("project1.controller.PurchaseOrder", {
        onInit() {
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
        async addPO() {
            if (!this.dialog) {
                this.dialog = await this.loadFragment({
                    name: "project1.view.PO"
                });
            }
            this.dialog.open();
        },
        onCloseDialog() {
            this.byId("Dialog")?.close();
        },
        onDeletePO: function () {
            const oTable = this.byId("poTable");
            const oSelectedItem = oTable.getSelectedItem();
            if (!oSelectedItem) {
                sap.m.MessageToast.show("Please select a PO to delete");
                return;
            }
            const oContext = oSelectedItem.getBindingContext();
            oContext.delete().then(() => {
                sap.m.MessageToast.show("PO deleted successfully");
                oTable.removeSelections(true);
            }).catch((oError) => {
                sap.m.MessageToast.show("Failed to delete PO")
            })
        },
        onPOPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext();

             if (!oContext) {
        MessageBox.error("Purchase Order context not found.");
        return;
    }
               var sPOPath = oContext.getPath();

    console.log("Selected PO path:", sPOPath);

    // Encode the complete OData path before putting it into the route
    var sEncodedPOPath = encodeURIComponent(sPOPath);

    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

    oRouter.navTo("POItem", {
        po: sEncodedPOPath
    });
}

    });
});