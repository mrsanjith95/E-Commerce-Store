const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getProtected,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Get current logged in user details
// @access  Private
router.get('/me', protect, getMe);

// @route   GET /api/auth/protected
// @desc    Test protected route access
// @access  Private
router.get('/protected', protect, getProtected);

module.exports = router;
