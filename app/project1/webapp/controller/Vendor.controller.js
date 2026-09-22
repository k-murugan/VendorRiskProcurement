sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("project1.controller.Vendor", {
        onInit() {
            
        },
        async addVendor() {
            if (!this.dialog) {
                this.dialog = await this.loadFragment({
                    name: "project1.view.VendorForm"
                    // id: this.getView().getId()
                });
            }
 
            this.dialog.open();
        },
        onCloseDialog() {
            this.byId("helloDialog")?.close();
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