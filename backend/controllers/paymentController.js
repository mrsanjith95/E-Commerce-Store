const crypto = require('crypto');
const Razorpay = require('razorpay');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Initialize Razorpay client using environment variables
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder';

  return new Razorpay({
    key_id,
    key_secret,
  });
};

/**
 * @desc    Create a Razorpay order from user's current server-side cart
 * @route   POST /api/payment/create-order
 * @access  Private
 */
const createRazorpayOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Retrieve user's cart from MongoDB
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty',
      });
    }

    // 2. Verify products exist and stock is sufficient
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: 'One or more products in your cart no longer exist',
        });
      }

      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${item.product.name}`,
        });
      }
    }

    // 3. Calculate order pricing server-side using current database prices
    let itemsPrice = 0;
    for (const item of cart.items) {
      itemsPrice += item.product.price * item.quantity;
    }

    const shippingPrice = itemsPrice >= 5000 ? 0 : 100;
    const taxPrice = Number((itemsPrice * 0.18).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    // Convert total price to smallest currency unit (paise for INR)
    const amountInPaise = Math.round(totalPrice * 100);

    // 4. Create Razorpay order
    const razorpay = getRazorpayInstance();
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${userId.toString().substring(18)}`,
      notes: {
        userId: userId.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 5. Return safe order details to frontend (never exposing secrets)
    return res.status(200).json({
      success: true,
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error.message);
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature & create application Order
 * @route   POST /api/payment/verify
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
    } = req.body;

    // 1. Validate inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification parameters',
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete shipping address details',
      });
    }

    // 2. Prevent duplicate processing if payment was already verified
    const existingOrder = await Order.findOne({
      $or: [
        { razorpayPaymentId: razorpay_payment_id },
        { razorpayOrderId: razorpay_order_id },
      ],
    }).populate('user', 'name email');

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: 'Payment already processed and order confirmed',
        order: existingOrder,
      });
    }

    // 3. Server-side signature verification using HMAC SHA256
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder';
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.',
      });
    }

    // 4. Retrieve user's cart to construct authoritative application order
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Cannot complete order creation.',
      });
    }

    // 5. Calculate prices & items from MongoDB cart
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: 'One or more items in cart no longer exist',
        });
      }

      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${item.product.name}`,
        });
      }

      const price = item.product.price;
      const subtotal = price * item.quantity;
      itemsPrice += subtotal;

      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        image: item.product.image,
        price,
        quantity: item.quantity,
        subtotal,
      });
    }

    const shippingPrice = itemsPrice >= 5000 ? 0 : 100;
    const taxPrice = Number((itemsPrice * 0.18).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    // 6. Create application Order document marked as Paid
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'Paid',
      paidAt: Date.now(),
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    // 7. Decrement product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 8. Clear user's cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: 'Payment verified and order created successfully',
      order,
    });
  } catch (error) {
    console.error('Razorpay Verify Error:', error.message);
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};
