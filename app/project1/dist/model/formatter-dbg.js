sap.ui.define([], function () {
    "use strict";

    return {

        poStatusState: function (sStatus) {

            switch (sStatus) {

                case "DRAFT":
                    return "None";

                case "PENDING_APPROVAL":
                    return "Warning";

                case "APPROVED":
                    return "Success";

                case "REJECTED":
                    return "Error";

                case "SENT_TO_VENDOR":
                    return "Information";

                case "ACCEPTED":
                    return "Success";

                case "PARTIALLY_DELIVERED":
                    return "Warning";

                case "FULLY_DELIVERED":
                    return "Success";

                case "CANCELLED":
                    return "Error";

                case "CLOSED":
                    return "None";

                default:
                    return "None";
            }
        },
        riskLevelState: function (sRiskLevel) {

    switch (sRiskLevel) {

        case "Low":
            return "Success";

        case "Medium":
            return "Warning";

        case "High":
            return "Error";

        default:
            return "None";
    }
}

    };
    
});