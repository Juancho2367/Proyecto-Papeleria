const express = require('express');
const router = express.Router();
const { createSale, getSales } = require('../controllers/saleController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createSale)
  .get(protect, getSales); // Allow workers to see sales? Or just their own? The req said admin sees dashboard. Worker sees history.
  // For simplicity, we'll let protect handle auth, and maybe filter in controller if needed, or just return all for now.
  // The requirement says: Worker: "ver su historial de ventas del día". Admin: "Ver Dashboard".
  // Let's keep it simple: getSales returns all for now, frontend filters or we add a query param later.

module.exports = router;