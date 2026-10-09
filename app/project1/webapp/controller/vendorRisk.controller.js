sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";
 
    return Controller.extend("project1.controller.App", {
 
        // ---------------------------------------
        // Init: load vendor list, select first vendor
        // ---------------------------------------
 
        onInit: function () {
 
            console.log("Controller loaded");
 
            const oView = this.getView();
            const oModel = oView.getModel();
 
            console.log("MODEL EXISTS =", !!oModel);
 
            oView.setModel(new JSONModel({ list: [] }), "vendors");
 
            oModel.bindList("/Vendors")
                .requestContexts(0, 200)
                .then(function (aContexts) {
 
                    const aVendors = aContexts.map(function (oContext) {
                        const oVendor = oContext.getObject();
        return {
            ID: oVendor.ID,
            label: oVendor.vendorCode + " - " + oVendor.vendorName
        };
                    });
 
                    console.log("VENDORS =", aVendors);
 
                    oView.getModel("vendors").setProperty("/list", aVendors);
 
                    if (aVendors.length) {
                        this.byId("vendorSelect").setSelectedKey(aVendors[0].ID);
                        this.loadDashboard(aVendors[0].ID);
                    }
 
                }.bind(this))
                .catch(function (oError) {
                    console.error("VENDORS ERROR =", oError);
                });
 
        },
 
 
        // ---------------------------------------
        // User picks a vendor
        // ---------------------------------------
 
        onVendorChange: function (oEvent) {
 
            const sVendorId = oEvent.getParameter("selectedItem").getKey();
 
            this.loadDashboard(sVendorId);
 
        },
 
 
        // ---------------------------------------
        // Load everything for one vendor
        // ---------------------------------------
 
        loadDashboard: function (sVendorId) {
 
            const oModel = this.getView().getModel();
 
            this.loadVendor(oModel, sVendorId);
            this.loadRisk(oModel, sVendorId);
 
        },
 
 
        // ---------------------------------------
        // Vendor details
        // ---------------------------------------
 
        loadVendor: function (oModel, sVendorId) {
 
            oModel.bindContext("/Vendors(" + sVendorId + ")")
                .requestObject()
                .then(function (oVendor) {
 
                    this.byId("vendorCode").setText(oVendor.vendorCode || "-");
                    this.byId("vendorName").setText(oVendor.vendorName || "-");
 
                }.bind(this))
                .catch(function (oError) {
                    console.error("VENDOR ERROR =", oError);
                });
 
        },
 
 
        // ---------------------------------------
        // Latest risk assessment for the vendor
        // ---------------------------------------
 
        loadRisk: function (oModel, sVendorId) {
 
            const oBinding = oModel.bindList(
                "/RiskAssessments",
                null,
                [],
                [],
                {
                    $filter: "vendor_ID eq " + sVendorId,
                    $orderby: "assessmentDate desc"
                }
            );
 
            oBinding.requestContexts(0, 1)
                .then(function (aContexts) {
 
                    if (aContexts.length === 0) {
                        console.log("No RiskAssessments for vendor", sVendorId);
                        this.resetRisk();
                        return;
                    }
 
                    const oData = aContexts[0].getObject();
 
                    console.log("RISK DATA =", oData);
 
                    this.byId("overallRisk").setNumber(oData.overallRiskScore);
                    this.setRiskStatus(this.byId("overallLevel"), oData.overallRiskScore);
                    this.byId("deliveryRisk").setNumber(oData.deliveryRisk);
                    this.setRiskStatus(this.byId("deliveryStatus"), oData.deliveryRisk);
 
                    this.byId("qualityRisk").setNumber(oData.qualityRisk);
                    this.setRiskStatus(this.byId("qualityStatus"), oData.qualityRisk);
 
                    this.byId("priceRisk").setNumber(oData.priceRisk);
                    this.setRiskStatus(this.byId("priceStatus"), oData.priceRisk);
 
                }.bind(this))
                .catch(function (oError) {
                    console.error("RISK ERROR =", oError);
                });
 
        },
 
 
        // ---------------------------------------
        // Clear the cards when a vendor has no assessment
        // ---------------------------------------
 
        resetRisk: function () {
 
            ["overallRisk", "deliveryRisk", "qualityRisk", "priceRisk"].forEach(function (sId) {
                this.byId(sId).setNumber("0");
            }.bind(this));
 
            ["overallLevel", "deliveryStatus", "qualityStatus", "priceStatus"].forEach(function (sId) {
                this.byId(sId).setText("No assessment");
                this.byId(sId).setState("None");
            }.bind(this));
 
        },
 
 
        // ---------------------------------------
        // Set Risk Status based on Risk Score
        // ---------------------------------------
 
        setRiskStatus: function (oStatusControl, vScore) {
 
            const nScore = Number(vScore);
 
            let sText;
            let sState;
 
            if (nScore <= 30) {
                sText = "Low Risk";
                sState = "Success";
            } else if (nScore <= 60) {
                sText = "Medium Risk";
                sState = "Warning";
            } else if (nScore <= 80) {
                sText = "High Risk";
                sState = "Error";
            } else {
                sText = "Critical Risk";
                sState = "Error";
            }
 
            oStatusControl.setText(sText);
            oStatusControl.setState(sState);
 
        }
 
    });
 
});
 