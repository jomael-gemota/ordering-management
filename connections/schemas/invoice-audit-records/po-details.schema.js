const mongoose = require('mongoose');

const poDetailsSchema = new mongoose.Schema(
    {
        brand: { type: String, required: true },
        segment: { type: String, required: true },
        poNumber: { type: String, unique: true },
        listingDataItems: { type: Array },
        ocItems: { type: Array },
        invoiceItems: { type: Array },
        poUploadItems: { type: Array },
    }
);

module.exports = poDetailsSchema;