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
        }
    })
});