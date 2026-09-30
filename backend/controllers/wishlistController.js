const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * @desc    Get authenticated user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    }

    return res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product to user's wishlist
 * @route   POST /api/wishlist/:productId
 * @access  Private
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Verify product existence
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        products: [],
      });
    }

    // Prevent duplicate products in wishlist
    const exists = wishlist.products.some(
      (id) => id.toString() === productId
    );

    if (!exists) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate('products');

    return res.status(200).json({
      success: true,
      message: exists ? 'Product already in wishlist' : 'Product added to wishlist',
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove product from user's wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: 'Wishlist is empty',
        wishlist: { user: req.user._id, products: [] },
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();
    await wishlist.populate('products');

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear all items from user's wishlist
 * @route   DELETE /api/wishlist
 * @access  Private
 */
const clearWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    } else {
      wishlist = { user: req.user._id, products: [] };
    }

    return res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};
