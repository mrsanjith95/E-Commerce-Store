const Review = require('../models/Review');
const Product = require('../models/Product');

/**
 * Helper function: Recalculate and synchronize Product rating & numReviews
 */
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const rating = numReviews > 0
    ? Number((reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews).toFixed(1))
    : 0;

  await Product.findByIdAndUpdate(productId, {
    rating,
    numReviews,
  });
};

/**
 * @desc    Create a product review
 * @route   POST /api/products/:productId/reviews
 * @access  Private
 */
const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    // 1. Validate Product existence
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 2. Validate Rating (must be integer between 1 and 5)
    const parsedRating = Number(rating);
    if (
      rating === undefined ||
      rating === null ||
      isNaN(parsedRating) ||
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5',
      });
    }

    // 3. Validate Comment (must not be empty)
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required and cannot be empty',
      });
    }

    // 4. Prevent Duplicate Review from the same user for this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    // 5. Create Review associating authenticated user
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      name: req.user.name,
      rating: parsedRating,
      comment: comment.trim(),
    });

    // 6. Recalculate average rating & review count for the product
    await updateProductRating(productId);

    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    // Handle MongoDB duplicate key error if race condition occurs
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all reviews for a specific product
 * @route   GET /api/products/:productId/reviews
 * @access  Public
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private (Owner or Admin)
 */
const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check authorization: Must be review owner or admin
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    const productId = review.product;

    await Review.findByIdAndDelete(reviewId);

    // Recalculate average rating & review count for the product
    await updateProductRating(productId);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews across all products (Admin only)
 * @route   GET /api/reviews
 * @access  Private/Admin
 */
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('product', 'name category price image')
      .populate('user', 'name email role');

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  deleteReview,
  getAllReviews,
};
