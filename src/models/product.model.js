// src/models/product.model.js
const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    longDescription: {
      type: String,
      trim: true
    },
    images: [{
      type: String,
      required: [true, 'At least one image is required']
    }],
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    costPrice: {
      type: Number,
      min: [0, 'Cost price cannot be negative']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    variants: [variantSchema],
    addOns: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Addon'
    }],
    minQuantity: {
      type: Number,
      default: 1,
      min: 1
    },
    maxQuantity: {
      type: Number,
      default: 0
    },
    preparationTime: {
      type: Number,
      min: 0
    },
    sku: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    hasSpecialPrice: {
      type: Boolean,
      default: false
    },
    specialPrice: {
      type: Number,
      min: 0
    },
    specialQuantity: {
      type: Number,
      min: 1
    },
    isBundle: {
      type: Boolean,
      default: false
    },
    availableQuantity: {
      type: Number,
      default: 0
    },
    searchTags: [{
      type: String,
      trim: true
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Add text indexes for search functionality
productSchema.index({ name: 'text', description: 'text', searchTags: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;