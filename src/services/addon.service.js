const Addon = require('../models/addon.model');
const Product = require('../models/product.model');

/**
 * Get all active add-ons
 * @returns {Promise<Array>} List of add-ons
 */
const getAllAddons = async () => {
  try {
    return await Addon.find({ isActive: true })
      .sort({ name: 1 })
      .lean();
  } catch (error) {
    console.error('Error in getAllAddons:', error);
    throw new Error('Failed to fetch add-ons');
  }
};

/**
 * Get add-on by ID
 * @param {string} id - Add-on ID
 * @returns {Promise<Object>} Add-on object
 */
const getAddonById = async (id) => {
  try {
    const addon = await Addon.findOne({ _id: id, isActive: true }).lean();
    
    if (!addon) {
      throw new Error('Add-on not found');
    }
    
    return addon;
  } catch (error) {
    console.error(`Error in getAddonById (${id}):`, error);
    throw error;
  }
};

/**
 * Create a new add-on
 * @param {Object} addonData - Add-on data
 * @param {Object} user - User object
 * @returns {Promise<Object>} Created add-on
 */
const createAddon = async (addonData, user) => {
  try {
    // Check if add-on with same name already exists
    const existingAddon = await Addon.findOne({ 
      name: addonData.name,
      isActive: true
    });
    
    if (existingAddon) {
      throw new Error('Add-on with this name already exists');
    }
    
    // Create new add-on
    const newAddon = new Addon({
      ...addonData,
      createdBy: user._id,
      updatedBy: user._id
    });
    
    // Save add-on
    const savedAddon = await newAddon.save();
    return savedAddon.toObject();
  } catch (error) {
    console.error('Error in createAddon:', error);
    throw error;
  }
};

/**
 * Update an add-on
 * @param {string} id - Add-on ID
 * @param {Object} updateData - Add-on update data
 * @param {Object} user - User object
 * @returns {Promise<Object>} Updated add-on
 */
const updateAddon = async (id, updateData, user) => {
  try {
    // Find add-on
    const addon = await Addon.findOne({ _id: id, isActive: true });
    
    if (!addon) {
      throw new Error('Add-on not found');
    }
    
    // Check if name is changed and not already taken
    if (updateData.name && updateData.name !== addon.name) {
      const existingAddon = await Addon.findOne({ 
        name: updateData.name,
        _id: { $ne: id },
        isActive: true
      });
      
      if (existingAddon) {
        throw new Error('Add-on with this name already exists');
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
    
    // Save add-on
    const updatedAddon = await addon.save();
    return updatedAddon.toObject();
  } catch (error) {
    console.error(`Error in updateAddon (${id}):`, error);
    throw error;
  }
};

/**
 * Delete an add-on (soft delete)
 * @param {string} id - Add-on ID
 * @param {Object} user - User object
 * @returns {Promise<Object>} Deleted add-on
 */
const deleteAddon = async (id, user) => {
  try {
    // Find add-on
    const addon = await Addon.findOne({ _id: id, isActive: true });
    
    if (!addon) {
      throw new Error('Add-on not found');
    }
    
    // Check if add-on is used in any products
    const productsUsingAddon = await Product.find({
      'addOnGroups.addOns': id,
      isActive: true
    });
    
    if (productsUsingAddon.length > 0) {
      throw new Error('Add-on is in use and cannot be deleted');
    }
    
    // Soft delete
    addon.isActive = false;
    addon.updatedBy = user._id;
    
    // Save add-on
    const deletedAddon = await addon.save();
    return deletedAddon.toObject();
  } catch (error) {
    console.error(`Error in deleteAddon (${id}):`, error);
    throw error;
  }
};

/**
 * Hard delete an add-on
 * @param {string} id - Add-on ID
 * @returns {Promise<void>}
 */
const hardDeleteAddon = async (id) => {
  try {
    // Find add-on
    const addon = await Addon.findById(id);
    
    if (!addon) {
      throw new Error('Add-on not found');
    }
    
    // Delete add-on from database
    await Addon.deleteOne({ _id: id });
  } catch (error) {
    console.error(`Error in hardDeleteAddon (${id}):`, error);
    throw error;
  }
};

module.exports = {
  getAllAddons,
  getAddonById,
  createAddon,
  updateAddon,
  deleteAddon,
  hardDeleteAddon
};