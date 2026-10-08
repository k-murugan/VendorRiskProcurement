sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/m/MessageToast", "sap/ui/core/UIComponent",
    "sap/ui/model/Filter", "sap/ui/model/FilterOperator","project1/model/formatter"
], (Controller, MessageBox, MessageToast, UIComponent, Filter, FilterOperator, formatter) => {
    "use strict";

    return Controller.extend("project1.controller.Vendor", {
        onInit() {
            this._loadVendorCategories();
            this._loadVendorRiskLevels();
        },
        formatter: formatter,
        _loadVendorCategories: async function () {

            try {

                const oModel = this.getOwnerComponent().getModel();

                const oListBinding = oModel.bindList("/Vendors");

                const aContexts = await oListBinding.requestContexts();

                const aCategoryMap = {};
                const aCategories = [];

                aContexts.forEach(function (oContext) {

                    const sCategory =
                        oContext.getProperty("vendorCategory");

                    if (sCategory && !aCategoryMap[sCategory]) {

                        aCategoryMap[sCategory] = true;

                        aCategories.push({
                            category: sCategory
                        });
                    }

                });

                const oCategoryModel =
                    new sap.ui.model.json.JSONModel({
                        categories: aCategories
                    });

                this.getView().setModel(
                    oCategoryModel,
                    "vendorCategory"
                );

                console.log(
                    "Unique Vendor Categories:",
                    aCategories
                );

            } catch (oError) {

                console.error(
                    "Failed to load vendor categories:",
                    oError
                );

            }
        },
        _loadVendorRiskLevels: async function () {
            try {
                const oModel = this.getOwnerComponent().getModel();
                const oListBinding = oModel.bindList("/Vendors");
                const aContexts = await oListBinding.requestContexts();
                const aRiskMap = {};
                const aRiskLevels = [];
                aContexts.forEach(function (oContext) {
                    const sRiskLevel =
                        oContext.getProperty("riskLevel");
                    if (sRiskLevel && !aRiskMap[sRiskLevel]) {
                        aRiskMap[sRiskLevel] = true;
                        aRiskLevels.push({
                            riskLevel: sRiskLevel
                        });
                    }
                });

                const oRiskModel =
                    new sap.ui.model.json.JSONModel({
                        riskLevels: aRiskLevels
                    });
                this.getView().setModel(
                    oRiskModel,
                    "vendorRisk"
                );
                console.log(
                    "Unique Vendor Risk Levels:",
                    aRiskLevels
                );
            } catch (oError) {
                console.error(
                    "Failed to load vendor risk levels:",
                    oError
                );
            }
        },
        onVendorFilterChange: function () {
            this._applyVendorFilters();
        },
        onVendorNameFilterChange: function () {
            this._applyVendorFilters();
        },
        onVendorCategoryFilterChange: function () {
            this._applyVendorFilters();
        },
        onVendorRiskFilterChange: function () {
            this._applyVendorFilters();
        },
        _applyVendorFilters: function () {
            const oTable = this.byId("vendorTable");
            var oBinding = oTable.getBinding("items");
            if (!oBinding) {
                return;
            }
            var aFilters = [];
            var aVendorCodeKeys = this.byId("vendorFilter").getSelectedKeys();
            if (aVendorCodeKeys.length > 0) {
                var aCodeFilters = aVendorCodeKeys.map(function (sKey) {
                    return new Filter("vendorCode", FilterOperator.EQ, sKey);
                });
                aFilters.push(new Filter({
                    filters: aCodeFilters, and: false

                }));
            }
            var aVendorNameKeys = this.byId("vendorNameFilter").getSelectedKeys();
            if (aVendorNameKeys.length > 0) {
                var aNameFilters = aVendorNameKeys.map(function (sKey) {
                    return new Filter("vendorName", FilterOperator.EQ, sKey);
                });
                aFilters.push(new Filter({
                    filters: aNameFilters, and: false
                }));
            }
            var aCategoryKeys = this.byId("vendorCategoryFilter").getSelectedKeys();
            if (aCategoryKeys.length > 0) {
                var aCategoryFilters = aCategoryKeys.map(function (sKey) {
                    return new Filter("vendorCategory", FilterOperator.EQ, sKey);
                });
                aFilters.push(new Filter({
                    filters: aCategoryFilters, and: false

                }));
            }
            var aRiskKeys = this.byId("vendorRiskFilter").getSelectedKeys();
            if (aRiskKeys.length > 0) {
                var aRiskFilters = aRiskKeys.map(function (sKey) {
                    return new Filter("riskLevel", FilterOperator.EQ, sKey);
                });
                aFilters.push(new Filter({ filters: aRiskFilters, and: false })
                );
            }
            oBinding.filter(aFilters);
        },
        async addVendor() {
            if (!this.dialog) {
                this.dialog = await this.loadFragment({
                    name: "project1.view.VendorForm"
                });
            }

            this.dialog.open();
        },

        onCloseDialog() {
            this.byId("helloDialog")?.close();
        },
     async onCreate() {
    try {
        const oModel = this.getView().getModel();

        const sVendorCode = this.byId("inputVendorCode").getValue().trim();
        const sVendorName = this.byId("inputName").getValue().trim();
        const sCountry = this.byId("inputCountry").getValue().trim();
        const sRegion = this.byId("inputRegion").getValue().trim();
        const sCategory = this.byId("inputCategory").getValue().trim();
        const sMaterialCategory = this.byId("inputMaterial").getValue().trim();
        const sContactPerson = this.byId("inputContact").getValue().trim();
        const sEmail = this.byId("inputEmail").getValue().trim();
        const sPhone = this.byId("inputPhone").getValue().trim();
        const sVendorStatus = this.byId("inputStatus").getSelectedKey();

        if (
            !sVendorCode ||
            !sVendorName ||
            !sCountry ||
            !sRegion ||
            !sCategory ||
            !sMaterialCategory ||
            !sContactPerson ||
            !sEmail ||
            !sPhone ||
            !sVendorStatus
        ) {
            MessageBox.warning("Please fill all mandatory fields.");
            return;
        }

        const oVendorData = {
            vendorCode: sVendorCode,
            vendorName: sVendorName,
            country: sCountry,
            region: sRegion,
            vendorCategory: sCategory,
            materialCategory: sMaterialCategory,
            contactPerson: sContactPerson,
            email: sEmail,
            phone: sPhone,
            vendorStatus: sVendorStatus
        };

        console.log("Creating Vendor:", oVendorData);

        const oListBinding = oModel.bindList("/Vendors");

        const oContext = oListBinding.create(oVendorData);
        await oContext.created();

        console.log("Vendor created successfully.");
        console.log("Created vendor path:", oContext.getPath());
        console.log("Created vendor data:", oContext.getObject());

        MessageToast.show("Vendor created successfully.");

        this.byId("helloDialog").close();

        this._clearVendorForm();

        // Refresh the table AFTER successful creation
        const oTable = this.byId("vendorTable");
        const oTableBinding = oTable.getBinding("items");


    } catch (oError) {
        console.error("Failed to create vendor:", oError);

        MessageBox.error(
            "Failed to create vendor.\n\n" +
            (oError.message || "Unknown error")
        );
    }
},
_clearVendorForm: function () {

    this.byId("inputVendorCode").setValue("");
    this.byId("inputName").setValue("");
    this.byId("inputCountry").setValue("");
    this.byId("inputRegion").setValue("");
    this.byId("inputCategory").setValue("");
    this.byId("inputMaterial").setValue("");
    this.byId("inputContact").setValue("");
    this.byId("inputEmail").setValue("");
    this.byId("inputPhone").setValue("");

    this.byId("inputStatus").setSelectedKey("ACTIVE");
},
        onVendorPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext();
            if (!oContext) {
                MessageBox.error("Vendor context not found.");
                return;
            }
            var sVenPath = oContext.getPath();
            console.log("Selected Vendor path:", sVenPath);
            var sEncodedVenPath = encodeURIComponent(sVenPath);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("VendorObject", {
                ven: sEncodedVenPath
            });
        },

        onDeleteVendor: function () {
            const oTable = this.byId("vendorTable");
            const oSelectedItem = oTable.getSelectedItem();
            if (!oSelectedItem) {
                sap.m.MessageToast.show("Please select a vendor to delete");
                return;
            }
            const oContext = oSelectedItem.getBindingContext();
            oContext.delete().then(() => {
                sap.m.MessageToast.show("Vendor Successfully Deleted");
                oTable.removeSelections(true);
            }).catch((oError) => {
                sap.m.MessageToast.show("Failed to delete vendor");
            })
        }
    })
});