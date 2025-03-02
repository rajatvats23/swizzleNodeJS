const { validationResult } = require('express-validator');
const categoryService = require('../services/category.service');

/**
 * Get all categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error in getAllCategories controller:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch categories'
    });
  }
};

/**
 * Get category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json(category);
  } catch (error) {
    if (error.message === 'Category not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to fetch category'
    });
  }
};

/**
 * Create a new category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCategory = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Create category
    const category = await categoryService.createCategory(req.body, req.user);
    
    res.status(201).json(category);
  } catch (error) {
    if (error.message === 'Category with this name already exists') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to create category'
    });
  }
};

/**
 * Update a category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCategory = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Update category
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body,
      req.user
    );
    
    res.status(200).json(category);
  } catch (error) {
    if (error.message === 'Category not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Category with this name already exists') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to update category'
    });
  }
};

/**
 * Delete a category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id, req.user);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    if (error.message === 'Category not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to delete category'
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};