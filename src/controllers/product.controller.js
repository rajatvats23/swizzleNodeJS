const { validationResult } = require('express-validator');
const productService = require('../services/product.service');

/**
 * Get all products with pagination, sorting, and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllProducts = async (req, res) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortDirection = req.query.sortDirection === 'asc' ? 1 : -1;
    const search = req.query.search || '';
    const categoryId = req.query.categoryId || null;
    const vegetarian = req.query.vegetarian === 'true';
    const vegan = req.query.vegan === 'true';
    const glutenFree = req.query.glutenFree === 'true';
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build search and filter query
    const searchQuery = { isActive: true };
    
    // Add text search if provided
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add category filter if provided
    if (categoryId) {
      searchQuery.categoryId = categoryId;
    }
    
    // Add dietary preference filters if specified
    if (req.query.vegetarian === 'true') {
      searchQuery.isVegetarian = true;
    }
    
    if (req.query.vegan === 'true') {
      searchQuery.isVegan = true;
    }
    
    if (req.query.glutenFree === 'true') {
      searchQuery.isGlutenFree = true;
    }
    
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortDirection;
    
    // Get total count for pagination
    const total = await productService.countProducts(searchQuery);
    
    // Get paginated, filtered, and sorted products
    const products = await productService.getPaginatedProducts(
      searchQuery,
      sortObj,
      skip,
      limit,
      ['category'] // Populate category reference
    );
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    // Return response with pagination info
    res.status(200).json({
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error in getAllProducts controller:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch products'
    });
  }
};

/**
 * Get products by category ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProductsByCategory = async (req, res) => {
  try {
    const products = await productService.getProductsByCategory(req.params.categoryId);
    res.status(200).json(products);
  } catch (error) {
    if (error.message === 'Category not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to fetch products by category'
    });
  }
};

/**
 * Get product by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to fetch product'
    });
  }
};

/**
 * Create a new product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createProduct = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Create product
    const product = await productService.createProduct(req.body, req.user);
    
    res.status(201).json(product);
  } catch (error) {
    if (error.message === 'Product with this name already exists') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Category not found or inactive') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to create product'
    });
  }
};

/**
 * Update a product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProduct = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Update product
    const product = await productService.updateProduct(
      req.params.id,
      req.body,
      req.user
    );
    
    res.status(200).json(product);
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Product with this name already exists' || 
        error.message === 'Category not found or inactive') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to update product'
    });
  }
};

/**
 * Delete a product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id, req.user);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to delete product'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};