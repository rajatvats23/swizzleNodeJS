const Category = require('../models/category.model');
const imageUploadService = require('./image-upload.service');

/**
 * Count categories based on query
 * @param {Object} query - MongoDB query object
 * @returns {Promise<number>} - Count of matching categories
 */
const countCategories = async (query) => {
  try {
    return await Category.countDocuments(query);
  } catch (error) {
    console.error('Error in countCategories:', error);
    throw new Error('Failed to count categories');
  }
};

/**
 * Get paginated and sorted categories
 * @param {Object} query - MongoDB query object
 * @param {Object} sort - MongoDB sort object
 * @param {number} skip - Number of documents to skip
 * @param {number} limit - Limit of documents to return
 * @returns {Promise<Array>} - Array of category documents
 */
const getPaginatedCategories = async (query, sort, skip, limit) => {
  try {
    return await Category.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  } catch (error) {
    console.error('Error in getPaginatedCategories:', error);
    throw new Error('Failed to fetch paginated categories');
  }
};

/**
 * Get all active categories
 * @returns {Promise<Array>} List of categories
 */
const getAllCategories = async () => {
  try {
    return await Category.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    throw new Error('Failed to fetch categories');
  }
};

/**
 * Get category by ID
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Category object
 */
const getCategoryById = async (id) => {
  try {
    const category = await Category.findOne({ _id: id, isActive: true }).lean();
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    return category;
  } catch (error) {
    console.error(`Error in getCategoryById (${id}):`, error);
    throw error;
  }
};

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @param {Object} user - User object
 * @returns {Promise<Object>} Created category
 */
const createCategory = async (categoryData, user) => {
  try {
    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: categoryData.name,
      isActive: true
    });
    
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }
    
    // Create new category
    const newCategory = new Category({
      ...categoryData,
      createdBy: user._id,
      updatedBy: user._id
    });
    
    // Save category
    const savedCategory = await newCategory.save();
    return savedCategory.toObject();
  } catch (error) {
    console.error('Error in createCategory:', error);
    throw error;
  }
};

/**
 * Update a category
 * @param {string} id - Category ID
 * @param {Object} updateData - Category update data
 * @param {Object} user - User object
 * @returns {Promise<Object>} Updated category
 */
const updateCategory = async (id, updateData, user) => {
  try {
    // Find category
    const category = await Category.findOne({ _id: id, isActive: true });
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    // Check if name is changed and not already taken
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: updateData.name,
        _id: { $ne: id },
        isActive: true
      });
      
      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }
    }
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        category[key] = updateData[key];
      }
    });
    
    // Set updatedBy
    category.updatedBy = user._id;
    
    // Save category
    const updatedCategory = await category.save();
    return updatedCategory.toObject();
  } catch (error) {
    console.error(`Error in updateCategory (${id}):`, error);
    throw error;
  }
};

/**
 * Delete a category (soft delete)
 * @param {string} id - Category ID
 * @param {Object} user - User object
 * @returns {Promise<Object>} Deleted category
 */
const deleteCategory = async (id, user) => {
  try {
    // Find category
    const category = await Category.findOne({ _id: id, isActive: true });
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    // Soft delete
    category.isActive = false;
    category.updatedBy = user._id;
    
    // Save category
    const deletedCategory = await category.save();
    return deletedCategory.toObject();
  } catch (error) {
    console.error(`Error in deleteCategory (${id}):`, error);
    throw error;
  }
};

/**
 * Hard delete a category and its images
 * @param {string} id - Category ID
 * @returns {Promise<void>}
 */
const hardDeleteCategory = async (id) => {
  try {
    // Find category
    const category = await Category.findById(id);
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    // Delete images from S3
    if (category.imageUrl) {
      await imageUploadService.deleteFile(category.imageUrl);
    }
    
    if (category.thumbnailUrl) {
      await imageUploadService.deleteFile(category.thumbnailUrl);
    }
    
    // Delete category from database
    await Category.deleteOne({ _id: id });
  } catch (error) {
    console.error(`Error in hardDeleteCategory (${id}):`, error);
    throw error;
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  hardDeleteCategory,
  countCategories,        // New method
  getPaginatedCategories  // New method
};