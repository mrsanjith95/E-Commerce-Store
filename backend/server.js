const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Initialize Express application
const app = express();

// Core Middleware configuration
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON payloads

// Health-check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'E-Commerce API is running',
  });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Product Routes
app.use('/api/products', productRoutes);

// Cart Routes
app.use('/api/cart', cartRoutes);

// Order Routes
app.use('/api/orders', orderRoutes);

// Middleware for handling non-existent routes (404)
app.use(notFound);

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

/**
 * Connect to MongoDB first, then start the Express server
 */
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
