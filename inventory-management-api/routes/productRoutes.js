const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  adjustStock,
  deleteProduct,
  getLowStockReport,
  getCategorySummary
} = require('../controllers/productController');

// Report & Aggregation Routes (Place BEFORE /:id)
router.get('/low-stock', getLowStockReport);
router.get('/summary', getCategorySummary);

// Base CRUD Routes
router.route('/')
  .post(createProduct)
  .get(getAllProducts);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

// Stock Adjustment Route
router.patch('/:id/stock', adjustStock);

module.exports = router;