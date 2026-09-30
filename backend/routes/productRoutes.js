const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');
const reviewRoutes = require('./reviewRoutes');

// Nested router for reviews on products: /api/products/:productId/reviews
router.use('/:productId/reviews', reviewRoutes);

// @route   GET /api/products - Get all products (Public)
// @route   POST /api/products - Create a product (Admin only)
router
  .route('/')
  .get(getProducts)
  .post(protect, adminMiddleware, createProduct);

// @route   GET /api/products/:id - Get single product by ID (Public)
// @route   PUT /api/products/:id - Update product by ID (Admin only)
// @route   DELETE /api/products/:id - Delete product by ID (Admin only)
router
  .route('/:id')
  .get(getProductById)
  .put(protect, adminMiddleware, updateProduct)
  .delete(protect, adminMiddleware, deleteProduct);

module.exports = router;

