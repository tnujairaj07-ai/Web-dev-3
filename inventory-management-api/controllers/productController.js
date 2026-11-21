const Product = require('../models/Product');

// 1. Create a new product
// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// 2. Get all products (Filtering, Search, Sorting & Pagination)
// GET /api/products
const getAllProducts = async (req, res, next) => {
  try {
    const { category, supplier, search, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (supplier) filter.supplier = supplier;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sorting (default: newest first)
    const sortBy = sort ? sort.split(',').join(' ') : '-createdAt';

    // Pagination calculation
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get single product by ID
// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// 4. Update product details
// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// 5. Safe Stock Adjustment (Restock / Sale)
// PATCH /api/products/:id/stock
const adjustStock = async (req, res, next) => {
  try {
    const { change } = req.body;

    if (typeof change !== 'number' || isNaN(change)) {
      res.status(400);
      throw new Error('Please provide a valid numeric "change" value (e.g., 10 or -5)');
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Prevent negative stock during sale operations
    if (product.quantity + change < 0) {
      res.status(400);
      throw new Error(`Insufficient stock. Current quantity is ${product.quantity}`);
    }

    product.quantity += change;
    await product.save();

    res.status(200).json({
      message: 'Stock updated',
      product
    });
  } catch (error) {
    next(error);
  }
};

// 6. Delete product
// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.status(200).json({
      message: 'Product deleted',
      id: product._id
    });
  } catch (error) {
    next(error);
  }
};

// 7. Low-Stock Alert Report (Aggregation Pipeline)
// GET /api/products/low-stock
const getLowStockReport = async (req, res, next) => {
  try {
    const lowStockItems = await Product.aggregate([
      {
        $match: {
          $expr: { $lte: ['$quantity', '$reorderLevel'] }
        }
      },
      {
        $addFields: {
          stockValue: { $multiply: ['$price', '$quantity'] },
          id: { $toString: '$_id' }
        }
      },
      {
        $sort: { quantity: 1 }
      }
    ]);

    res.status(200).json({
      count: lowStockItems.length,
      lowStockItems
    });
  } catch (error) {
    next(error);
  }
};

// 8. Category-wise Inventory Summary (Aggregation Pipeline)
// GET /api/products/summary
const getCategorySummary = async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $project: {
          _id: 1,
          totalItems: 1,
          totalQuantity: 1,
          totalStockValue: 1,
          avgPrice: { $round: ['$avgPrice', 2] }
        }
      },
      {
        $sort: { totalStockValue: -1 }
      }
    ]);

    res.status(200).json({
      categories: summary.length,
      summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  adjustStock,
  deleteProduct,
  getLowStockReport,
  getCategorySummary
};