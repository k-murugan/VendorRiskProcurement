sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast", "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit: function () {
            const oModel = this.getOwnerComponent().getModel();
            console.log("OData Model:", oModel);
                   var oChartModel = new JSONModel({
                VendorStatus: []
            });

            this.getView().setModel(
                oChartModel,
                "vendorChart"
            );

            this._loadVendorStatusChart();
              var oPOChartModel = new JSONModel({
                poStatus: []
            });

            this.getView().setModel(
                oPOChartModel,
                "poChart"
            );

            // Load PO Status chart
            this._loadPOStatusChart();
            this._loadTotalVendor(oModel);
            this._loadTotalPO(oModel);
            this._loadTotalInvoice(oModel);
        },

            _loadVendorStatusChart: async function () {

            try {

                var oModel = this.getOwnerComponent().getModel();

                var oListBinding = oModel.bindList("/Vendors");

                var aContexts = await oListBinding.requestContexts();

                var aVendors = aContexts.map(function (oContext) {
                    return oContext.getObject();
                });

                console.log("Vendors:", aVendors);

                // Count vendors by status
                var oStatusCount = {};

                aVendors.forEach(function (oVendor) {

                    var sStatus = oVendor.vendorStatus;

                    if (!sStatus) {
                        sStatus = "UNKNOWN";
                    }

                    if (!oStatusCount[sStatus]) {
                        oStatusCount[sStatus] = 0;
                    }

                    oStatusCount[sStatus]++;
                });

                // Convert object to chart array
                var aChartData = Object.keys(oStatusCount).map(function (sStatus) {

                    return {
                        status: sStatus,
                        count: oStatusCount[sStatus]
                    };

                });

                console.log("Vendor Status Chart:", aChartData);

                // Set chart model
                this.getView()
                    .getModel("vendorChart")
                    .setProperty(
                        "/VendorStatus",
                        aChartData
                    );

            } catch (oError) {

                console.error(
                    "Failed to load vendor status chart:",
                    oError
                );

                MessageToast.show(
                    "Unable to load vendor status chart"
                );
            }
        },
            _loadPOStatusChart: async function () {

            try {

                const oModel = this.getOwnerComponent().getModel();

                console.log(
                    "Loading Purchase Orders..."
                );

                // Bind to PurchaseOrders entity
                var oListBinding = oModel.bindList(
                    "/PurchaseOrders"
                );

                // Read PO records
                var aContexts =
                    await oListBinding.requestContexts();

                var aPurchaseOrders =
                    aContexts.map(function (oContext) {
                        return oContext.getObject();
                    });

                console.log(
                    "Purchase Orders:",
                    aPurchaseOrders
                );


                // ==========================================
                // Count PO statuses
                // ==========================================

                var oStatusCount = {};

                aPurchaseOrders.forEach(function (oPO) {

                    var sStatus = oPO.poStatus;

                    // If status is empty
                    if (!sStatus) {
                        sStatus = "UNKNOWN";
                    }

                    // Initialize count
                    if (!oStatusCount[sStatus]) {
                        oStatusCount[sStatus] = 0;
                    }

                    // Increment count
                    oStatusCount[sStatus]++;
                });


              
                var aPOChartData =
                    Object.keys(oStatusCount).map(
                        function (sStatus) {

                            return {
                                status: sStatus,
                                count: oStatusCount[sStatus]
                            };

                        }
                    );


                console.log(
                    "PO Chart Data:",
                    aPOChartData
                );


                // ==========================================
                // Set data to poChart model
                // ==========================================

                this.getView()
                    .getModel("poChart")
                    .setProperty(
                        "/poStatus",
                        aPOChartData
                    );


            } catch (oError) {

                console.error(
                    "Failed to load PO status chart:",
                    oError
                );

                MessageToast.show(
                    "Unable to load Purchase Order chart"
                );
            }
        },
   
        onVendorPress: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("Vendor");
        },

        onPurchaseOrderPress: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("PurchaseOrder");
        },

        onInvoicePress: function () {
            this.getOwnerComponent()
                .getRouter()
                .navTo("Invoice");
        },
        onVendorRisk: function(){
            this.getOwnerComponent()
                .getRouter()
                .navTo("vendorRisk")
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
                console.log( "Total PO:", iValue ); 
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
                console.log( "Total Invoice:", iValue ); 
                this.byId("invoiceCount") .setValue(iValue); 
            }) .catch((oError) => { 
                console.error( "Error getting invoice count:", oError ); 
                MessageToast.show( "Unable to load invoice count" ); 
            }); 
        }, 
      


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

        // onNavigationSelect: function (oEvent) {

        //     const oItem = oEvent.getParameter("item");
        //     const sKey = oItem.getKey();

        //     switch (sKey) {
        //         case "dashboard":
        //             this.getOwnerComponent()
        //                 .getRouter()
        //                 .navTo("View1");
        //             break;

        //         case "Vendor":
        //             this.getOwnerComponent()
        //                 .getRouter()
        //                 .navTo("Vendor");
        //             break;

        //         case "purchaseOrders":
        //             this.getOwnerComponent()
        //                 .getRouter()
        //                 .navTo("PurchaseOrder");
        //             break;

        //         case "invoices":
        //             this.getOwnerComponent()
        //                 .getRouter()
        //                 .navTo("Invoice");
        //             break;

        //         default:
        //             MessageToast.show("Page not found");
        //     }
        // }

    });
});