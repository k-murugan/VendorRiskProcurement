sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent", "sap/m/MessageToast", "sap/ui/model/Filter", "sap/ui/model/FilterOperator","project1/model/formatter"
], (BaseController, UIComponent, MessageToast, Filter, FilterOperator, formatter) => {
    "use strict";

    return BaseController.extend("project1.controller.PurchaseOrder", {
        onInit() {
        },
        formatter: formatter,
        async onCreate() {
    try {
        const oModel = this.getView().getModel();

        const sPONumber = this.byId("inputPONumber").getValue().trim();
        const sPODate = this.byId("inputPODate").getValue();
        const sExpectedDate = this.byId("inputExpectedDate").getValue();
        const sPOStatus = this.byId("inputPOStatus").getSelectedKey();
        const sAmount = this.byId("inputAmount").getValue();
        const sCurrency = this.byId("inputCurrency").getValue().trim();
        const sPaymentTerms = this.byId("inputPaymentTerms").getSelectedKey();
        const sContractReference = this.byId("inputContactReference").getValue().trim();

        // Mandatory field validation
        if (
            !sPONumber ||
            !sPODate ||
            !sExpectedDate ||
            !sPOStatus ||
            !sAmount ||
            !sCurrency ||
            !sPaymentTerms ||
            !sContractReference
        ) {
            MessageBox.warning("Please fill all mandatory fields.");
            return;
        }

        const fAmount = Number(sAmount);

        if (isNaN(fAmount) || fAmount < 0) {
            MessageBox.warning("Please enter a valid Total Amount.");
            return;
        }

        const oPOData = {
            poNumber: sPONumber,
            poDate: sPODate,
            expectedDeliveryDate: sExpectedDate,
            poStatus: sPOStatus,
            totalAmount: fAmount,
            currency: sCurrency,
            paymentTerms: sPaymentTerms,
            contractReference: sContractReference
        };

        console.log("Creating Purchase Order:", oPOData);

        const oListBinding = oModel.bindList("/PurchaseOrders");

        const oContext = oListBinding.create(oPOData);

        // Wait for backend creation
        await oContext.created();

        console.log("Purchase Order created successfully.");
        console.log("Created PO path:", oContext.getPath());
        console.log("Created PO data:", oContext.getObject());

        MessageToast.show("Purchase Order created successfully.");

        // Close dialog
        this.byId("Dialog").close();

        // Clear form
        this._clearPOForm();

    } catch (oError) {
        console.error("Failed to create Purchase Order:", oError);

        MessageBox.error(
            "Failed to create Purchase Order.\n\n" +
            (oError.message || "Unknown error")
        );
    }
},_clearPOForm() {
    this.byId("inputPONumber").setValue("");
    this.byId("inputPODate").setValue("");
    this.byId("inputExpectedDate").setValue("");

    this.byId("inputPOStatus").setSelectedKey("DRAFT");

    this.byId("inputAmount").setValue("");
    this.byId("inputCurrency").setValue("INR");

    this.byId("inputPaymentTerms").setSelectedKey("NET30");

    this.byId("inputContactReference").setValue("");
},
        onSaveVendor: async function () {
    try {
        const oModel = this.getOwnerComponent().getModel();
        const sVendorCode =
            this.byId("vendorCodeInput").getValue();
        const sVendorName =
            this.byId("vendorNameInput").getValue();
        const sCountry =
            this.byId("countryInput").getValue();
        const sRegion =
            this.byId("regionInput").getValue();
        const sVendorCategory =
            this.byId("vendorCategoryInput").getValue();
        const sMaterialCategory =
            this.byId("materialCategoryInput").getValue();
        const sContactPerson =
            this.byId("contactPersonInput").getValue();
        const sEmail =
            this.byId("emailInput").getValue();
        const sPhone =
            this.byId("phoneInput").getValue();
        const sVendorStatus =
            this.byId("vendorStatusInput").getSelectedKey();
        if (!sVendorCode || !sVendorName) {

            MessageBox.error(
                "Vendor Code and Vendor Name are required."
            );

            return;
        }


        const oVendorPayload = {

            vendorCode: sVendorCode,
            vendorName: sVendorName,
            country: sCountry,
            region: sRegion,
            vendorCategory: sVendorCategory,
            materialCategory: sMaterialCategory,
            contactPerson: sContactPerson,
            email: sEmail,
            phone: sPhone,
            vendorStatus: sVendorStatus

        };


        console.log(
            "Vendor payload:",
            oVendorPayload
        );
        const oListBinding =
            oModel.bindList("/Vendors");

        const oContext =
            oListBinding.create(oVendorPayload);
        await oContext.created();


        MessageToast.show(
            "Vendor created successfully."
        );


        this.dialog.close();
        const oTable =
            this.byId("vendorTable");

        if (oTable) {

            const oBinding =
                oTable.getBinding("items");

            if (oBinding) {
                oBinding.refresh();
            }
        }


    } catch (oError) {

        console.error(
            "Failed to create Vendor:",
            oError
        );

        MessageBox.error(
            "Failed to save Vendor.\n\n" +
            (oError.message || "Unknown error")
        );
    }
},
        onpoFilterChange: function () {
            this._applyPOFilters();
        },
        _applyPOFilters: function () {
            const oTable = this.byId("poTable");
            var oBinding = oTable.getBinding("items");
            if (!oBinding) {
                return;
            }
            var aFilters = [];
            var aPOCodeKeys = this.byId("poFilter").getSelectedKeys();
            if (aPOCodeKeys.length > 0) {
                var aCodeFilters = aPOCodeKeys.map(function (sKey) {
                    return new Filter("poNumber", FilterOperator.EQ, sKey);
                });
                aFilters.push(new Filter({
                    filters: aCodeFilters, and: false

                }));
            }

            oBinding.filter(aFilters);
        },
        async addPO() {
            if (!this.dialog) {
                this.dialog = await this.loadFragment({
                    name: "project1.view.PO"
                });
            }
            this.dialog.open();
        },
        onCloseDialog() {
            this.byId("Dialog")?.close();
        },
        onDeletePO: function () {
            const oTable = this.byId("poTable");
            const oSelectedItem = oTable.getSelectedItem();
            if (!oSelectedItem) {
                sap.m.MessageToast.show("Please select a PO to delete");
                return;
            }
            const oContext = oSelectedItem.getBindingContext();
            oContext.delete().then(() => {
                sap.m.MessageToast.show("PO deleted successfully");
                oTable.removeSelections(true);
            }).catch((oError) => {
                sap.m.MessageToast.show("Failed to delete PO")
            })
        },
        onPOPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext();

            if (!oContext) {
                MessageBox.error("Purchase Order context not found.");
                return;
            }
            var sPOPath = oContext.getPath();

            console.log("Selected PO path:", sPOPath);

            // Encode the complete OData path before putting it into the route
            var sEncodedPOPath = encodeURIComponent(sPOPath);

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            oRouter.navTo("POItem", {
                po: sEncodedPOPath
            });
        }

    });
});