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

        // =========================================================
        // INIT
        // =========================================================

        onInit: function () {

            this.getView().setModel(new JSONModel({
                poId: "",
                poNumber: "",
                vendorId: "",
                vendor_ID: "",
                currency: "INR",
                contractReference: "",
                expectedDeliveryDate: "",
                paymentTerms: "NET30",
                buyerId: "",
                buyer_ID: "",
                remarks: "",
                totalAmount: 0,
                poStatus: "",
                items: []
            }), "po");
            //

            this.getView().setModel(new JSONModel({
                editMode: false,
                isNew: false
            }), "ui");

            // Materials master data, loaded once and shared by all rows
            this.getView().setModel(new JSONModel({ items: [] }), "materials");
            this._loadMaterials();

            UIComponent.getRouterFor(this)
                .getRoute("POItem")
                .attachPatternMatched(this._onPORouteMatched, this);
        },


        // =========================================================
        // LOAD MATERIALS (MASTER DATA)
        // =========================================================

        _loadMaterials: async function () {

            var oODataModel = this._getODataModel();

            if (!oODataModel) {
                return;
            }

            try {

                var aContexts = await oODataModel
                    .bindList("/Materials")
                    .requestContexts(0, 500);

                var aMaterials = aContexts
                    .map(function (oCtx) {
                        return oCtx.getObject();
                    })
                    .filter(function (oMaterial) {
                        return oMaterial.status !== "INACTIVE";
                    });

                this.getView()
                    .getModel("materials")
                    .setProperty("/items", aMaterials);

            } catch (oError) {

                console.error("Failed to load materials:", oError);

                MessageBox.error(
                    "Failed to load materials.\n\n" +
                    (oError.message || "Unknown error")
                );
            }
        },


        // =========================================================
        // ROUTE MATCH
        // =========================================================

        _onPORouteMatched: function (oEvent) {

            var sPOPath = oEvent.getParameter("arguments").po;

            if (!sPOPath) {
                MessageBox.error("Purchase Order path not found.");
                return;
            }

            sPOPath = decodeURIComponent(sPOPath);

            if (sPOPath.charAt(0) !== "/") {
                sPOPath = "/" + sPOPath;
            }

            this._sPOPath = sPOPath;

            this._loadPurchaseOrder(sPOPath);
        },


        // =========================================================
        // LOAD PO HEADER + ITEMS
        // =========================================================

        _loadPurchaseOrder: async function (sPOPath) {

            try {

                var oODataModel = this._getODataModel();

                if (!oODataModel) {
                    MessageBox.error("OData model is not available.");
                    return;
                }

                // ---------------- Header ----------------

                var oPOBinding = oODataModel.bindContext(sPOPath);

                var oPO = await oPOBinding.requestObject();

                if (!oPO) {
                    MessageBox.error("Purchase Order not found.");
                    return;
                }

                // Keep binding + context alive for Save
                this._oPOBinding = oPOBinding;
                this._oPOContext = oPOBinding.getBoundContext();

                // ---------------- Items ----------------

                var aItems = await this._loadPurchaseOrderItems(sPOPath);

                // ---------------- JSON model ----------------

                this.getView().getModel("po").setData({
                    poId: oPO.ID || "",
                    poNumber: oPO.poNumber || "",
                    vendorId: oPO.vendor_ID || "",
                    vendor_ID: oPO.vendor_ID || "",
                    currency: oPO.currency || "INR",
                    contractReference: oPO.contractReference || "",
                    expectedDeliveryDate: oPO.expectedDeliveryDate || "",
                    paymentTerms: oPO.paymentTerms || "NET30",
                    buyerId: oPO.buyer_ID || "",
                    buyer_ID: oPO.buyer_ID || "",
                    remarks: oPO.remarks || "",
                    totalAmount: Number(oPO.totalAmount) || 0,
                    poStatus: oPO.poStatus || "",
                    items: aItems
                });

                // Read-only initially
                this.getView().getModel("ui").setData({
                    editMode: false,
                    isNew: false
                });

            } catch (oError) {

                console.error("PO loading failed:", oError);

                MessageBox.error(
                    "Failed to load Purchase Order.\n\n" +
                    (oError.message || "Unknown error")
                );
            }
        },


        // =========================================================
        // LOAD PO ITEMS (COMPOSITION)
        // =========================================================

        _loadPurchaseOrderItems: async function (sPOPath) {

            var oODataModel = this._getODataModel();

            this._oItemsBinding = null;
            this._aItemContexts = [];

            if (!oODataModel) {
                return [];
            }

            try {

                // /PurchaseOrders(<ID>)/items
                var sItemsPath = sPOPath + "/items";

                var oItemsBinding = oODataModel.bindList(sItemsPath);

                var aContexts = await oItemsBinding.requestContexts(0, 100);

                // Keep binding + contexts alive so Save can update them
                this._oItemsBinding = oItemsBinding;
                this._aItemContexts = aContexts;

                var aItems = aContexts.map(function (oContext) {

                    var oItem = oContext.getObject();

                    var fQty = Number(oItem.orderedQuantity) || 0;
                    var fPrice = Number(oItem.oldUnitPrice) || 0;

                    return {
                        ID: oItem.ID || "",
                        oDataPath: oContext.getPath(),

                        materialId: oItem.material_ID || "",
                        materialCode: oItem.materialCode || "",
                        materialGroup: oItem.materialGroup || "",

                        // backend materialDescription -> UI description
                        description: oItem.materialDescription || "",

                        // backend orderedQuantity -> UI quantity
                        quantity: fQty,

                        unit: oItem.unit || "EA",
                        oldUnitPrice: fPrice,
                        contractPrice: Number(oItem.contractPrice) || 0,
                        currency: oItem.currency || "INR",

                        totalAmount: fQty * fPrice,

                        requestedDeliveryDate: oItem.requestedDeliveryDate || ""
                    };
                });

                if (aItems.length === 0) {
                    console.warn("No items found under:", sItemsPath);
                }

                return aItems;

            } catch (oError) {

                console.error("Failed to load PO items:", oError);

                MessageBox.warning(
                    "Purchase Order header loaded, but order items could not be loaded.\n\n" +
                    (oError.message || "Unknown error")
                );

                return [];
            }
        },


        // =========================================================
        // GET ODATA MODEL
        // =========================================================

        _getODataModel: function () {
            return this.getOwnerComponent().getModel();
        },


        // =========================================================
        // EDIT
        // =========================================================

        onEdit: function () {

            this.getView()
                .getModel("ui")
                .setProperty("/editMode", true);

            MessageToast.show("Edit mode enabled.");
        },


        // =========================================================
        // CANCEL EDIT
        // =========================================================

        onCancelEdit: async function () {

            if (!this._sPOPath) {
                MessageBox.error("Purchase Order path not available.");
                return;
            }

            try {

                await this._loadPurchaseOrder(this._sPOPath);

                MessageToast.show("Changes discarded.");

            } catch (oError) {
                console.error("Cancel reload failed:", oError);
            }
        },


        // =========================================================
        // MATERIAL CHANGE
        // =========================================================

        onMaterialChange: function (oEvent) {

            var oComboBox = oEvent.getSource();

            var sKey = oComboBox.getSelectedKey();

            // Row context in the "po" JSON model
            var oRowContext = oComboBox.getBindingContext("po");

            if (!sKey || !oRowContext) {
                return;
            }

            // Look the material up in the already loaded master data
            var aMaterials = this.getView()
                .getModel("materials")
                .getProperty("/items") || [];

            var oMaterial = aMaterials.find(function (oMat) {
                return oMat.materialCode === sKey;
            });

            if (!oMaterial) {
                MessageBox.error("Material not found in master data.");
                return;
            }

            var oPOModel = this.getView().getModel("po");
            var sPath = oRowContext.getPath();

            var fQuantity = Number(
                oPOModel.getProperty(sPath + "/quantity")
            ) || 0;

            var fPrice = Number(oMaterial.currentUnitPrice) || 0;

            oPOModel.setProperty(sPath + "/materialId", oMaterial.ID || "");
            oPOModel.setProperty(sPath + "/materialCode", oMaterial.materialCode || "");
            oPOModel.setProperty(sPath + "/description", oMaterial.materialDescription || "");
            oPOModel.setProperty(sPath + "/materialGroup", oMaterial.materialGroup || "");
            oPOModel.setProperty(sPath + "/unit", oMaterial.baseUnit || "EA");
            oPOModel.setProperty(sPath + "/oldUnitPrice", fPrice);
            oPOModel.setProperty(sPath + "/contractPrice", Number(oMaterial.contractPrice) || 0);
            oPOModel.setProperty(sPath + "/currency", oMaterial.currency || "INR");
            oPOModel.setProperty(sPath + "/totalAmount", fQuantity * fPrice);

            this._calculatePOTotal();
        },


        // =========================================================
        // QUANTITY CHANGE
        // =========================================================

        onQuantityChange: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext("po");

            if (!oContext) {
                return;
            }

            var oModel = this.getView().getModel("po");
            var sPath = oContext.getPath();

            var fQuantity = Number(oEvent.getParameter("value")) || 0;

            var fPrice = Number(
                oModel.getProperty(sPath + "/oldUnitPrice")
            ) || 0;

            oModel.setProperty(sPath + "/quantity", fQuantity);
            oModel.setProperty(sPath + "/totalAmount", fQuantity * fPrice);

            this._calculatePOTotal();
        },


        // =========================================================
        // PRICE CHANGE
        // =========================================================

        onPriceChange: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext("po");

            if (!oContext) {
                return;
            }

            var oModel = this.getView().getModel("po");
            var sPath = oContext.getPath();

            var fPrice = Number(oEvent.getParameter("value")) || 0;

            var fQuantity = Number(
                oModel.getProperty(sPath + "/quantity")
            ) || 0;

            oModel.setProperty(sPath + "/oldUnitPrice", fPrice);
            oModel.setProperty(sPath + "/totalAmount", fQuantity * fPrice);

            this._calculatePOTotal();
        },


        // =========================================================
        // CALCULATE PO TOTAL
        // =========================================================

        _calculatePOTotal: function () {

            var oModel = this.getView().getModel("po");

            var aItems = oModel.getProperty("/items") || [];

            var fTotal = 0;

            aItems.forEach(function (oItem) {
                fTotal += Number(oItem.totalAmount) || 0;
            });

            oModel.setProperty("/totalAmount", fTotal);
        },


        // =========================================================
        // SAVE
        // =========================================================

        onSave: async function () {

            var oPO = this.getView().getModel("po").getData();

            var oODataModel = this._getODataModel();

            if (!oODataModel) {
                MessageBox.error("OData model is not available.");
                return;
            }

            if (!oPO.poId) {
                MessageBox.error("Purchase Order ID is missing.");
                return;
            }

            try {

                this._calculatePOTotal();

                // ---------------- Header ----------------

                var oPOContext = this._oPOContext;
                var sPOId = oPOContext.getProperty("ID");

var oItemsBinding = oODataModel.bindList(
    "/PurchaseOrderItems",
    null,
    null,
    [new sap.ui.model.Filter("purchaseOrder_ID", "EQ", sPOId)]
);
var aContexts = await oItemsBinding.requestContexts(0, 100);
console.log("Items via filter:", aContexts.length);

                if (!oPOContext) {
                    MessageBox.error(
                        "Purchase Order context is not available. Please reload the page."
                    );
                    return;
                }

                oPOContext.setProperty("poNumber", oPO.poNumber);
                oPOContext.setProperty("currency", oPO.currency);
                oPOContext.setProperty("contractReference", oPO.contractReference);
                oPOContext.setProperty("expectedDeliveryDate", oPO.expectedDeliveryDate);
                oPOContext.setProperty("paymentTerms", oPO.paymentTerms);
                oPOContext.setProperty("totalAmount", Number(oPO.totalAmount) || 0);

                if (oPO.buyer_ID) {
                    oPOContext.setProperty("buyer_ID", oPO.buyer_ID);
                }

                // ---------------- Items ----------------

                var aItems = oPO.items || [];

                for (var i = 0; i < aItems.length; i++) {

                    var oItem = aItems[i];
                    var oItemContext = (this._aItemContexts || [])[i];

                    if (!oItemContext) {
                        continue;
                    }

                    if (oItem.materialId) {
                        oItemContext.setProperty("material_ID", oItem.materialId);
                    }

                    oItemContext.setProperty("materialCode", oItem.materialCode);
                    oItemContext.setProperty("materialDescription", oItem.description);
                    oItemContext.setProperty("materialGroup", oItem.materialGroup);
                    oItemContext.setProperty("orderedQuantity", Number(oItem.quantity) || 0);
                    oItemContext.setProperty("unit", oItem.unit);
                    oItemContext.setProperty("oldUnitPrice", Number(oItem.oldUnitPrice) || 0);
                    oItemContext.setProperty("contractPrice", Number(oItem.contractPrice) || 0);
                    oItemContext.setProperty("currency", oItem.currency);
                    oItemContext.setProperty("requestedDeliveryDate", oItem.requestedDeliveryDate);
                }

                // ---------------- Submit ----------------

                await oODataModel.submitBatch("$auto");

                this.getView()
                    .getModel("ui")
                    .setProperty("/editMode", false);

                MessageToast.show("Purchase Order saved successfully.");

                // Reload from backend
                await this._loadPurchaseOrder(this._sPOPath);

            } catch (oError) {

                console.error("Save failed:", oError);

                MessageBox.error(
                    "Failed to save Purchase Order.\n\n" +
                    (oError.message || "Unknown error")
                );
            }
        },


        // =========================================================
        // SUBMIT
        // =========================================================

        onSubmit: function () {

            var oPO = this.getView().getModel("po").getData();

            if (!oPO.poNumber) {
                MessageBox.error("Please enter PO Number.");
                return;
            }

            if (!oPO.currency) {
                MessageBox.error("Please select Currency.");
                return;
            }

            if (!oPO.expectedDeliveryDate) {
                MessageBox.error("Please select Expected Delivery Date.");
                return;
            }

            if (!oPO.paymentTerms) {
                MessageBox.error("Please select Payment Terms.");
                return;
            }

            if (!oPO.items || oPO.items.length === 0) {
                MessageBox.error("No Purchase Order Items found.");
                return;
            }

            for (var i = 0; i < oPO.items.length; i++) {

                var oItem = oPO.items[i];

                if (!oItem.materialCode) {
                    MessageBox.error("Please select Material for item " + (i + 1) + ".");
                    return;
                }

                if (!oItem.quantity || Number(oItem.quantity) <= 0) {
                    MessageBox.error(
                        "Quantity must be greater than 0 for item " + (i + 1) + "."
                    );
                    return;
                }

                if (!oItem.requestedDeliveryDate) {
                    MessageBox.error(
                        "Please select Requested Delivery Date for item " + (i + 1) + "."
                    );
                    return;
                }
            }

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


        // =========================================================
        // CREATE PO (DEEP CREATE)
        // =========================================================

        _createPurchaseOrder: async function () {

            var oPO = this.getView().getModel("po").getData();

            var oODataModel = this._getODataModel();

            if (!oODataModel) {
                MessageBox.error("OData model is not available.");
                return;
            }

            try {

                var aItems = (oPO.items || []).map(function (oItem) {

                    return {
                        material_ID: oItem.materialId || null,
                        materialCode: oItem.materialCode,
                        materialDescription: oItem.description,
                        materialGroup: oItem.materialGroup,
                        orderedQuantity: Number(oItem.quantity) || 0,
                        unit: oItem.unit,
                        oldUnitPrice: Number(oItem.oldUnitPrice) || 0,
                        contractPrice: Number(oItem.contractPrice) || 0,
                        currency: oItem.currency,
                        requestedDeliveryDate: oItem.requestedDeliveryDate
                    };
                });

                var oPayload = {
                    poNumber: oPO.poNumber,
                    currency: oPO.currency,
                    contractReference: oPO.contractReference,
                    expectedDeliveryDate: oPO.expectedDeliveryDate,
                    paymentTerms: oPO.paymentTerms,
                    totalAmount: Number(oPO.totalAmount) || 0,
                    buyer_ID: oPO.buyer_ID || null,
                    items: aItems
                };

                var oCreatedContext = oODataModel
                    .bindList("/PurchaseOrders")
                    .create(oPayload);

                await oCreatedContext.created();

                MessageBox.success("Purchase Order created successfully.");

            } catch (oError) {

                console.error("PO creation failed:", oError);

                MessageBox.error(
                    "Failed to create Purchase Order.\n\n" +
                    (oError.message || "")
                );
            }
        },


        // =========================================================
        // RESET
        // =========================================================

        _initializePO: function () {

            this.getView().getModel("po").setData({
                poId: "",
                poNumber: "",
                vendorId: "",
                vendor_ID: "",
                currency: "INR",
                contractReference: "",
                expectedDeliveryDate: "",
                paymentTerms: "NET30",
                buyerId: "",
                buyer_ID: "",
                remarks: "",
                totalAmount: 0,
                poStatus: "",
                items: []
            });

            this.getView().getModel("ui").setData({
                editMode: true,
                isNew: true
            });
        }

    });
});
