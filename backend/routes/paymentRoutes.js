const express = require('express');
const router = express.Router();

const {
  createRazorpayOrder,
  verifyPayment,
} = require('../controllers/paymentController');

const { protect } = require('../middleware/authMiddleware');

// All payment routes require authentication
router.use(protect);

// POST /api/payment/create-order - Create Razorpay payment order
router.post('/create-order', createRazorpayOrder);

// POST /api/payment/verify - Verify payment signature & confirm order
router.post('/verify', verifyPayment);

module.exports = router;
