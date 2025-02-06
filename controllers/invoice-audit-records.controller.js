const invoiceAuditRecordsConn = require('../connections/invoice-audit-records.db');

const getPODetailsByPONumber = async (req, res, next) => {
    try {
        const result = await invoiceAuditRecordsConn.models.po_details.find({
            poNumber: req.params.poNumber,
        })

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error });  
    };
};

const importProducts = async (req, res, next) => {
    try {
        const data = req.body.data;

        for (const item of data) {
            const { brand, segment, category, poNumber, sku } = item;

            const categoryFieldMap = {
                "listing-data": "listingDataItems",
                "order-confirmation": "ocItems",
                "invoice": "invoiceItems",
                "po-upload": "poUploadItems",
            };

            const fieldToUpdate = categoryFieldMap[category];
            if (!fieldToUpdate) continue;

            let poDetail = await invoiceAuditRecordsConn.models.po_details.findOne({ poNumber });

            if (!poDetail) {
                poDetail = new invoiceAuditRecordsConn.models.po_details({
                    brand,
                    segment,
                    poNumber,
                    listingDataItems: [],
                    ocItems: [],
                    invoiceItems: [],
                    poUploadItems: [],
                });
            };

            if (!poDetail[fieldToUpdate].includes(sku)) {
                poDetail[fieldToUpdate].push(sku);
            };

            await poDetail.save();
        }

        return res.status(200).json({ message: "PO Data processed successfully" });
    } catch (error) {
        res.status(500).json({ error });
    }
}

module.exports = { getPODetailsByPONumber, importProducts };