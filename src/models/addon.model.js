const mongoose = require('mongoose');

const addonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Addon name is required'],
      trim: true,
      unique: true,
      minlength: [3, 'Addon name must be at least 3 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    selectionType: {
      type: String,
      enum: ['single', 'multiple'],
      required: [true, 'Selection type is required']
    },
    addonType: {
      type: String,
      enum: ['topping', 'sauce', 'extra', 'option'],
      required: true
    },
    imageUrl: {
      type: String,
      required: false
    },
    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    isActive: {
      type: Boolean,
      default: true
    },
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
addonSchema.index({ name: 'text', description: 'text' });

// Add compound index on addonType and isActive for better querying
addonSchema.index({ addonType: 1, isActive: 1 });

const Addon = mongoose.model('Addon', addonSchema);

module.exports = Addon;