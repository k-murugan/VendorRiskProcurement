sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller, UIComponent,
    JSONModel,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend("project1.controller.POItem", {

      
        onInit: function () {

            var oView = this.getView();
            
            var oPOModel = new JSONModel({
                vendorId: "",
                currency: "INR",
                contractReference: "",
                expectedDeliveryDate: "",
                paymentTerms: "NET30",
                buyerId: "",
                remarks: "",
                totalAmount: 0,

                toItems: []
            });

            oView.setModel(oPOModel, "po");
               var oRouter = UIComponent.getRouterFor(this);

    // Listen for POItem route
    oRouter.getRoute("POItem").attachPatternMatched(
        this._onPORouteMatched,
        this
    );

            this._initializePO();
        },



        _initializePO: function () {

            var oModel = this.getView().getModel("po");

            oModel.setData({
                vendorId: "",
                currency: "INR",
                contractReference: "",
                expectedDeliveryDate: "",
                paymentTerms: "NET30",
                buyerId: "",
                remarks: "",
                totalAmount: 0,

                toItems: []
            });

            this._calculatePOTotal();
        },

        onAddItem: function () {

            var oModel = this.getView().getModel("po");

            var aItems = oModel.getProperty("/toItems") || [];

            var oNewItem = {
                materialCode: "",
                description: "",
                quantity: 1,
                unit: "EA",
                oldUnitPrice: 0,
                totalAmount: 0,
                requestedDeliveryDate: ""
            };

            aItems.push(oNewItem);

            oModel.setProperty("/toItems", aItems);

            this._calculatePOTotal();

            MessageToast.show("New item added");
        },


        // =========================================================
        // DELETE ITEM
        // =========================================================

        onDeleteItem: function (oEvent) {

            var oModel = this.getView().getModel("po");

            /*
             * Get the binding context of the selected row.
             */

            var oContext = oEvent
                .getSource()
                .getBindingContext("po");

            if (!oContext) {
                return;
            }

            var sPath = oContext.getPath();

            var iIndex = parseInt(
                sPath.split("/").pop(),
                10
            );

            var aItems = oModel.getProperty("/toItems");

            if (iIndex >= 0) {

                aItems.splice(iIndex, 1);

                oModel.setProperty(
                    "/toItems",
                    aItems
                );

                this._calculatePOTotal();

                MessageToast.show("Item deleted");
            }
        },


        // =========================================================
        // QUANTITY CHANGE
        // =========================================================

        onQuantityChange: function (oEvent) {

            var oInput = oEvent.getSource();

            var oContext = oInput.getBindingContext("po");

            if (!oContext) {
                return;
            }

            var oModel = this.getView().getModel("po");

            var sPath = oContext.getPath();

            var fQuantity = parseFloat(
                oEvent.getParameter("value")
            ) || 0;

            var fPrice = parseFloat(
                oModel.getProperty(
                    sPath + "/oldUnitPrice"
                )
            ) || 0;

            var fTotal = fQuantity * fPrice;

            /*
             * Update item total.
             */

            oModel.setProperty(
                sPath + "/quantity",
                fQuantity
            );

            oModel.setProperty(
                sPath + "/totalAmount",
                fTotal
            );

            /*
             * Recalculate PO total.
             */

            this._calculatePOTotal();
        },


        onPriceChange: function (oEvent) {

            var oInput = oEvent.getSource();

            var oContext = oInput.getBindingContext("po");

            if (!oContext) {
                return;
            }

            var oModel = this.getView().getModel("po");

            var sPath = oContext.getPath();

            var fPrice = parseFloat(
                oEvent.getParameter("value")
            ) || 0;

            var fQuantity = parseFloat(
                oModel.getProperty(
                    sPath + "/quantity"
                )
            ) || 0;

            var fTotal = fQuantity * fPrice;

            /*
             * Update price.
             */

            oModel.setProperty(
                sPath + "/oldUnitPrice",
                fPrice
            );

            /*
             * Update item total.
             */

            oModel.setProperty(
                sPath + "/totalAmount",
                fTotal
            );

            /*
             * Recalculate PO total.
             */

            this._calculatePOTotal();
        },


        // =========================================================
        // CALCULATE PO TOTAL
        // =========================================================

        _calculatePOTotal: function () {

            var oModel = this.getView().getModel("po");

            var aItems = oModel.getProperty("/toItems") || [];

            var fTotal = 0;

            aItems.forEach(function (oItem) {

                var fItemTotal =
                    parseFloat(oItem.totalAmount) || 0;

                fTotal += fItemTotal;
            });

            oModel.setProperty(
                "/totalAmount",
                fTotal
            );
        },


        // =========================================================
        // MATERIAL CHANGE
        // =========================================================

        onMaterialChange: function (oEvent) {

            var oComboBox = oEvent.getSource();

            var sMaterialCode =
                oComboBox.getSelectedKey();

            var oContext =
                oComboBox.getBindingContext("po");

            if (!oContext) {
                return;
            }

            var oModel =
                this.getView().getModel("po");

            var sPath =
                oContext.getPath();

            /*
             * Get the backend model containing Materials.
             */

            var oDataModel =
                this.getView().getModel();

            if (!oDataModel) {
                return;
            }

            /*
             * Find the selected material.
             */

            var aMaterials =
                oDataModel.getProperty("/Materials");

            if (!aMaterials) {
                return;
            }

            var oMaterial =
                aMaterials.find(function (oMaterial) {

                    return oMaterial.materialCode ===
                        sMaterialCode;

                });

            if (oMaterial) {

                oModel.setProperty(
                    sPath + "/materialCode",
                    oMaterial.materialCode
                );

                oModel.setProperty(
                    sPath + "/description",
                    oMaterial.materialName || ""
                );
            }
        },

       _onPORouteMatched: function (oEvent) {

    var oArguments = oEvent.getParameter("arguments");

    // Get encoded PO path
    var sEncodedPOPath = oArguments.po;

    if (!sEncodedPOPath) {
        MessageToast.show("Purchase Order ID not found");
        return;
    }

    // Decode the path
    var sPOPath = decodeURIComponent(sEncodedPOPath);

    console.log("PO path received:", sPOPath);

    // Example:
    // /PurchaseOrders(10000001)

    this._loadPurchaseOrder(sPOPath);
},
_loadPurchaseOrder: function (sPOPath) {

    var oODataModel = this.getView().getModel();

    if (!oODataModel) {
        MessageBox.error("OData model is not available.");
        return;
    }

    console.log("Loading PO:", sPOPath);

    oODataModel.read(
        sPOPath,
        {
            urlParameters: {
                "$expand": "toItems"
            },

            success: function (oData) {

                console.log("Purchase Order data:", oData);

                // Put backend PO data into local "po" model
                var oPOModel = this.getView().getModel("po");

                oPOModel.setData({
                    poNumber: oData.poNumber,
                    vendorId: oData.vendorId,
                    currency: oData.currency,
                    contractReference: oData.contractReference,
                    expectedDeliveryDate: oData.expectedDeliveryDate,
                    paymentTerms: oData.paymentTerms,
                    buyerId: oData.buyerId,
                    remarks: oData.remarks,
                    totalAmount: oData.totalAmount,

                    // Items from backend
                    toItems: oData.toItems?.results || []
                });

                console.log(
                    "PO loaded successfully:",
                    oPOModel.getData()
                );

            }.bind(this),

            error: function (oError) {

                console.error(
                    "Failed to load Purchase Order:",
                    oError
                );

                MessageBox.error(
                    "Failed to load Purchase Order."
                );
            }
        }
    );
},
        // =========================================================
        // SUBMIT PO
        // =========================================================

        onSubmit: function () {

            var oPOModel =
                this.getView().getModel("po");

            var oPO =
                oPOModel.getData();

            /*
             * Basic validation.
             */

            if (!oPO.poNumber) {

                MessageBox.error(
                    "Please select a PO Number."
                );

                return;
            }

            if (!oPO.currency) {

                MessageBox.error(
                    "Please select Currency."
                );

                return;
            }

            if (!oPO.expectedDeliveryDate) {

                MessageBox.error(
                    "Please select Expected Delivery Date."
                );

                return;
            }

            if (!oPO.paymentTerms) {

                MessageBox.error(
                    "Please select Payment Terms."
                );

                return;
            }

            if (!oPO.toItems ||
                oPO.toItems.length === 0) {

                MessageBox.error(
                    "Please add at least one order item."
                );

                return;
            }


            /*
             * Validate each item.
             */

            for (var i = 0; i < oPO.toItems.length; i++) {

                var oItem = oPO.toItems[i];

                if (!oItem.materialCode) {

                    MessageBox.error(
                        "Please select Material for item " +
                        (i + 1) + "."
                    );

                    return;
                }

                if (!oItem.quantity ||
                    oItem.quantity <= 0) {

                    MessageBox.error(
                        "Quantity must be greater than 0 for item " +
                        (i + 1) + "."
                    );

                    return;
                }

                if (!oItem.requestedDeliveryDate) {

                    MessageBox.error(
                        "Please select Requested Delivery Date for item " +
                        (i + 1) + "."
                    );

                    return;
                }
            }


            /*
             * Make sure total is up to date.
             */

            this._calculatePOTotal();

            /*
             * Confirmation.
             */

            MessageBox.confirm(
                "Submit this Purchase Order for approval?",
                {
                    title: "Submit Purchase Order",

                    onClose: function (sAction) {

                        if (sAction === MessageBox.Action.OK) {

                            this._createPurchaseOrder();

                        }

                    }.bind(this)
                }
            );
        },


        _createPurchaseOrder: function () {

            var oPOModel =
                this.getView().getModel("po");

            var oPO =
                oPOModel.getData();

            var oPayload = {
                vendorId: oPO.vendorId,
                currency: oPO.currency,
                contractReference: oPO.contractReference,
                expectedDeliveryDate: oPO.expectedDeliveryDate,
                paymentTerms: oPO.paymentTerms,
                buyerId: oPO.buyerId,
                remarks: oPO.remarks,
                totalAmount: oPO.totalAmount,

                toItems: oPO.toItems
            };

            var oODataModel =
                this.getView().getModel();

            if (!oODataModel) {

                MessageBox.error(
                    "OData model is not available."
                );

                return;
            }


            /*
             * IMPORTANT:
             *
             * The exact create path depends on your CAP
             * service/entity definition.
             *
             * Example:
             *
             * /PurchaseOrders
             */

            oODataModel.create(
                "/PurchaseOrders",
                oPayload,
                {

                    success: function (oData) {

                        MessageBox.success(
                            "Purchase Order created successfully.",
                            {
                                onClose: function () {

                                    this._initializePO();

                                }.bind(this)
                            }
                        );

                    }.bind(this),

                    error: function (oError) {

                        console.error(
                            "Purchase Order creation failed:",
                            oError
                        );

                        MessageBox.error(
                            "Failed to create Purchase Order."
                        );

                    }.bind(this)

                }
            );
        },


        // =========================================================
        // CANCEL
        // =========================================================

        onCancel: function () {

            MessageBox.confirm(
                "Are you sure you want to cancel this Purchase Order?",
                {
                    title: "Cancel Purchase Order",

                    onClose: function (sAction) {

                        if (
                            sAction ===
                            MessageBox.Action.OK
                        ) {

                            this._initializePO();

                            MessageToast.show(
                                "Purchase Order creation cancelled."
                            );
                        }

                    }.bind(this)
                }
            );
        }

    });

});