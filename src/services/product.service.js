const Product = require('../models/product.model');
const Category = require('../models/category.model');
const imageUploadService = require('./image-upload.service');
const mongoose = require('mongoose');

/**
 * Count products based on query
 * @param {Object} query - MongoDB query object
 * @returns {Promise<number>} - Count of matching products
 */
const countProducts = async (query) => {
  try {
    return await Product.countDocuments(query);
  } catch (error) {
    console.error('Error in countProducts:', error);
    throw new Error('Failed to count products');
  }
};

/**
 * Get paginated and sorted products
 * @param {Object} query - MongoDB query object
 * @param {Object} sort - MongoDB sort object
 * @param {number} skip - Number of documents to skip
 * @param {number} limit - Limit of documents to return
 * @param {Array} populate - Array of fields to populate
 * @returns {Promise<Array>} - Array of product documents
 */
const getPaginatedProducts = async (query, sort, skip, limit, populate = []) => {
  try {
    let productQuery = Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Apply population if any fields specified
    if (populate.includes('category')) {
      productQuery = productQuery.populate('categoryId', 'name imageUrl');
    }

    return await productQuery.lean();
  } catch (error) {
    console.error('Error in getPaginatedProducts:', error);
    throw new Error('Failed to fetch paginated products');
  }
};

/**
 * Get all active products
 * @param {Object} filters - Optional filter conditions
 * @returns {Promise<Array>} List of products
 */
const getAllProducts = async (filters = {}) => {
  try {
    const query = { isActive: true, ...filters };
    
    return await Product.find(query)
      .populate('categoryId', 'name imageUrl')
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    throw new Error('Failed to fetch products');
  }
};

/**
 * Get products by category ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<Array>} List of products
 */
const getProductsByCategory = async (categoryId) => {
  try {
    // Validate that category exists
    const categoryExists = await Category.exists({ _id: categoryId, isActive: true });
    if (!categoryExists) {
      throw new Error('Category not found');
    }
    
    return await Product.find({ 
      categoryId: categoryId,
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    console.error(`Error in getProductsByCategory (${categoryId}):`, error);
    throw error;
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
      .populate('categoryId', 'name imageUrl')
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
    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ 
      name: productData.name,
      isActive: true
    });
    
    if (existingProduct) {
      throw new Error('Product with this name already exists');
    }
    
    // Validate category exists
    const categoryExists = await Category.exists({ 
      _id: productData.categoryId,
      isActive: true
    });
    
    if (!categoryExists) {
      throw new Error('Category not found or inactive');
    }
    
    // Ensure at least one variant is marked as default if variants exist
    if (productData.variants && productData.variants.length > 0) {
      const hasDefault = productData.variants.some(variant => variant.isDefault);
      if (!hasDefault) {
        productData.variants[0].isDefault = true;
      }
    }
    
    // Create new product
    const newProduct = new Product({
      ...productData,
      createdBy: user._id,
      updatedBy: user._id
    });
    
    // Save product
    const savedProduct = await newProduct.save();
    return savedProduct.toObject();
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
    
    // Check if category is being updated
    if (updateData.categoryId) {
      // Validate category exists
      const categoryExists = await Category.exists({ 
        _id: updateData.categoryId,
        isActive: true
      });
      
      if (!categoryExists) {
        throw new Error('Category not found or inactive');
      }
    }
    
    // Check if name is changed and not already taken
    if (updateData.name && updateData.name !== product.name) {
      const existingProduct = await Product.findOne({ 
        name: updateData.name,
        _id: { $ne: id },
        isActive: true
      });
      
      if (existingProduct) {
        throw new Error('Product with this name already exists');
      }
    }
    
    // Handle variants update
    if (updateData.variants) {
      // Ensure at least one variant is marked as default if variants exist
      const hasDefault = updateData.variants.some(variant => variant.isDefault);
      if (updateData.variants.length > 0 && !hasDefault) {
        updateData.variants[0].isDefault = true;
      }
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
    return updatedProduct.toObject();
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
    if (product.imageUrl) {
      await imageUploadService.deleteFile(product.imageUrl);
    }
    
    if (product.thumbnailUrl) {
      await imageUploadService.deleteFile(product.thumbnailUrl);
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
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
  countProducts,
  getPaginatedProducts
};