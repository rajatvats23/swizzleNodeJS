const Addon = require('../models/addon.model');
const Product = require('../models/product.model');
const imageUploadService = require('./image-upload.service');

/**
 * Count addons based on query
 * @param {Object} query - MongoDB query object
 * @returns {Promise<number>} - Count of matching addons
 */
const countAddons = async (query) => {
  try {
    return await Addon.countDocuments(query);
  } catch (error) {
    console.error('Error in countAddons:', error);
    throw new Error('Failed to count addons');
  }
};

/**
 * Get paginated and sorted addons
 * @param {Object} query - MongoDB query object
 * @param {Object} sort - MongoDB sort object
 * @param {number} skip - Number of documents to skip
 * @param {number} limit - Limit of documents to return
 * @param {Array} populate - Array of fields to populate
 * @returns {Promise<Array>} - Array of addon documents
 */
const getPaginatedAddons = async (query, sort, skip, limit, populate = []) => {
  try {
    let addonQuery = Addon.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Apply population if any fields specified
    if (populate.includes('products')) {
      addonQuery = addonQuery.populate('applicableProducts', 'name imageUrl');
    }

    return await addonQuery.lean();
  } catch (error) {
    console.error('Error in getPaginatedAddons:', error);
    throw new Error('Failed to fetch paginated addons');
  }
};

/**
 * Get all active addons
 * @param {Object} filters - Optional filter conditions
 * @returns {Promise<Array>} List of addons
 */
const getAllAddons = async (filters = {}) => {
  try {
    const query = { isActive: true, ...filters };
    
    return await Addon.find(query)
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    console.error('Error in getAllAddons:', error);
    throw new Error('Failed to fetch addons');
  }
};

/**
 * Get addons by type
 * @param {string} addonType - Addon type
 * @returns {Promise<Array>} List of addons of specified type
 */
const getAddonsByType = async (addonType) => {
  try {
    return await Addon.find({ 
      addonType: addonType,
      isActive: true 
    })
      .sort({ name: 1 })
      .lean();
  } catch (error) {
    console.error(`Error in getAddonsByType (${addonType}):`, error);
    throw error;
  }
};

/**
 * Get addons for a specific product
 * @param {string} productId - Product ID
 * @returns {Promise<Array>} List of addons applicable to the product
 */
const getAddonsByProduct = async (productId) => {
  try {
    // Validate that product exists
    const productExists = await Product.exists({ _id: productId, isActive: true });
    if (!productExists) {
      throw new Error('Product not found');
    }
    
    return await Addon.find({ 
      applicableProducts: productId,
      isActive: true 
    })
      .sort({ addonType: 1, name: 1 })
      .lean();
  } catch (error) {
    console.error(`Error in getAddonsByProduct (${productId}):`, error);
    throw error;
  }
};

/**
 * Get addon by ID
 * @param {string} id - Addon ID
 * @returns {Promise<Object>} Addon object
 */
const getAddonById = async (id) => {
  try {
    const addon = await Addon.findOne({ _id: id, isActive: true })
      .populate('applicableProducts', 'name imageUrl')
      .lean();
    
    if (!addon) {
      throw new Error('Addon not found');
    }
    
    return addon;
  } catch (error) {
    console.error(`Error in getAddonById (${id}):`, error);
    throw error;
  }
};

/**
 * Create a new addon
 * @param {Object} addonData - Addon data
 * @param {Object} user - User object
 * @returns {Promise<Object>} Created addon
 */
const createAddon = async (addonData, user) => {
  try {
    // Check if addon with same name already exists
    const existingAddon = await Addon.findOne({ 
      name: addonData.name,
      isActive: true
    });
    
    if (existingAddon) {
      throw new Error('Addon with this name already exists');
    }
    
    // Validate products if provided
    if (addonData.applicableProducts && addonData.applicableProducts.length > 0) {
      for (const productId of addonData.applicableProducts) {
        const productExists = await Product.exists({ 
          _id: productId,
          isActive: true
        });
        
        if (!productExists) {
          throw new Error(`Product with ID ${productId} not found or inactive`);
        }
      }
    }
    
    // Create new addon
    const newAddon = new Addon({
      ...addonData,
      createdBy: user._id,
      updatedBy: user._id
    });
    
    // Save addon
    const savedAddon = await newAddon.save();
    return savedAddon.toObject();
  } catch (error) {
    console.error('Error in createAddon:', error);
    throw error;
  }
};

/**
 * Update an addon
 * @param {string} id - Addon ID
 * @param {Object} updateData - Addon update data
 * @param {Object} user - User object
 * @returns {Promise<Object>} Updated addon
 */
const updateAddon = async (id, updateData, user) => {
  try {
    // Find addon
    const addon = await Addon.findOne({ _id: id, isActive: true });
    
    if (!addon) {
      throw new Error('Addon not found');
    }
    
    // Check if name is changed and not already taken
    if (updateData.name && updateData.name !== addon.name) {
      const existingAddon = await Addon.findOne({ 
        name: updateData.name,
        _id: { $ne: id },
        isActive: true
      });
      
      if (existingAddon) {
        throw new Error('Addon with this name already exists');
      }
    }
    
    // Validate products if provided
    if (updateData.applicableProducts && updateData.applicableProducts.length > 0) {
      for (const productId of updateData.applicableProducts) {
        const productExists = await Product.exists({ 
          _id: productId,
          isActive: true
        });
        
        if (!productExists) {
          throw new Error(`Product with ID ${productId} not found or inactive`);
        }
      }
    }
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        addon[key] = updateData[key];
      }
    });
    
    // Set updatedBy
    addon.updatedBy = user._id;
    
    // Save addon
    const updatedAddon = await addon.save();
    return updatedAddon.toObject();
  } catch (error) {
    console.error(`Error in updateAddon (${id}):`, error);
    throw error;
  }
};

/**
 * Delete an addon (soft delete)
 * @param {string} id - Addon ID
 * @param {Object} user - User object
 * @returns {Promise<Object>} Deleted addon
 */
const deleteAddon = async (id, user) => {
  try {
    // Find addon
    const addon = await Addon.findOne({ _id: id, isActive: true });
    
    if (!addon) {
      throw new Error('Addon not found');
    }
    
    // Soft delete
    addon.isActive = false;
    addon.updatedBy = user._id;
    
    // Save addon
    const deletedAddon = await addon.save();
    return deletedAddon.toObject();
  } catch (error) {
    console.error(`Error in deleteAddon (${id}):`, error);
    throw error;
  }
};

/**
 * Hard delete an addon and its image
 * @param {string} id - Addon ID
 * @returns {Promise<void>}
 */
const hardDeleteAddon = async (id) => {
  try {
    // Find addon
    const addon = await Addon.findById(id);
    
    if (!addon) {
      throw new Error('Addon not found');
    }
    
    // Delete image from S3 if exists
    if (addon.imageUrl) {
      await imageUploadService.deleteFile(addon.imageUrl);
    }
    
    // Delete addon from database
    await Addon.deleteOne({ _id: id });
  } catch (error) {
    console.error(`Error in hardDeleteAddon (${id}):`, error);
    throw error;
  }
};

module.exports = {
  getAllAddons,
  getAddonsByType,
  getAddonsByProduct,
  getAddonById,
  createAddon,
  updateAddon,
  deleteAddon,
  hardDeleteAddon,
  countAddons,
  getPaginatedAddons
};