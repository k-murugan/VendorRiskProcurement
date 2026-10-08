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
                items: [],
            });

            oView.setModel(oPOModel, "po");
             var oUIModel = new JSONModel({
        editMode: false,
        isNew: false
    });

    oView.setModel(oUIModel, "ui");

            var oRouter = UIComponent.getRouterFor(this);

            oRouter.getRoute("POItem").attachPatternMatched(
                this._onPORouteMatched,
                this
            );
        },


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
            this._sPOPath = sPOPath;
            console.log("PO path received:", sPOPath);
            this._loadPurchaseOrder(this._sPOPath);
        },

      _loadPurchaseOrder: async function (sPOPath) {
    try {
        console.log("Loading PO:", sPOPath);

        var oODataModel = this._getODataModel();

        if (!oODataModel) {
            MessageBox.error("OData model is not available.");
            return;
        }

        var oContext = oODataModel.bindContext(
            sPOPath
        );

        var oPO = await oContext.requestObject();

        console.log("Purchase Order data received:", oPO);

        if (!oPO) {
            MessageBox.error("Purchase Order not found.");
            return;
        }

        // ---------------------------------------------
        // Get Items
        // ---------------------------------------------

          var aItems =
            await this._loadPurchaseOrderItems(
                oPO.ID
            );

        console.log("PO Items:", aItems);

        var oPOModel = this.getView().getModel("po");

        oPOModel.setData({
            poId: oPO.ID || "",

            poNumber: oPO.poNumber || "",

            vendorId: oPO.vendorId || "",

            currency: oPO.currency || "INR",

            contractReference: oPO.contractReference || "",

            expectedDeliveryDate:
                oPO.expectedDeliveryDate || "",

            paymentTerms:
                oPO.paymentTerms || "NET30",

            buyerId:
                oPO.buyerId || "",

            remarks:
                oPO.remarks || "",

            totalAmount:
                Number(oPO.totalAmount) || 0,

            poStatus:
                oPO.poStatus || "",

            items: aItems,

        });
                this.getView()
            .getModel("ui")
            .setData({
                editMode: false,
                isNew: false
            });


        console.log(
            "PO model updated:",
            oPOModel.getData()
        );
       MessageToast.show(
            "Purchase Order loaded successfully."
        );

    } 
    catch (oError) {
        console.error("Failed to load Purchase Order:", oError);
        MessageBox.error("Failed to load Purchase Order.\n" +
            (oError.message || "")
        );
    }
},

