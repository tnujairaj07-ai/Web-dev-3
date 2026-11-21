require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());

// Mount API routes
app.use('/api/products', productRoutes);

// 404 Handler for unknown routes
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});