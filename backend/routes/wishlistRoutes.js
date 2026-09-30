const express = require('express');
const router = express.Router();

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require('../controllers/wishlistController');

const { protect } = require('../middleware/authMiddleware');

// All wishlist routes require authentication
router.use(protect);

// GET /api/wishlist - Get user's wishlist
// DELETE /api/wishlist - Clear user's wishlist
router.route('/').get(getWishlist).delete(clearWishlist);

// POST /api/wishlist/:productId - Add product to wishlist
// DELETE /api/wishlist/:productId - Remove product from wishlist
router.route('/:productId').post(addToWishlist).delete(removeFromWishlist);

module.exports = router;
