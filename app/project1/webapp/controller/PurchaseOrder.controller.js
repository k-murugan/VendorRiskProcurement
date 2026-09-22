sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("project1.controller.PurchaseOrder", {
      onInit() {
      },
     async addPO() {
            if (!this.dialog) {
                this.dialog = await this.loadFragment({
                    name: "project1.view.PO"
                    // id: this.getView().getId()
                });
            }
            this.dialog.open();
        },
        onCloseDialog() {
            this.byId("Dialog")?.close();
        },
        onDeletePO: function(){
            const oTable = this.byId("poTable");
            const oSelectedItem = oTable.getSelectedItem();
            if(!oSelectedItem){
                sap.m.MessageToast.show("Please select a PO to delete");
                return;
            }
            const oContext = oSelectedItem.getBindingContext();
            oContext.delete().then(()=>{
                sap.m.MessageToast.show("PO deleted successfully");
                oTable.removeSelections(true);
            }).catch((oError)=>{
                sap.m.MessageToast.show("Failed to delete PO")
            })
        }
  });
});