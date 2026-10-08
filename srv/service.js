const cds = require("@sap/cds");
module.exports = cds.service.impl(async function(){
    const {Vendors, PurchaseOrders, Invoices} = this.entities;
    this.on("totalVendor", async(req)=>{
        const result = await cds.run(SELECT.one
            .from(Vendors)
            .columns("count(*) as count"));
        return Number(result.count);
    })
    this.on("totalPO", async(req)=>{
        const result = await cds.run(SELECT.one
            .from(PurchaseOrders)
            .columns("count(*) as count"));
        return Number(result.count);
    })
    this.on("totalInvoice", async(req)=>{
        const result = await cds.run(SELECT.one
            .from(Invoices)
            .columns("count(*) as count"));
        return Number(result.count);
    })
     this.on("getPOStatusCounts", async () => {

        const result = await cds.run(`
            SELECT poStatus AS status, COUNT(*) AS count
            FROM db_PurchaseOrders
            GROUP BY poStatus
        `);
       console.log("PO Status Counts:", result);
        return result;

    });
    // this.before(['CREATE','UPDATE'], Invoices, async (req) => {
    //     const data = req.data;
    //     if (!data.invoiceNumber) {
    //         req.error(400, 'Invoice number is required');
    //     }
    //     if (!data.vendor_ID) {
    //         req.error(400, 'Vendor is required');
    //     }
    //     if (!data.purchaseOrder_ID) {
    //         req.error(400, 'Purchase Order is required');
    //     }
    //     if (!data.materialCode) {
    //         req.error(400, 'Material code is required');
    //     }
    //     if (data.quantity === undefined || data.quantity === null) {
    //         req.error(400, 'Quantity is required');
    //     }

    //     const vendor = await SELECT.one
    //         .from(Vendors)
    //         .where({
    //             ID: data.vendor_ID
    //         });

    //     if (!vendor) {
    //         req.error(400, 'Selected Vendor does not exist');
    //     }

    //     const po = await SELECT.one
    //         .from(PurchaseOrders)
    //         .where({
    //             ID: data.purchaseOrder_ID
    //         });

    //     if (!po) {
    //         req.error(400, 'Selected Purchase Order does not exist');
    //     }

    //     if (po.vendor_ID !== data.vendor_ID) {
    //         req.error(
    //             400,
    //             'Selected Purchase Order does not belong to this Vendor'
    //         );
    //     }

    //     if (data.newPrice !== undefined && data.newPrice !== null) {
    //         const previousInvoice = await SELECT.one
    //             .from(Invoices)
    //             .columns(
    //                 'oldPrice',
    //                 'currentPrice'
    //             )
    //             .where({
    //                 vendor_ID: data.vendor_ID,
    //                 materialCode: data.materialCode
    //             })
    //             .orderBy('invoiceDate desc');


    //         if (!previousInvoice) {
    //             data.oldPrice = 0;
    //             data.currentPrice = data.newPrice;
    //             data.priceDifference = 0;
    //             data.priceDeviationPercent = 0;
    //         }


    //         else {
    //             const existingPrice =
    //                 Number(previousInvoice.currentPrice);
    //             const newPrice =
    //                 Number(data.newPrice);

    //             if (newPrice !== existingPrice) {
    //                 data.oldPrice = existingPrice;
    //                 data.currentPrice = newPrice;
    //                 data.priceDifference =
    //                     newPrice - existingPrice;
    //                 if (existingPrice !== 0) {

    //                     data.priceDeviationPercent =
    //                         ((newPrice - existingPrice)
    //                         / existingPrice) * 100;

    //                 } else {

    //                     data.priceDeviationPercent = 0;
    //                 }
    //             }
    //             else {
    //                 data.oldPrice =
    //                     previousInvoice.oldPrice;
    //                 data.currentPrice =
    //                     existingPrice;
    //                 data.priceDifference = 0;
    //                 data.priceDeviationPercent = 0;
    //             }
    //         }
    //     }

    //     if (
    //         data.quantity !== undefined &&
    //         data.quantity !== null &&
    //         data.currentPrice !== undefined &&
    //         data.currentPrice !== null
    //     ) {

    //         data.invoiceAmount =
    //             Number(data.quantity) *
    //             Number(data.currentPrice);
    //     }

    //     const deviation =
    //         Number(data.priceDeviationPercent || 0);
    //     if (deviation <= 10) {
    //         data.riskLevel='Low';
    //     } else if (deviation <= 25) { 
    //         data.riskLevel = 'Medium'; 
    //     } else { 
    //         data.riskLevel = 'High'; 
    //     }

    //     if (!data.invoiceStatus) {
    //         data.invoiceStatus = 'Draft';
    //     }

    // });
})