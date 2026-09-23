const mongoose = require('mongoose');
const Product = require('../models/Product');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    // Sort products by creation date in descending order (newest first)
    const products = await Product.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // 1. Validate required fields
    if (!name || !description || price === undefined || price === null || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, category, image',
      });
    }

    // 2. Validate field constraints
    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Product name must be at least 2 characters long',
      });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a number greater than or equal to 0',
      });
    }

    const numericStock = stock !== undefined ? Number(stock) : 0;
    if (isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a number greater than or equal to 0',
      });
    }

    // 3. Create product in database
    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      category: category.trim(),
      image,
      stock: numericStock,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const { name, description, price, category, image, stock, rating, numReviews } = req.body;

    // Validate provided field updates
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Product name must be at least 2 characters long',
        });
      }
      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a number greater than or equal to 0',
        });
      }
      product.price = numericPrice;
    }

    if (category !== undefined) {
      product.category = category.trim();
    }

    if (image !== undefined) {
      product.image = image;
    }

    if (stock !== undefined) {
      const numericStock = Number(stock);
      if (isNaN(numericStock) || numericStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock must be a number greater than or equal to 0',
        });
      }
      product.stock = numericStock;
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);
      if (isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be a number between 0 and 5',
        });
      }
      product.rating = numericRating;
    }

    if (numReviews !== undefined) {
      const numericReviews = Number(numReviews);
      if (isNaN(numericReviews) || numericReviews < 0) {
        return res.status(400).json({
          success: false,
          message: 'Number of reviews must be a number greater than or equal to 0',
        });
      }
      product.numReviews = numericReviews;
    }

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
