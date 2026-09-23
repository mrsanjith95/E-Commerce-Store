const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

// Route: /api/orders
router
  .route('/')
  .post(protect, createOrder)
  .get(protect, adminMiddleware, getAllOrders);

// Route: /api/orders/my-orders (Must be defined before /:id to prevent matching 'my-orders' as id)
router.route('/my-orders').get(protect, getMyOrders);

// Route: /api/orders/:id
router.route('/:id').get(protect, getOrderById);

// Route: /api/orders/:id/status
router.route('/:id/status').put(protect, adminMiddleware, updateOrderStatus);

module.exports = router;
