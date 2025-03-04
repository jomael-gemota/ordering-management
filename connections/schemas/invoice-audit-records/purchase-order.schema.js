const mongoose = require('mongoose');

const poDataSchema = new mongoose.Schema(
    {
        pullPONumber: { type: String },
        itemType: { type: String, required: true },
        upc: { type: String },
        asin: { type: String },
        sku: { type: String, required: true },
        title: { type: String },
        itemCost: { type: Number },
        discCost: { type: Number },
        qty: { type: Number },
        totalCost: { type: Number },
    }
);

const purchaseOrderSchema = new mongoose.Schema(
    {
        brand: { type: String, required: true },
        segment: { type: String, required: true },
        poNumber: { type: String, unique: true },
        poData: [poDataSchema],
    },
    { timestamps: true },
);

module.exports = purchaseOrderSchema;