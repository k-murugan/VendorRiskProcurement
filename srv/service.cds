using { db } from '../db/schema';

service VendorRiskService {

    entity Vendors as projection on db.Vendors;
    function totalVendor() returns Integer;
    function getPOStatusCounts() returns array of {
        status : String;
        count  : Integer;
    };
    entity PurchaseOrders as projection on db.PurchaseOrders;

    entity PurchaseOrderItems as projection on db.PurchaseOrderItems;

    entity Materials as projection on db.Materials;

    entity Deliveries as projection on db.Deliveries;

    entity Invoices as projection on db.Invoices;

    entity QualityComplaints as projection on db.QualityComplaints;

    entity ComplianceCertificates as projection on db.ComplianceCertificates;

    entity RiskAssessments as projection on db.RiskAssessments;

    entity RiskAlerts as projection on db.RiskAlerts;

    entity RiskRules as projection on db.RiskRules;
    
}
