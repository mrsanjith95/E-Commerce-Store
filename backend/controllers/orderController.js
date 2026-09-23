const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Create new order (Checkout)
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod } = req.body;

    // 1. Validate shipping address
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
        message: 'Please provide all shipping address fields: address, city, state, postalCode, country',
      });
    }

    // Validate payment method if provided
    if (paymentMethod && !['COD', 'CARD'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be COD or CARD',
      });
    }

    // 2. Retrieve user's cart from MongoDB
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    // 3. Reject checkout if cart is empty
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // 4 & 5. Verify every product exists and stock is sufficient
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

    // 6, 7 & 8. Calculate prices server-side using current database prices
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      const price = product.price; // Price directly from database
      const subtotal = price * item.quantity;
      itemsPrice += subtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price,
        quantity: item.quantity,
        subtotal,
      });
    }

    // shippingPrice: 0 when itemsPrice >= 5000, 100 otherwise
    const shippingPrice = itemsPrice >= 5000 ? 0 : 100;

    // taxPrice: 18% of itemsPrice
    const taxPrice = Number((itemsPrice * 0.18).toFixed(2));

    // totalPrice: itemsPrice + shippingPrice + taxPrice
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    // 9. Create the Order document
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });

    // 10. Reduce product stock by ordered quantities
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 11. Clear user's cart
    cart.items = [];
    await cart.save();

    // 12. Return success response
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Retrieve user's orders sorted by newest first
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private (User view own / Admin view any)
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await Order.findById(id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Authorization check: User can only view own order, admin can view any
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (Admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    // Validate allowed status
    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.orderStatus = status;

    // If status is updated to Delivered, record delivery date
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
