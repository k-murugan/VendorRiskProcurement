sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit() {
        },
            onNavigationSelect: function (oEvent) {

            const oItem = oEvent.getParameter("item");
            const sKey = oItem.getKey();

            switch (sKey) {

                case "dashboard":
                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("dashboard");
                    break;

                case "Vendor":
                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("Vendor");
                    break;

                case "purchaseOrders":
                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("PurchaseOrder");
                    break;

                case "invoices":
                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("Invoice");
                    break;

                case "risk":
                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("risk");
                    break;

                case "compliance":
                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("compliance");
                    break;

                case "approvals":
                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("approvals");
                    break;

                case "settings":
                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("settings");
                    break;

                default:
                    MessageToast.show("Page not found");
            }
        }
    });
});