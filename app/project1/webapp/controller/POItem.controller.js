sap.ui.define([sap/ui/core/mvc/Controller], (Controller)=>{
    "use strict";
    return Controller.extend("project1.controller.POItem",{
        onInit(){
          const router = UIComponent.getRouterFor(this);
          router.getRoute("employee").attachPatternMatched(this.onObjectMatched, this);
        },
       
    })
})