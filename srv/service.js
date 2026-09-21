const cds = require("@sap/cds");
module.exports = cds.service.impl(async function(){
    const {Vendors, PurchaseOrders} = this.entities;
    this.on("totalVendor", async(req)=>{
        const result = await SELECT.one
            .from(Vendors)
            .columns`count(*) as count`;
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