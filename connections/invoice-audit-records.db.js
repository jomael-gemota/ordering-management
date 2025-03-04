const mongoose = require('mongoose');
const key = require('ckey');

const invoiceAuditRecordsConn = mongoose.createConnection(key.MONGODB_INVOICE_AUDIT);

invoiceAuditRecordsConn.model('purchase_orders', require('./schemas/invoice-audit-records/purchase-order.schema'));
invoiceAuditRecordsConn.model('batch_imports', require('./schemas/invoice-audit-records/batch-imports.schema'));

module.exports = invoiceAuditRecordsConn;