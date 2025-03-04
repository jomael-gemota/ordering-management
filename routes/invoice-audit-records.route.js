const router = require('express').Router();
const invoiceAuditRecords = require('../controllers/invoice-audit-records.controller');

router.get('/purchase-orders/all-imports', invoiceAuditRecords.getAllPurchaseOrders);
router.get('/purchase-orders/:poNumber', invoiceAuditRecords.getPODetailsByPONumber);
router.post('/purchase-orders/import', invoiceAuditRecords.importPurchaseOrder);
router.post('/purchase-orders/new-order', invoiceAuditRecords.createNewPurchaseOrder);

module.exports = router;