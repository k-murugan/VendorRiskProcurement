sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("project1.controller.Vendor", {
        onInit() {
            const oModel = this.getOwnerComponent().getModel(); 
            console.log("OData Model:", oModel); 
            const oOperation = oModel.bindContext("/totalVendor(...)"); 
            oOperation.invoke().then(() => { 
                const oContext = oOperation.getBoundContext(); 
                console.log("Operation Context:", oContext); 
                const oResult = oContext.getObject(); 
                console.log("Operation Result:", oResult); 
                if (oResult !== undefined) { 
                    const oValue = oResult.value ?? oResult; 
                    console.log("Total Vendors:", oValue); 
                    this.byId("vendorCount").setNumber(oValue); 
                }
             }).catch((oError) => { 
                console.error("Error getting vendor count:", oError);
             });
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
        }
    })
});