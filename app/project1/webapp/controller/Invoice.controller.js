sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend("project1.controller.Invoice", {

        onInit: function () {
            const oUIModel = new JSONModel({
                editMode: false
            });

            this.getView().setModel(oUIModel, "ui");

            this._loadInvoiceStatuses();
        },

        onEditInvoice: function () {
            const oTable = this.byId("invoiceTable");

            const aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select at least one invoice to edit.");
                return;
            }

            this.getView()
                .getModel("ui")
                .setProperty("/editMode", true);

            this._bInvoiceEditing = true;
            this.byId("editInvoiceButton").setVisible(false);
            this.byId("saveInvoiceButton").setVisible(true);
            this.byId("cancelInvoiceButton").setVisible(true);

            MessageToast.show(
                aSelectedItems.length + " invoice(s) ready for editing."
            );
        },

        onSaveInvoice: async function () {
            try {
                const oModel = this.getView().getModel();
                await oModel.submitBatch("invoiceUpdate");
                MessageToast.show("Invoice(s) updated successfully.");
                this._exitInvoiceEditMode();

            } catch (oError) {
                console.error("Failed to save invoice:", oError);
                MessageBox.error(
                    "Failed to save invoice.\n\n" +
                    (oError.message || "Unknown error")
                );
            }
        },

        _exitInvoiceEditMode: function () {
            this.getView()
                .getModel("ui")
                .setProperty("/editMode", false);

            this._bInvoiceEditing = false;
            this.byId("editInvoiceButton").setVisible(true);
            this.byId("saveInvoiceButton").setVisible(false);
            this.byId("cancelInvoiceButton").setVisible(false);
            this.byId("invoiceTable").removeSelections(true);
        },

        onDeleteInvoice: function () {
            const oTable = this.byId("invoiceTable");
            const oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageToast.show("Please select an invoice to delete.");
                return;
            }

            const oContext = oSelectedItem.getBindingContext();
            oContext.delete()
                .then(() => {
                    MessageToast.show("Invoice deleted successfully.");
                    oTable.removeSelections(true);
                })
                .catch((oError) => {
                    console.error("Delete failed:", oError);
                    MessageToast.show("Failed to delete invoice.");
                });
        },

        _loadInvoiceStatuses: async function () {
            try {
                const oModel = this.getOwnerComponent().getModel();

                const oListBinding = oModel.bindList("/Invoices");

                const aContexts =
                    await oListBinding.requestContexts();

                const aStatusMap = {};
                const aStatuses = [];

                aContexts.forEach(function (oContext) {
                    const sStatus =
                        oContext.getProperty("invoiceStatus");

                    if (sStatus && !aStatusMap[sStatus]) {
                        aStatusMap[sStatus] = true;

                        aStatuses.push({
                            status: sStatus
                        });
                    }
                });

                const oStatusModel = new JSONModel({
                    statuses: aStatuses
                });

                this.getView().setModel(
                    oStatusModel,
                    "invoiceStatus"
                );

                console.log(
                    "Unique Invoice Statuses:",
                    aStatuses
                );

            } catch (oError) {
                console.error(
                    "Failed to load invoice statuses:",
                    oError
                );
            }
        },

        onInvoiceFilterChange: function () {
            this._applyInvoiceFilters();
        },

        onInStatusFilterChange: function () {
            this._applyInvoiceFilters();
        },

        _applyInvoiceFilters: function () {
            const oTable = this.byId("invoiceTable");
            const oBinding = oTable.getBinding("items");

            if (!oBinding) {
                return;
            }

            const aFilters = [];

            const aInvoiceCodeKeys =
                this.byId("invoiceFilter").getSelectedKeys();

            if (aInvoiceCodeKeys.length > 0) {
                const aCodeFilters = aInvoiceCodeKeys.map(function (sKey) {
                    return new Filter(
                        "invoiceNumber",
                        FilterOperator.EQ,
                        sKey
                    );
                });

                aFilters.push(
                    new Filter({
                        filters: aCodeFilters,
                        and: false
                    })
                );
            }

            const aInvoiceStatusKeys =
                this.byId("inStatusFilter").getSelectedKeys();

            if (aInvoiceStatusKeys.length > 0) {
                const aStatusFilters = aInvoiceStatusKeys.map(function (sKey) {
                    return new Filter(
                        "invoiceStatus",
                        FilterOperator.EQ,
                        sKey
                    );
                });

                aFilters.push(
                    new Filter({
                        filters: aStatusFilters,
                        and: false
                    })
                );
            }

            oBinding.filter(aFilters);
        },

        onCancelInvoice: function () {
            this._exitInvoiceEditMode();
            MessageToast.show("Invoice editing cancelled.");
        }

    });
});