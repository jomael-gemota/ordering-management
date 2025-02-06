const router = require('express').Router();
const invoiceAuditRecords = require('../controllers/invoice-audit-records.controller');

router.get('/po-details/:poNumber', invoiceAuditRecords.getPODetailsByPONumber);
router.post('/po-details/import', invoiceAuditRecords.importProducts);

module.exports = router;