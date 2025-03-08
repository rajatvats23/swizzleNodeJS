const { validationResult } = require('express-validator');
const addonService = require('../services/addon.service');

/**
 * Get all addons with pagination, sorting, and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAddons = async (req, res) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortDirection = req.query.sortDirection === 'asc' ? 1 : -1;
    const search = req.query.search || '';
    const addonType = req.query.addonType || '';
    const selectionType = req.query.selectionType || '';
    const productId = req.query.productId || '';
    
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
    
    // Add addon type filter if provided
    if (addonType) {
      searchQuery.addonType = addonType;
    }
    
    // Add selection type filter if provided
    if (selectionType) {
      searchQuery.selectionType = selectionType;
    }
    
    // Add product filter if provided
    if (productId) {
      searchQuery.applicableProducts = productId;
    }
    
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortDirection;
    
    // Get total count for pagination
    const total = await addonService.countAddons(searchQuery);
    
    // Get paginated, filtered, and sorted addons
    const addons = await addonService.getPaginatedAddons(
      searchQuery,
      sortObj,
      skip,
      limit,
      ['products'] // Populate product references
    );
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    // Return response with pagination info
    res.status(200).json({
      data: addons,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error in getAllAddons controller:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch addons'
    });
  }
};

/**
 * Get addons by type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAddonsByType = async (req, res) => {
  try {
    const addons = await addonService.getAddonsByType(req.params.type);
    res.status(200).json(addons);
  } catch (error) {
    res.status(500).json({ 
      message: error.message || 'Failed to fetch addons by type'
    });
  }
};

/**
 * Get addons for a specific product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAddonsByProduct = async (req, res) => {
  try {
    const addons = await addonService.getAddonsByProduct(req.params.productId);
    res.status(200).json(addons);
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to fetch addons for product'
    });
  }
};

/**
 * Get addon by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAddonById = async (req, res) => {
  try {
    const addon = await addonService.getAddonById(req.params.id);
    res.status(200).json(addon);
  } catch (error) {
    if (error.message === 'Addon not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to fetch addon'
    });
  }
};

/**
 * Create a new addon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAddon = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Create addon
    const addon = await addonService.createAddon(req.body, req.user);
    
    res.status(201).json(addon);
  } catch (error) {
    if (error.message === 'Addon with this name already exists') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes('not found or inactive')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to create addon'
    });
  }
};

/**
 * Update an addon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAddon = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Update addon
    const addon = await addonService.updateAddon(
      req.params.id,
      req.body,
      req.user
    );
    
    res.status(200).json(addon);
  } catch (error) {
    if (error.message === 'Addon not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Addon with this name already exists' || 
        error.message.includes('not found or inactive')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to update addon'
    });
  }
};

/**
 * Delete an addon
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAddon = async (req, res) => {
  try {
    await addonService.deleteAddon(req.params.id, req.user);
    res.status(200).json({ message: 'Addon deleted successfully' });
  } catch (error) {
    if (error.message === 'Addon not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ 
      message: error.message || 'Failed to delete addon'
    });
  }
};

module.exports = {
  getAllAddons,
  getAddonsByType,
  getAddonsByProduct,
  getAddonById,
  createAddon,
  updateAddon,
  deleteAddon
};