sap.ui.define([
    "sap/ui/core/mvc/Controller","sap/m/MessageBox","sap/m/MessageToast", "sap/ui/core/UIComponent",
    "sap/ui/model/Filter", "sap/ui/model/FilterOperator"
], (Controller, MessageBox, MessageToast, UIComponent, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("project1.controller.Vendor", {
        onInit() {
            
        },
        onVendorFilterChange: function () { 
            this._applyVendorFilters(); 
        },
        onVendorNameFilterChange: function () { 
            this._applyVendorFilters(); 
        },
        onVendorCategoryFilterChange: function () { 
            this._applyVendorFilters(); 
        },
        onVendorRiskFilterChange: function () { 
            this._applyVendorFilters(); 
        },
        _applyVendorFilters: function () { 
             const oTable = this.byId("vendorTable"); 
             var oBinding = oTable.getBinding("items"); 
             if (!oBinding) { 
                return; 
            } 
            var aFilters = []; 
            var aVendorCodeKeys = this.byId("vendorFilter") .getSelectedKeys(); 
            if (aVendorCodeKeys.length > 0) { 
                var aCodeFilters = aVendorCodeKeys.map(function (sKey) { 
                    return new Filter( "vendorCode", FilterOperator.EQ, sKey ); 
                }); 
                    aFilters.push( new Filter({ filters: aCodeFilters, and: false 

                    }) );
                 } 
                  var aVendorNameKeys = this.byId("vendorNameFilter") .getSelectedKeys(); 
                  if (aVendorNameKeys.length > 0) { 
                    var aNameFilters = aVendorNameKeys.map(function (sKey) { 
                        return new Filter( "vendorName", FilterOperator.EQ, sKey ); 
                    });
                     aFilters.push( new Filter({ 
                        filters: aNameFilters, and: false 
                    }) );
                 } 
                  var aCategoryKeys = this.byId("vendorCategoryFilter") .getSelectedKeys(); 
                  if (aCategoryKeys.length > 0) { 
                    var aCategoryFilters = aCategoryKeys.map(function (sKey) { 
                        return new Filter( "vendorCategory", FilterOperator.EQ, sKey );
                     }); 
                     aFilters.push( new Filter({ filters: aCategoryFilters, and: false 

                     }) );
                     } 
                     var aRiskKeys = this.byId("vendorRiskFilter") .getSelectedKeys(); 
                     if (aRiskKeys.length > 0) { 
                        var aRiskFilters = aRiskKeys.map(function (sKey) { 
                            return new Filter( "riskLevel", FilterOperator.EQ, sKey ); 
                        }); 
                        aFilters.push( new Filter({ filters: aRiskFilters, and: false }) 
                    );
                 } 
                  oBinding.filter(aFilters); 
                },
        async addVendor() {
            if (!this.dialog) {
                this.dialog = await this.loadFragment({
                    name: "project1.view.VendorForm"
                });
            }
 
            this.dialog.open();
        },

        onCloseDialog() {
            this.byId("helloDialog")?.close();
        },
        onVendorPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext();
            if (!oContext) {
                MessageBox.error("Vendor context not found.");
                return;
            }
            var sVenPath = oContext.getPath();
            console.log("Selected Vendor path:", sVenPath);
            var sEncodedVenPath = encodeURIComponent(sVenPath);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("VendorObject", {
                ven: sEncodedVenPath
            });
        },

        onDeleteVendor: function(){
            const oTable = this.byId("vendorTable");
            const oSelectedItem = oTable.getSelectedItem();
            if(!oSelectedItem){
                sap.m.MessageToast.show("Please select a vendor to delete");
                return;
            }
            const oContext = oSelectedItem.getBindingContext();
            oContext.delete().then(()=>{
                sap.m.MessageToast.show("Vendor Successfully Deleted");
                oTable.removeSelections(true);
            }).catch((oError)=>{
                sap.m.MessageToast.show("Failed to delete vendor");
            })
        }
    })
});