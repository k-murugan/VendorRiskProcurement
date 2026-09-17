const cds = require("@sap/cds");
module.exports = cds.service.impl(async function(){
    const {Vendors} = this.entities;
    this.on("totalVendor", async(req)=>{
        const result = await SELECT.one
            .from(Vendors)
            .columns`count(*) as count`;
        return Number(result.count);
    })
})