_getODataModel: function () {
    return this.getOwnerComponent().getModel();
},
_loadPurchaseOrderItems: async function (sPOId) {

    var oODataModel =
        this._getODataModel();

    if (!oODataModel) {
        return [];
    }

    try {

        var oListBinding =
            oODataModel.bindList(
                "/PurchaseOrderItems"
            );

        var aContexts =
            await oListBinding.requestContexts(
                0,
                100
            );

        var aItems = [];

        aContexts.forEach(function (oContext) {

            var oItem =
                oContext.getObject();

            if (
                oItem.purchaseOrder_ID === sPOId ||
                oItem.poId === sPOId ||
                oItem.purchaseOrderId === sPOId
            ) {

                aItems.push(oItem);
            }
        });

        console.log(
            "Purchase Order Items:",
            aItems
        );

        return aItems;

    } catch (oError) {

        console.error(
            "Failed to load PO items:",
            oError
        );

        return [];
    }
},

        onEdit: function () {

            var oModel = this.getView().getModel("ui");

            oModel.setProperty(
                "/editMode",
                true
            );

            MessageToast.show(
                "Edit mode enabled."
            );
        },

        onCancelEdit: function () {

            var oModel = this.getView().getModel("ui");

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
                oModel.getProperty("/items") || [];

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
                "/items",
                aItems
            );

            this._calculatePOTotal();

            MessageToast.show(
                "New item added."
            );
        },


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
                oModel.getProperty("/items");

            if (
                iIndex >= 0 &&
                iIndex < aItems.length
            ) {

                aItems.splice(
                    iIndex,
                    1
                );

                oModel.setProperty(
                    "/items",
                    aItems
                );

                this._calculatePOTotal();

                MessageToast.show(
                    "Item deleted."
                );
            }
        },


       

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


        _calculatePOTotal: function () {

            var oModel =
                this.getView().getModel("po");

            var aItems =
                oModel.getProperty("/items") || [];

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



 onMaterialChange: async function (oEvent) {
    var oComboBox = oEvent.getSource();
    var sMaterialCode = oComboBox.getSelectedKey();

    if (!sMaterialCode) {
        return;
    }

    var oRowContext = oComboBox.getBindingContext("po");

    if (!oRowContext) {
        MessageBox.error("Material row context not found.");
        return;
    }

    var oPOModel = this.getView().getModel("po");
    var sRowPath = oRowContext.getPath();

    var oODataModel = this.getOwnerComponent().getModel();

    if (!oODataModel) {
        MessageBox.error("OData model is not available.");
        return;
    }

    try {
        var oListBinding = oODataModel.bindList("/Materials");

        var aContexts = await oListBinding.requestContexts(0, 100);

        var oMaterial = null;

        for (var i = 0; i < aContexts.length; i++) {
            var oMaterialData = aContexts[i].getObject();

            if (oMaterialData.materialCode === sMaterialCode) {
                oMaterial = oMaterialData;
                break;
            }
        }

        if (!oMaterial) {
            MessageBox.warning(
                "Material " + sMaterialCode + " was not found."
            );
            return;
        }

        console.log("Selected material:", oMaterial);

        oPOModel.setProperty(
            sRowPath + "/materialCode",
            oMaterial.materialCode
        );

        oPOModel.setProperty(
            sRowPath + "/description",
            oMaterial.materialName || ""
        );

        MessageToast.show("Material selected.");

    } catch (oError) {
        console.error("Material loading failed:", oError);
        MessageBox.error("Failed to load material data.");
    }
},
onSave: async function () {

    var oPOModel = this.getView().getModel("po");
    var oPO = oPOModel.getData();

    var oODataModel = this.getOwnerComponent().getModel();

    if (!oODataModel) {
        MessageBox.error("OData model is not available.");
        return;
    }

    if (!oPO.poId) {
        MessageBox.error("Purchase Order ID is missing.");
        return;
    }

    try {

        console.log("Saving PO:", oPO.poId);

    

        var sPOPath =
            "/PurchaseOrders(" +
            oPO.poId +
            ")";

        console.log("PO OData path:", sPOPath);


        var oPOContextBinding =
            oODataModel.bindContext(sPOPath);

        var oPOContext =
            oPOContextBinding.getBoundContext();

        if (!oPOContext) {
            MessageBox.error(
                "Could not get Purchase Order context."
            );
            return;
        }

        console.log(
            "OData PO context:",
            oPOContext
        );

        oPOContext.setProperty(
            "poNumber",
            oPO.poNumber
        );

        oPOContext.setProperty(
            "vendorId",
            oPO.vendorId
        );

        oPOContext.setProperty(
            "currency",
            oPO.currency
        );

        oPOContext.setProperty(
            "contractReference",
            oPO.contractReference
        );

        oPOContext.setProperty(
            "expectedDeliveryDate",
            oPO.expectedDeliveryDate
        );

        oPOContext.setProperty(
            "paymentTerms",
            oPO.paymentTerms
        );

        oPOContext.setProperty(
            "buyerId",
            oPO.buyerId
        );

        oPOContext.setProperty(
            "remarks",
            oPO.remarks
        );

        oPOContext.setProperty(
            "totalAmount",
            Number(oPO.totalAmount) || 0
        );

        // ---------------------------------------------
        // Save to backend
        // ---------------------------------------------

        await oODataModel.submitBatch("$auto");

        console.log(
            "Purchase Order saved successfully."
        );

        // ---------------------------------------------
        // Exit edit mode
        // ---------------------------------------------

        var oUIModel =
            this.getView().getModel("ui");

        if (oUIModel) {
            oUIModel.setProperty(
                "/editMode",
                false
            );
        }

        MessageToast.show(
            "Purchase Order saved successfully."
        );

    } catch (oError) {

        console.error(
            "Failed to save Purchase Order:",
            oError
        );

        MessageBox.error(
            "Failed to save Purchase Order.\n\n" +
            (oError.message || "")
        );
    }
},


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
                !oPO.items ||
                oPO.items.length === 0
            ) {

                MessageBox.error(
                    "Please add at least one order item."
                );

                return;
            }

            for (
                var i = 0;
                i < oPO.items.length;
                i++
            ) {

                var oItem =
                    oPO.items[i];

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

                items: [],

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

