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

        if (!Array.isArray(data)) {
            return res.status(400).json({ message: "Invalid data format" });
        };

        for (const item of data) {
            try {
                const formattedItem = {
                    poNumber: item["PO"],
                    pullPONumber: item["Pull PO"],
                    brand: item["Brand"],
                    segment: item["Segment"],
                    itemType: item["Item-Type"],
                    upc: item["UPC"],
                    asin: item["ASIN"],
                    sku: item["SKU"],
                    title: item["Title"],
                    itemCost: item["Item Cost"],
                    discCost: item["Disc. Cost"],
                    qty: item["Qty"],
                    totalCost: item["Total Cost"],
                };

                const existingProduct = await invoiceAuditRecordsConn.models.products.findOne({
                    poNumber: formattedItem.poNumber,
                    sku: formattedItem.sku,
                });

                if (!existingProduct) {
                    const newProduct = new invoiceAuditRecordsConn.models.products(formattedItem);
                    await newProduct.save();
                };

                const categoryFieldMap = {
                    "listing-data": "listingDataItems",
                    "order-confirmation": "ocItems",
                    "invoice": "invoiceItems",
                    "po-upload": "poUploadItems",
                };

                const fieldToUpdate = categoryFieldMap[formattedItem.itemType];
                if (!fieldToUpdate) continue;

                let poDetail = await invoiceAuditRecordsConn.models.po_details.findOne({ poNumber: formattedItem.poNumber });

                if (!poDetail) {
                    poDetail = new invoiceAuditRecordsConn.models.po_details({
                        ...formattedItem,
                        pullPOItems: [],
                        listingDataItems: [],
                        ocItems: [],
                        invoiceItems: [],
                        poUploadItems: [],
                    });
                };

                if (!poDetail[fieldToUpdate].includes(formattedItem.sku)) {
                    poDetail[fieldToUpdate].push(formattedItem.sku);
                };

                if (formattedItem.pullPONumber && !poDetail.pullPOItems.includes(formattedItem.pullPONumber)) {
                    poDetail.pullPOItems.push(formattedItem.pullPONumber);
                };

                await poDetail.save();

            } catch (error) {
                console.error(`Error processing SKU: ${item["SKU"]}`, error); 
            };
        };

        return res.status(200).json({ message: "PO Data processed successfully" });
    } catch (error) {
        res.status(500).json({ error });
    };
}

module.exports = { getPODetailsByPONumber, importProducts };