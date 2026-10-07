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

    return Controller.extend("project1.controller.VendorObject", {

        onInit: function () {

            var oView = this.getView();


            var oVenModel = new JSONModel({
                venId: "",
                vendorCode: "",
                vendorName: "",
                country: "",
                region: "",
                vendorCategory: "",
                materialCategory: "",
                contactPerson: "",
                email: "",
                phone: "",
                vendorStatus: ""
            });

            oView.setModel(oVenModel, "ven");


            var oUIModel = new JSONModel({
                editMode: false,
                isNew: false
            });

            oView.setModel(oUIModel, "ui");


            var oRouter = UIComponent.getRouterFor(this);

            oRouter
                .getRoute("VendorObject")
                .attachPatternMatched(
                    this._onVendorRouteMatched,
                    this
                );
        },


        _onVendorRouteMatched: function (oEvent) {

            var oArguments =
                oEvent.getParameter("arguments");


            var sVenPath =
                oArguments.ven;

            if (!sVenPath) {

                MessageBox.error(
                    "Vendor path not found."
                );

                return;
            }

            sVenPath =
                decodeURIComponent(sVenPath);


            if (sVenPath.charAt(0) !== "/") {
                sVenPath = "/" + sVenPath;
            }


            this._sVenPath = sVenPath;


            console.log(
                "Selected Vendor path:",
                sVenPath
            );
            this._loadVendor(sVenPath);
        },



        _loadVendor: async function (sVenPath) {

            try {

                console.log(
                    "Loading Vendor:",
                    sVenPath
                );


                var oODataModel =
                    this._getODataModel();

                if (!oODataModel) {

                    MessageBox.error(
                        "OData model is not available."
                    );

                    return;
                }


    
                var oContextBinding =
                    oODataModel.bindContext(
                        sVenPath
                    );


          
                var oVendor =
                    await oContextBinding.requestObject();


                console.log(
                    "Vendor data received:",
                    oVendor
                );


                if (!oVendor) {

                    MessageBox.error(
                        "Vendor not found."
                    );

                    return;
                }


            
                var oVenModel =
                    this.getView().getModel("ven");


                oVenModel.setData({

                    venId:
                        oVendor.ID || "",

                    vendorCode:
                        oVendor.vendorCode || "",

                    vendorName:
                        oVendor.vendorName || "",

                    country:
                        oVendor.country || "",

                    region:
                        oVendor.region || "",

                    vendorCategory:
                        oVendor.vendorCategory || "",

                    materialCategory:
                        oVendor.materialCategory || "",

                    contactPerson:
                        oVendor.contactPerson || "",

                    email:
                        oVendor.email || "",

                    phone:
                        oVendor.phone !== null &&
                        oVendor.phone !== undefined
                            ? String(oVendor.phone)
                            : "",

                    vendorStatus:
                        oVendor.vendorStatus || ""
                });


                var oUIModel =
                    this.getView().getModel("ui");

                oUIModel.setData({

                    editMode: false,

                    isNew: false
                });

                console.log(
                    "Vendor model updated:",
                    oVenModel.getData()
                );

                MessageToast.show(
                    "Vendor loaded successfully."
                );

            } catch (oError) {

                console.error(
                    "Failed to load Vendor:",
                    oError
                );


                MessageBox.error(
                    "Failed to load Vendor.\n\n" +
                    (oError.message || "")
                );
            }
        },
  
        _getODataModel: function () {

            var oModel =
                this.getOwnerComponent().getModel();

            if (!oModel) {

                console.error(
                    "Default OData model not found."
                );
            }

            return oModel;
        },

        onEdit: function () {

            var oUIModel =
                this.getView().getModel("ui");

            oUIModel.setProperty(
                "/editMode",
                true
            );

            MessageToast.show(
                "Edit mode enabled."
            );
        },


        onCancelEdit: function () {

            var oUIModel =
                this.getView().getModel("ui");

            oUIModel.setProperty(
                "/editMode",
                false
            );

            // Reload original backend data
            if (this._sVenPath) {
                this._loadVendor(
                    this._sVenPath
                );
            }

            MessageToast.show(
                "Edit cancelled."
            );
        }

    });
});
