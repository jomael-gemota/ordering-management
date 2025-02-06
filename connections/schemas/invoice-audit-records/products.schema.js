const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema(
    {
        poNumber: { type: String, required: true },
        itemType: { type: String, required: true },
        sku: { type: String, required: true },
        upc: { type: String },
        asin: { type: String },
        title: { type: String },
        itemCost: { type: Number },
        dicCost: { type: Number },
        qty: { type: Number },
        total: { type: Number },
    }
);

module.exports = productsSchema;