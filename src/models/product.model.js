const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Variant name is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Variant price is required'],
      min: [0, 'Price cannot be negative']
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const nutritionalInfoSchema = new mongoose.Schema(
  {
    calories: {
      type: Number,
      required: false
    },
    protein: {
      type: Number,
      required: false
    },
    carbs: {
      type: Number,
      required: false
    },
    fat: {
      type: Number,
      required: false
    },
    fiber: {
      type: Number,
      required: false
    }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      unique: true,
      minlength: [3, 'Product name must be at least 3 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative']
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required']
    },
    thumbnailUrl: {
      type: String,
      required: false
    },
    preparationTime: {
      type: Number,
      required: false,
      min: [0, 'Preparation time cannot be negative']
    },
    ingredients: {
      type: [String],
      default: []
    },
    nutritionalInfo: {
      type: nutritionalInfoSchema,
      required: false
    },
    variants: {
      type: [variantSchema],
      validate: {
        validator: function(variants) {
          // Ensure at most one variant is marked as default
          const defaultVariants = variants.filter(v => v.isDefault);
          return defaultVariants.length <= 1;
        },
        message: 'Only one variant can be marked as default'
      },
      default: []
    },
    isVegetarian: {
      type: Boolean,
      default: false
    },
    isVegan: {
      type: Boolean,
      default: false
    },
    isGlutenFree: {
      type: Boolean,
      default: false
    },
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
productSchema.index({ 
  name: 'text', 
  description: 'text',
  ingredients: 'text'
});

// Add compound index on categoryId and isActive for better querying
productSchema.index({ categoryId: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;