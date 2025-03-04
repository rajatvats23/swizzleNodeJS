// src/services/product.service.js
const Product = require('../models/product.model');
const imageUploadService = require('./image-upload.service');

/**
 * Get all active products
 * @param {Object} query - Query parameters for filtering
 * @returns {Promise<Array>} List of products
 */
const getAllProducts = async (query = {}) => {
  try {
    const filter = { isActive: true };
    
    // Add category filter if provided
    if (query.category) {
      filter.category = query.category;
    }
    
    // Add search filter if provided
    if (query.search) {
      filter.$text = { $search: query.search };
    }
    
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .lean();
      
    return products;
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    throw new Error('Failed to fetch products');
  }
};

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Product object
 */
const getProductById = async (id) => {
  try {
    const product = await Product.findOne({ _id: id, isActive: true })
      .populate('category', 'name')
      .lean();
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  } catch (error) {
    console.error(`Error in getProductById (${id}):`, error);
    throw error;
  }
};

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @param {Object} user - User object
 * @returns {Promise<Object>} Created product
 */
const createProduct = async (productData, user) => {
  try {
    // Create new product
    const newProduct = new Product({
      ...productData,
      createdBy: user._id,
      updatedBy: user._id
    });
    
    // Save product
    const savedProduct = await newProduct.save();
    return await getProductById(savedProduct._id);
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
};

/**
 * Update a product
 * @param {string} id - Product ID
 * @param {Object} updateData - Product update data
 * @param {Object} user - User object
 * @returns {Promise<Object>} Updated product
 */
const updateProduct = async (id, updateData, user) => {
  try {
    // Find product
    const product = await Product.findOne({ _id: id, isActive: true });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        product[key] = updateData[key];
      }
    });
    
    // Set updatedBy
    product.updatedBy = user._id;
    
    // Save product
    const updatedProduct = await product.save();
    return await getProductById(updatedProduct._id);
  } catch (error) {
    console.error(`Error in updateProduct (${id}):`, error);
    throw error;
  }
};

/**
 * Delete a product (soft delete)
 * @param {string} id - Product ID
 * @param {Object} user - User object
 * @returns {Promise<Object>} Deleted product
 */
const deleteProduct = async (id, user) => {
  try {
    // Find product
    const product = await Product.findOne({ _id: id, isActive: true });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Soft delete
    product.isActive = false;
    product.updatedBy = user._id;
    
    // Save product
    const deletedProduct = await product.save();
    return deletedProduct.toObject();
  } catch (error) {
    console.error(`Error in deleteProduct (${id}):`, error);
    throw error;
  }
};

/**
 * Hard delete a product and its images
 * @param {string} id - Product ID
 * @returns {Promise<void>}
 */
const hardDeleteProduct = async (id) => {
  try {
    // Find product
    const product = await Product.findById(id);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Delete images from S3
    if (product.images?.length) {
      for (const imageUrl of product.images) {
        await imageUploadService.deleteFile(imageUrl);
      }
    }
    
    // Delete product from database
    await Product.deleteOne({ _id: id });
  } catch (error) {
    console.error(`Error in hardDeleteProduct (${id}):`, error);
    throw error;
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct
};