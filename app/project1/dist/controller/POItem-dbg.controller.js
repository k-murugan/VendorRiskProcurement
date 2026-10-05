sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    UIComponent,
    JSONModel,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend("project1.controller.POItem", {

        onInit: function () {

            var oView = this.getView();

            var oPOModel = new JSONModel({
                poId: "",
                poNumber: "",
                vendorId: "",
                currency: "INR",
                contractReference: "",
                expectedDeliveryDate: "",
                paymentTerms: "NET30",
                buyerId: "",
                remarks: "",
                totalAmount: 0,
                poStatus: "",
                toItems: [],

                // Form is read-only initially
                editMode: false
            });

            oView.setModel(oPOModel, "po");

            var oRouter = UIComponent.getRouterFor(this);

            oRouter.getRoute("POItem").attachPatternMatched(
                this._onPORouteMatched,
                this
            );
        },


        // =========================================================
        // ROUTE MATCHED
        // =========================================================

        _onPORouteMatched: function (oEvent) {
            var oArguments = oEvent.getParameter("arguments");
            var sPOPath = oArguments.po;
            if (!sPOPath) {
                MessageBox.error("Purchase Order path not found.");
                return;
            }          
            sPOPath = decodeURIComponent(sPOPath);
            if (sPOPath.charAt(0) !== "/") {
                sPOPath = "/" + sPOPath;
            }
            console.log("PO path received:", sPOPath);
            this._loadPurchaseOrder(sPOPath);
        },

        _loadPurchaseOrder: async function (sPOPath) {
            try {
                console.log("Loading PO:", sPOPath);
                var oODataModel = this.getView().getModel();
                if (!oODataModel) {
                    MessageBox.error(
                        "OData model is not available."
                    );
                    return;
                }
                 var oContext = oODataModel.bindContext(
            sPOPath,
            null,
            {
                "$expand": "toItems"
            }
        );

                var oPO = await oContext.requestObject();

                console.log(
                    "Purchase Order data received:",
                    oPO
                );

                if (!oPO) {

                    MessageBox.error(
                        "Purchase Order not found."
                    );

                    return;
                }


                // =================================================
                // GET ITEMS
                // =================================================

                var aItems = [];

                if (oPO.toItems) {

                    /*
                     * Depending on the CAP/OData V4 response,
                     * toItems may already be an array.
                     */

                    if (Array.isArray(oPO.toItems)) {

                        aItems = oPO.toItems;

                    } else if (oPO.toItems.value) {

                        aItems = oPO.toItems.value;
                    }
                }


                // =================================================
                // SET LOCAL PO MODEL
                // =================================================

                var oPOModel = this.getView().getModel("po");

                oPOModel.setData({

                    poId: oPO.ID || "",

                    poNumber: oPO.poNumber || "",

                    vendorId: oPO.vendorId || "",

                    currency: oPO.currency || "INR",

                    contractReference:
                        oPO.contractReference || "",

                    expectedDeliveryDate:
                        oPO.expectedDeliveryDate || "",

                    paymentTerms:
                        oPO.paymentTerms || "NET30",

                    buyerId:
                        oPO.buyerId || "",

                    remarks:
                        oPO.remarks || "",

                    totalAmount:
                        parseFloat(oPO.totalAmount) || 0,

                    poStatus:
                        oPO.poStatus || "",

                    toItems: aItems,

                    // Read-only when page opens
                    editMode: false
                });


                console.log(
                    "PO model updated:",
                    oPOModel.getData()
                );

                MessageToast.show(
                    "Purchase Order loaded successfully."
                );

            } catch (oError) {

                console.error(
                    "Failed to load Purchase Order:",
                    oError
                );

                MessageBox.error(
                    "Failed to load Purchase Order."
                );
            }
        },


        // =========================================================
        // EDIT
        // =========================================================

        onEdit: function () {

            var oModel = this.getView().getModel("po");

            oModel.setProperty(
                "/editMode",
                true
            );

            MessageToast.show(
                "Edit mode enabled."
            );
        },


        // =========================================================
        // CANCEL EDIT
        // =========================================================

        onCancelEdit: function () {

            var oModel = this.getView().getModel("po");

            oModel.setProperty(
                "/editMode",
                false
            );

            MessageToast.show(
                "Edit cancelled."
            );
        },


        // =========================================================
        // ADD ITEM
        // =========================================================

        onAddItem: function () {

            var oModel =
                this.getView().getModel("po");

            var aItems =
                oModel.getProperty("/toItems") || [];

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

            oModel.setProperty(
                "/toItems",
                aItems
            );

            this._calculatePOTotal();

            MessageToast.show(
                "New item added."
            );
        },


        // =========================================================
        // DELETE ITEM
        // =========================================================

        onDeleteItem: function (oEvent) {

            var oModel =
                this.getView().getModel("po");

            var oContext =
                oEvent
                    .getSource()
                    .getBindingContext("po");

            if (!oContext) {
                return;
            }

            var sPath =
                oContext.getPath();

            var iIndex =
                parseInt(
                    sPath.split("/").pop(),
                    10
                );

            var aItems =
                oModel.getProperty("/toItems");

            if (
                iIndex >= 0 &&
                iIndex < aItems.length
            ) {

                aItems.splice(
                    iIndex,
                    1
                );

                oModel.setProperty(
                    "/toItems",
                    aItems
                );

                this._calculatePOTotal();

                MessageToast.show(
                    "Item deleted."
                );
            }
        },


        // =========================================================
        // QUANTITY CHANGE
        // =========================================================

        onQuantityChange: function (oEvent) {

            var oInput =
                oEvent.getSource();

            var oContext =
                oInput.getBindingContext("po");

            if (!oContext) {
                return;
            }

            var oModel =
                this.getView().getModel("po");

            var sPath =
                oContext.getPath();

            var fQuantity =
                parseFloat(
                    oEvent.getParameter("value")
                ) || 0;

            var fPrice =
                parseFloat(
                    oModel.getProperty(
                        sPath + "/oldUnitPrice"
                    )
                ) || 0;

            var fTotal =
                fQuantity * fPrice;

            oModel.setProperty(
                sPath + "/quantity",
                fQuantity
            );

            oModel.setProperty(
                sPath + "/totalAmount",
                fTotal
            );

            this._calculatePOTotal();
        },


        // =========================================================
        // PRICE CHANGE
        // =========================================================

        onPriceChange: function (oEvent) {

            var oInput =
                oEvent.getSource();

            var oContext =
                oInput.getBindingContext("po");

            if (!oContext) {
                return;
            }

            var oModel =
                this.getView().getModel("po");

            var sPath =
                oContext.getPath();

            var fPrice =
                parseFloat(
                    oEvent.getParameter("value")
                ) || 0;

            var fQuantity =
                parseFloat(
                    oModel.getProperty(
                        sPath + "/quantity"
                    )
                ) || 0;

            var fTotal =
                fQuantity * fPrice;

            oModel.setProperty(
                sPath + "/oldUnitPrice",
                fPrice
            );

            oModel.setProperty(
                sPath + "/totalAmount",
                fTotal
            );

            this._calculatePOTotal();
        },


        // =========================================================
        // CALCULATE TOTAL
        // =========================================================

        _calculatePOTotal: function () {

            var oModel =
                this.getView().getModel("po");

            var aItems =
                oModel.getProperty("/toItems") || [];

            var fTotal = 0;

            aItems.forEach(function (oItem) {

                var fItemTotal =
                    parseFloat(
                        oItem.totalAmount
                    ) || 0;

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

        onMaterialChange: async function (oEvent) {

            var oComboBox =
                oEvent.getSource();

            var sMaterialCode =
                oComboBox.getSelectedKey();

            var oContext =
                oComboBox.getBindingContext("po");

            if (!oContext) {
                return;
            }

            var oPOModel =
                this.getView().getModel("po");

            var sPath =
                oContext.getPath();

            var oODataModel =
                this.getView().getModel();

            if (!oODataModel) {
                return;
            }

            try {

                /*
                 * OData V4 does not support:
                 *
                 * getProperty("/Materials")
                 *
                 * Load the material directly.
                 */

                var oMaterialContext =
                    oODataModel.bindContext(
                        "/Materials?$filter=materialCode eq '" +
                        encodeURIComponent(sMaterialCode) +
                        "'"
                    );

                var oMaterialResult =
                    await oMaterialContext.requestObject();

                console.log(
                    "Material result:",
                    oMaterialResult
                );

                var aMaterials =
                    oMaterialResult.value || [];

                if (aMaterials.length > 0) {

                    var oMaterial =
                        aMaterials[0];

                    oPOModel.setProperty(
                        sPath + "/materialCode",
                        oMaterial.materialCode
                    );

                    oPOModel.setProperty(
                        sPath + "/description",
                        oMaterial.materialName || ""
                    );
                }

            } catch (oError) {

                console.error(
                    "Failed to load material:",
                    oError
                );

                MessageBox.error(
                    "Failed to load material."
                );
            }
        },


        // =========================================================
        // SUBMIT
        // =========================================================

        onSubmit: function () {

            var oPOModel =
                this.getView().getModel("po");

            var oPO =
                oPOModel.getData();

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

            if (
                !oPO.toItems ||
                oPO.toItems.length === 0
            ) {

                MessageBox.error(
                    "Please add at least one order item."
                );

                return;
            }

            for (
                var i = 0;
                i < oPO.toItems.length;
                i++
            ) {

                var oItem =
                    oPO.toItems[i];

                if (!oItem.materialCode) {

                    MessageBox.error(
                        "Please select Material for item " +
                        (i + 1) +
                        "."
                    );

                    return;
                }

                if (
                    !oItem.quantity ||
                    oItem.quantity <= 0
                ) {

                    MessageBox.error(
                        "Quantity must be greater than 0 for item " +
                        (i + 1) +
                        "."
                    );

                    return;
                }

                if (
                    !oItem.requestedDeliveryDate
                ) {

                    MessageBox.error(
                        "Please select Requested Delivery Date for item " +
                        (i + 1) +
                        "."
                    );

                    return;
                }
            }

            this._calculatePOTotal();

            MessageBox.confirm(
                "Submit this Purchase Order for approval?",
                {
                    title: "Submit Purchase Order",

                    onClose: function (sAction) {

                        if (
                            sAction ===
                            MessageBox.Action.OK
                        ) {

                            this._createPurchaseOrder();
                        }

                    }.bind(this)
                }
            );
        },


        // =========================================================
        // CREATE PURCHASE ORDER - ODATA V4
        // =========================================================

        _createPurchaseOrder: async function () {

            var oPOModel =
                this.getView().getModel("po");

            var oPO =
                oPOModel.getData();

            var oODataModel =
                this.getView().getModel();

            if (!oODataModel) {

                MessageBox.error(
                    "OData model is not available."
                );

                return;
            }

            try {

                /*
                 * OData V4:
                 *
                 * model.bindList()
                 * listBinding.create()
                 */

                var oListBinding =
                    oODataModel.bindList(
                        "/PurchaseOrders"
                    );

                var oPayload = {

                    vendorId:
                        oPO.vendorId,

                    currency:
                        oPO.currency,

                    contractReference:
                        oPO.contractReference,

                    expectedDeliveryDate:
                        oPO.expectedDeliveryDate,

                    paymentTerms:
                        oPO.paymentTerms,

                    buyerId:
                        oPO.buyerId,

                    remarks:
                        oPO.remarks,

                    totalAmount:
                        oPO.totalAmount
                };

                var oCreatedContext =
                    oListBinding.create(
                        oPayload
                    );

                await oCreatedContext.created();

                console.log(
                    "Purchase Order created:",
                    oCreatedContext
                        .getObject()
                );

                MessageBox.success(
                    "Purchase Order created successfully.",
                    {
                        onClose: function () {

                            this._initializePO();

                        }.bind(this)
                    }
                );

            } catch (oError) {

                console.error(
                    "Purchase Order creation failed:",
                    oError
                );

                MessageBox.error(
                    "Failed to create Purchase Order."
                );
            }
        },


        // =========================================================
        // RESET
        // =========================================================

        _initializePO: function () {

            var oModel =
                this.getView().getModel("po");

            oModel.setData({

                poId: "",

                poNumber: "",

                vendorId: "",

                currency: "INR",

                contractReference: "",

                expectedDeliveryDate: "",

                paymentTerms: "NET30",

                buyerId: "",

                remarks: "",

                totalAmount: 0,

                poStatus: "",

                toItems: [],

                editMode: false
            });

            this._calculatePOTotal();
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

