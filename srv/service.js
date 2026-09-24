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
})