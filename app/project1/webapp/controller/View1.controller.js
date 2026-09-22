sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit: function () {
            const oModel = this.getOwnerComponent().getModel(); 
            console.log("OData Model:", oModel); 
            // Load dashboard counts 
            this._loadTotalVendor(oModel); 
            this._loadTotalPO(oModel); 
            this._loadTotalInvoice(oModel); 
        }, 
         _loadTotalVendor: function (oModel) { 
            const oOperation = oModel.bindContext( "/totalVendor(...)" ); 
            oOperation.invoke() .then(() => { 
                const oContext = oOperation.getBoundContext(); 
                const oResult = oContext.getObject(); 
                console.log( "Total Vendor Result:", oResult ); 
                const iValue = oResult.value ?? oResult; 
                console.log( "Total Vendors:", iValue ); 
                this.byId("vendorCount") .setValue(iValue); 
            }) .catch((oError) => { 
                console.error( "Error getting vendor count:", oError ); 
                MessageToast.show( "Unable to load vendor count" ); 
            }); 
        }, 
         _loadTotalPO: function (oModel) { 
            const oOperation = oModel.bindContext( "/totalPO(...)" ); 
            oOperation.invoke() .then(() => { 
                const oContext = oOperation.getBoundContext(); 
                const oResult = oContext.getObject(); 
                console.log( "Total PO Result:", oResult ); 
                const iValue = oResult.value ?? oResult; 
                console.log( "Total Purchase Orders:", iValue ); 
                this.byId("poCount") .setValue(iValue); 
            }) .catch((oError) => { 
                console.error( "Error getting PO count:", oError ); 
                MessageToast.show( "Unable to load PO count" ); 
            });
         }, 
         _loadTotalInvoice: function (oModel) { 
            const oOperation = oModel.bindContext( "/totalInvoice(...)" ); 
            oOperation.invoke() .then(() => { 
                const oContext = oOperation.getBoundContext(); 
                const oResult = oContext.getObject(); 
                console.log( "Total Invoice Result:", oResult ); 
                const iValue = oResult.value ?? oResult; 
                console.log( "Total Invoices:", iValue ); 
                this.byId("invoiceCount") .setValue(iValue); 
            }) .catch((oError) => { 
                console.error( "Error getting invoice count:", oError ); 
                MessageToast.show( "Unable to load invoice count" ); 
            });
         },
            // const oModel = this.getOwnerComponent().getModel(); 
            // console.log("OData Model:", oModel); 
            // const oOperation = oModel.bindContext("/totalVendor(...)"); 
            // oOperation.invoke().then(() => { 
            //     const oContext = oOperation.getBoundContext(); 
            //     console.log("Operation Context:", oContext); 
            //     const oResult = oContext.getObject(); 
            //     console.log("Operation Result:", oResult); 
            //     if (oResult !== undefined) { 
            //         const oValue = oResult.value ?? oResult; 
            //         console.log("Total Vendors:", oValue); 
            //         this.byId("vendorCount").setValue(oValue); 
            //     }
            //  }).catch((oError) => { 
            //     console.error("Error getting vendor count:", oError);
            //  });

            // const oModel = this.getOwnerComponent().getModel();

            // console.log("OData Model:", oModel);
            // this._loadVendorCount();
            // this._loadPOStatusCounts(oModel);


        // _loadPOStatusCounts: function (oModel) {

        //     const oFunction = oModel.bindContext(
        //         "/getPOStatusCounts(...)"
        //     );

        //     oFunction.execute()
        //         .then(() => {

        //             const oResult =
        //                 oFunction.getBoundContext().getObject();

        //             console.log(
        //                 "PO Status Counts Result:",
        //                 oResult
        //             );

        //             const aData = oResult.value || [];

        //             console.log(
        //                 "PO Status Chart Data:",
        //                 aData
        //             );

        //             // Example:
        //             // [
        //             //   { status: "APPROVED", count: 5 },
        //             //   { status: "DRAFT", count: 2 },
        //             //   { status: "REJECTED", count: 1 }
        //             // ]

        //             this._processPOStatusData(aData);
        //         })
        //         .catch((oError) => {

        //             console.error(
        //                 "Error loading PO status counts:",
        //                 oError
        //             );

        //             MessageToast.show(
        //                 "Unable to load PO status data"
        //             );
        //         });
        // },

        // _loadVendorCount: async function () { 
        //     try {

        //         const oModel = this.getView().getModel();

        //         const oBinding = oModel.bindContext(
        //             "/totalVendor(...)"
        //         );

        //         const oContext = await oBinding.requestObject();

        //         console.log("Total Vendors:", oContext);

        //         this.byId("vendorCount").setValue(
        //             oContext.value
        //         );

        //     } catch (oError) {

        //         console.error(
        //             "Error loading vendor count:",
        //             oError
        //         );

        //         MessageToast.show(
        //             "Unable to load vendor count"
        //         );

        //     }
        //  },
        // _processPOStatusData: function (aData) {

        //     console.log(
        //         "Processing PO Status Data:",
        //         aData
        //     );

        //     aData.forEach(function (oItem) {

        //         console.log(
        //             "Status:",
        //             oItem.status,
        //             "Count:",
        //             oItem.count
        //         );

        //     });

        
        // },

        // onSelectData: function (oEvent) {

        //     console.log(
        //         "Chart selection:",
        //         oEvent.getParameters()
        //     );
        // },

        onNavigationSelect: function (oEvent) {

            const oItem = oEvent.getParameter("item");
            const sKey = oItem.getKey();

            switch (sKey) {
                case "dashboard": 
                    this.getOwnerComponent() 
                        .getRouter() 
                        .navTo("View1"); 
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

                default:
                    MessageToast.show("Page not found");
            }
        }

    });
});