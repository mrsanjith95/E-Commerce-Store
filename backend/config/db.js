const mongoose = require('mongoose');

/**
 * Connect to MongoDB database using Mongoose
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'ecommerce_store',
    });
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code if connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
