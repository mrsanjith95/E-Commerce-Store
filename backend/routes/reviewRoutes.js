const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  createReview,
  getProductReviews,
  deleteReview,
  getAllReviews,
} = require('../controllers/reviewController');

const { protect, adminMiddleware } = require('../middleware/authMiddleware');

// Nested product review routes (/api/products/:productId/reviews)
// and standalone review routes (/api/reviews)

// Admin route to get all reviews across products: GET /api/reviews
router.get('/', (req, res, next) => {
  // If mergedParams has productId, return reviews for that product, else admin all reviews
  if (req.params.productId) {
    return getProductReviews(req, res, next);
  }
  return protect(req, res, () => adminMiddleware(req, res, () => getAllReviews(req, res, next)));
});

// Create review for product: POST /api/products/:productId/reviews
router.post('/', protect, createReview);

// Delete review: DELETE /api/reviews/:reviewId
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
