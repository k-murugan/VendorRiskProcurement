namespace db;

entity Vendors {
    key ID                  : UUID;
    vendorCode              : String(20);
    vendorName              : String(100);
    country                 : String(50);
    region                  : String(50);
    vendorCategory          : String(50);
    materialCategory        : String(100);

    contactPerson            : String(100);
    email                    : String(100);
    phone                    : String(30);

    criticalVendor           : Boolean default false;
    approvalStatus           : String(20);

    currentRiskScore         : Decimal(5,2) default 0;
    riskLevel                : String(20);

    lastRiskCalculation      : Timestamp;
    active                   : Boolean default true;

    purchaseOrders           : Association to many PurchaseOrders
                              on purchaseOrders.vendor = $self;

    deliveries               : Association to many Deliveries
                              on deliveries.vendor = $self;

    invoices                 : Association to many Invoices
                              on invoices.vendor = $self;

    qualityComplaints        : Association to many QualityComplaints
                              on qualityComplaints.vendor = $self;

    complianceCertificates   : Association to many ComplianceCertificates
                              on complianceCertificates.vendor = $self;

    riskAssessments          : Association to many RiskAssessments
                              on riskAssessments.vendor = $self;

    riskAlerts               : Association to many RiskAlerts
                              on riskAlerts.vendor = $self;
}


entity PurchaseOrders {
    key ID                   : UUID;
    poNumber                 : String(30);

    vendor                   : Association to Vendors;

    companyCode              : String(10);
    purchasingOrg            : String(20);
    purchasingGroup          : String(20);
    plant                    : String(20);

    poDate                   : Date;
    expectedDeliveryDate     : Date;

    poStatus                 : String(20);

    totalAmount              : Decimal(15,2);
    currency                 : String(5);

    paymentTerms             : String(20);
    contractReference        : String(50);
    buyer                    : String(100);

    items                    : Composition of many PurchaseOrderItems
                              on items.purchaseOrder = $self;
}


entity PurchaseOrderItems {
    key ID                   : UUID;

    purchaseOrder            : Association to PurchaseOrders;

    itemNumber               : Integer;
    materialCode             : String(40);
    materialDescription      : String(200);
    materialGroup            : String(50);

    orderedQuantity          : Decimal(15,3);
    unit                     : String(10);

    oldUnitPrice             : Decimal(15,2);
    newUnitPrice             : Decimal(15,2);

    priceDifference          : Decimal(15,2);
    priceDeviationPercent    : Decimal(5,2);

    contractPrice            : Decimal(15,2);
    currency                 : String(5);

    requestedDeliveryDate    : Date;
}


entity Deliveries {
    key ID                   : UUID;

    vendor                   : Association to Vendors;
    purchaseOrder            : Association to PurchaseOrders;

    poItemNumber             : Integer;
    materialCode             : String(40);

    expectedDeliveryDate     : Date;
    actualDeliveryDate       : Date;

    orderedQuantity          : Decimal(15,3);
    deliveredQuantity        : Decimal(15,3);

    deliveryStatus           : String(20);
    delayDays                : Integer;

    partialDelivery          : Boolean;
    shipmentStatus           : String(30);
    deliveryPercentage       : Decimal(5,2);

    remarks                  : String(500);
}


entity Invoices {
    key ID                   : UUID;

    invoiceNumber            : String(40);

    vendor                   : Association to Vendors;
    purchaseOrder            : Association to PurchaseOrders;

    invoiceDate              : Date;
    materialCode             : String(40);

    quantity                 : Decimal(15,3);

    oldPrice                 : Decimal(15,2);
    currentPrice             : Decimal(15,2);

    priceDifference          : Decimal(15,2);
    priceDeviationPercent    : Decimal(5,2);

    invoiceAmount            : Decimal(15,2);
    currency                 : String(5);

    invoiceStatus             : String(20);
    blocked                   : Boolean;

    mismatch                  : Boolean;
}


entity QualityComplaints {
    key ID                   : UUID;

    complaintNumber           : String(40);

    vendor                    : Association to Vendors;
    purchaseOrder             : Association to PurchaseOrders;

    materialCode              : String(40);

    complaintDate             : Date;
    defectType                : String(100);
    severity                  : String(20);

    rejectedQuantity          : Decimal(15,3);
    inspectedQuantity         : Decimal(15,3);
    defectPercentage          : Decimal(5,2);

    complaintStatus            : String(20);

    qualityScore               : Decimal(5,2);

    rootCause                  : String(500);
    correctiveAction           : String(500);

    resolvedDate               : Date;
}


entity ComplianceCertificates {
    key ID                    : UUID;

    vendor                    : Association to Vendors;

    materialCode              : String(40);

    certificateNumber         : String(50);
    certificateType           : String(100);

    issuingAuthority          : String(150);

    issueDate                 : Date;
    expiryDate                : Date;

    mandatory                 : Boolean;
    status                    : String(20);

    country                   : String(50);

    documentURL               : String(500);

    daysToExpiry              : Integer;

    verificationStatus        : String(20);

    remarks                   : String(500);
}


entity RiskAssessments {
    key ID                    : UUID;

    vendor                    : Association to Vendors;

    assessmentDate            : Timestamp;

    deliveryRisk              : Decimal(5,2);
    priceRisk                 : Decimal(5,2);
    qualityRisk               : Decimal(5,2);
    complianceRisk            : Decimal(5,2);
    financialRisk             : Decimal(5,2);

    totalRiskScore            : Decimal(5,2);

    riskLevel                 : String(20);

    calculationStatus         : String(20);
    calculatedBy              : String(100);
}


entity RiskAlerts {
    key ID                    : UUID;

    alertNumber               : String(40);

    vendor                    : Association to Vendors;
    riskAssessment            : Association to RiskAssessments;

    alertType                 : String(50);
    severity                  : String(20);

    riskScore                 : Decimal(5,2);
    threshold                 : Decimal(5,2);

    message                   : String(500);

    recipientVendor           : String(100);
    recipientManager          : String(100);

    status                    : String(20);

    createdAt                 : Timestamp;
    sentAt                    : Timestamp;
    acknowledgedAt            : Timestamp;

    resolutionRemarks         : String(500);
}


entity RiskRules {
    key ID                    : UUID;

    riskType                  : String(30);

    condition                 : String(200);

    minValue                  : Decimal(15,2);
    maxValue                  : Decimal(15,2);

    score                     : Decimal(5,2);

    weight                    : Decimal(5,2);

    active                    : Boolean;

    effectiveFrom             : Date;
    effectiveTo               : Date;
}