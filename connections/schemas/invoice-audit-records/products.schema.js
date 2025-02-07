const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema(
    {
        poNumber: { type: String, required: true },
        pullPONumber: { type: String, required: true },
        brand: { type: String, required: true },
        segment: { type: String, required: true },
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

module.exports = productsSchema;