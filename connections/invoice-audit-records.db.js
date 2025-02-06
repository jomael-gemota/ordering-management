const mongoose = require('mongoose');
const key = require('ckey');

const invoiceAuditRecordsConn = mongoose.createConnection(key.MONGODB_INVOICE_AUDIT);

invoiceAuditRecordsConn.model('po_details', require('./schemas/invoice-audit-records/po-details.schema'));
invoiceAuditRecordsConn.model('products', require('./schemas/invoice-audit-records/products.schema'));

module.exports = invoiceAuditRecordsConn;