const mongoose = require('mongoose');

const batchImportsSchema = new mongoose.Schema(
    {
        batchId: { type: String, required: true },
        importer: { type: String, required: true },
        fileInfo: { type: Object, required: true },
        data: { type: Array, required: true },
    },
    { timestamps: true },
);

module.exports = batchImportsSchema;