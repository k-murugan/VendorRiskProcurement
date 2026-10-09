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

                this._VenContext = oContextBinding.getBoundContext();
          
                var oVendor =
                    await oContextBinding.requestObject();
                // this._VenContext = oVendorContext;

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


                    this.getView()
            .getModel("ui")
            .setData({

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
      onSave: async function () {

    var oVenModel =
        this.getView().getModel("ven");

    var oVen =
        oVenModel.getData();

    var oDataModel =
        this._getODataModel();


    if (!oDataModel) {

        MessageBox.error(
            "OData model is not available."
        );

        return;
    }


    if (!oVen.venId) {

        MessageBox.error(
            "Vendor ID is missing."
        );

        return;
    }


    if (!this._VenContext) {

        MessageBox.error(
            "Vendor context is not available."
        );

        return;
    }


    try {

        console.log(
            "Saving Vendor:",
            oVen
        );


        /*
         * Update backend properties
         *
         * IMPORTANT:
         * Use the actual CDS field names.
         */

        this._VenContext.setProperty(
            "vendorCode",
            oVen.vendorCode
        );


        this._VenContext.setProperty(
            "vendorName",
            oVen.vendorName
        );


        this._VenContext.setProperty(
            "country",
            oVen.country
        );


        this._VenContext.setProperty(
            "region",
            oVen.region
        );


        this._VenContext.setProperty(
            "vendorCategory",
            oVen.vendorCategory
        );


        this._VenContext.setProperty(
            "materialCategory",
            oVen.materialCategory
        );


        this._VenContext.setProperty(
            "contactPerson",
            oVen.contactPerson
        );


        this._VenContext.setProperty(
            "email",
            oVen.email
        );


        this._VenContext.setProperty(
            "phone",
            oVen.phone
        );


        this._VenContext.setProperty(
            "vendorStatus",
            oVen.vendorStatus
        );


        /*
         * Send changes to backend
         */
        await oDataModel.submitBatch(
            "$auto"
        );


        console.log(
            "Vendor saved successfully."
        );


        /*
         * Exit edit mode
         */
        this.getView()
            .getModel("ui")
            .setProperty(
                "/editMode",
                false
            );


        MessageToast.show(
            "Vendor updated successfully."
        );


        /*
         * Reload backend data
         */
        await this._loadVendor(
            this._sVenPath
        );


    } catch (oError) {

        console.error(
            "Failed to save Vendor:",
            oError
        );


        MessageBox.error(
            "Failed to save Vendor.\n\n" +
            (
                oError.message ||
                "Unknown error"
            )
        );
    }
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
