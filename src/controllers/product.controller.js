// src/controllers/product.controller.js
const { validationResult } = require('express-validator');
const productService = require('../services/product.service');

/**
 * Get all products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error in getAllProducts controller:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch products'
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
    console.error('Error in createProduct controller:', error);
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
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};