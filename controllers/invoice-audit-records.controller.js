const invoiceAuditRecordsConn = require('../connections/invoice-audit-records.db');

const getPODetailsByPONumber = async (req, res, next) => {
    try {
        const result = await invoiceAuditRecordsConn.models.purchase_orders.find({
            poNumber: req.params.poNumber,
        })

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error });  
    };
};

const getAllPurchaseOrders = async (req, res, next) => {
    try {
        const result = await invoiceAuditRecordsConn.models.batch_imports.find();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    };
};

const createNewPurchaseOrder = async (req, res, next) => {
    try {
        const { batchId, importer, fileInfo, data } = req.body;

        if (!batchId || !importer || !data || !Array.isArray(data)) {
            return res.status(400).json({ message: "Missing required fields or invalid data format" });
        }

        const newBatch = new invoiceAuditRecordsConn.models.batch_imports({
            batchId,
            importer,
            fileInfo,
            data,
        });

        const savedBatch = await newBatch.save();

        res.status(201).json({
            message: "Batch created successfully",
            batch: savedBatch,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const importPurchaseOrder = async (req, res, next) => {
    try {
        const data = req.body.items;

        if (!Array.isArray(data)) {
            return res.status(400).json({ message: "Invalid data format" });
        };

        let duplicateRecords = [];

        for (const item of data) {
            try {
                const poNumber = item["PO"];
                const brand = item["Brand"];
                const segment = item["Segment"];

                const poItem = {
                    poNumber: item["PO"],
                    pullPONumber: item["Pull PO"],
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

                let poDetail = await invoiceAuditRecordsConn.models.purchase_orders.findOne({ poNumber: poNumber });

                if (!poDetail) {
                    poDetail = new invoiceAuditRecordsConn.models.purchase_orders({
                        poNumber: poNumber,
                        brand: brand,
                        segment: segment,
                        poData: [poItem],
                    });
                } else {
                    const isDuplicate = poDetail.poData.some(existingItem => 
                        existingItem.sku === poItem.sku &&
                        existingItem.itemType === poItem.itemType &&
                        existingItem.pullPONumber === poItem.pullPONumber
                    );
                    
                    if (!isDuplicate) {
                        poDetail.poData.push(poItem);
                    } else {
                        poItem.poNumber = poNumber;
                        poItem.brand = brand;
                        poItem.segment = segment;

                        duplicateRecords.push(poItem);
                    };
                };

                await poDetail.save();
            } catch (error) {
                console.error(`Error processing SKU: ${item["SKU"]}`, error);
            };
        };

        console.log({
            message: "PO Data processed successfully",
            duplicates: duplicateRecords,
        });

        return res.status(200).json({
            message: "PO Data processed successfully",
            duplicates: duplicateRecords,
        });
    } catch (error) {
        res.status(500).json({ error });
    };
};

module.exports = { getPODetailsByPONumber, importPurchaseOrder, createNewPurchaseOrder, getAllPurchaseOrders };