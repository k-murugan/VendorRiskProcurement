sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("project1.controller.View1", {

        onInit: function () {

            const oModel = this.getOwnerComponent().getModel();

            console.log("OData Model:", oModel);

            this._loadPOStatusCounts(oModel);
        },

        _loadPOStatusCounts: function (oModel) {

            const oFunction = oModel.bindContext(
                "/getPOStatusCounts(...)"
            );

            oFunction.execute()
                .then(() => {

                    const oResult =
                        oFunction.getBoundContext().getObject();

                    console.log(
                        "PO Status Counts Result:",
                        oResult
                    );

                    const aData = oResult.value || [];

                    console.log(
                        "PO Status Chart Data:",
                        aData
                    );

                    // Example:
                    // [
                    //   { status: "APPROVED", count: 5 },
                    //   { status: "DRAFT", count: 2 },
                    //   { status: "REJECTED", count: 1 }
                    // ]

                    this._processPOStatusData(aData);
                })
                .catch((oError) => {

                    console.error(
                        "Error loading PO status counts:",
                        oError
                    );

                    MessageToast.show(
                        "Unable to load PO status data"
                    );
                });
        },

        _processPOStatusData: function (aData) {

            console.log(
                "Processing PO Status Data:",
                aData
            );

            aData.forEach(function (oItem) {

                console.log(
                    "Status:",
                    oItem.status,
                    "Count:",
                    oItem.count
                );

            });

            // The data is now available here.
            // MDC Chart itself cannot directly consume
            // this plain array without a model/binding setup.
        },

        onSelectData: function (oEvent) {

            console.log(
                "Chart selection:",
                oEvent.getParameters()
            );
        },

        onNavigationSelect: function (oEvent) {

            const oItem = oEvent.getParameter("item");
            const sKey = oItem.getKey();

            switch (sKey) {

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

                default:
                    MessageToast.show("Page not found");
            }
        }

    });
});