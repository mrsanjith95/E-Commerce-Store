const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get user's shopping cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find cart for the authenticated user and populate product details
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          total: 0,
        },
      });
    }

    let total = 0;
    const formattedItems = [];

    // Calculate subtotal for each item and overall total
    for (const item of cart.items) {
      if (item.product) {
        const subtotal = item.product.price * item.quantity;
        total += subtotal;

        formattedItems.push({
          product: item.product,
          quantity: item.quantity,
          subtotal,
        });
      }
    }

    return res.status(200).json({
      success: true,
      cart: {
        items: formattedItems,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product to cart or update quantity if already in cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    // 1. Validate productId presence and format
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID is required',
      });
    }

    // 2. Validate quantity is a positive integer
    const parsedQuantity = quantity !== undefined ? Number(quantity) : 1;
    if (isNaN(parsedQuantity) || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
      });
    }

    // 3. Verify product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 4. Verify initial requested quantity against product stock
    if (parsedQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }

    // 5. Find or create user cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if product is already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Product already exists in cart -> calculate new total quantity
      const newQuantity = cart.items[existingItemIndex].quantity + parsedQuantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock',
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      await cart.save();

      return res.status(200).json({
        success: true,
        message: 'Cart item updated',
        cart,
      });
    } else {
      // Product is new to cart -> push new item
      cart.items.push({
        product: productId,
        quantity: parsedQuantity,
      });
      await cart.save();

      return res.status(201).json({
        success: true,
        message: 'Product added to cart',
        cart,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:productId
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Validate quantity is a positive integer
    const parsedQuantity = Number(quantity);
    if (quantity === undefined || isNaN(parsedQuantity) || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
      });
    }

    // 3. Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    // 4. Check if item exists in user's cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    // 5. Verify product stock in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (parsedQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }

    // 6. Update quantity and save
    cart.items[itemIndex].quantity = parsedQuantity;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove an item from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    // Check if item exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    // Remove item and save
    cart.items.splice(itemIndex, 1);
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
