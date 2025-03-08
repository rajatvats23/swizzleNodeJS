const express = require('express');
const { body, param, query } = require('express-validator');
const { verifyToken } = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all products with pagination, sorting, and filtering
router.get('/', [
  // Optional query parameter validation
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isString().withMessage('Sort field must be a string'),
  query('sortDirection').optional().isIn(['asc', 'desc']).withMessage('Sort direction must be asc or desc'),
  query('search').optional().isString().withMessage('Search query must be a string'),
  query('categoryId').optional().isMongoId().withMessage('Invalid category ID format'),
  query('vegetarian').optional().isBoolean().withMessage('Vegetarian filter must be a boolean'),
  query('vegan').optional().isBoolean().withMessage('Vegan filter must be a boolean'),
  query('glutenFree').optional().isBoolean().withMessage('Gluten-free filter must be a boolean')
], productController.getAllProducts);

// GET products by category ID
router.get(
  '/category/:categoryId',
  [
    param('categoryId').isMongoId().withMessage('Invalid category ID format')
  ],
  productController.getProductsByCategory
);

// GET product by ID
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid product ID format')
  ],
  productController.getProductById
);

// POST create new product
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Product name is required')
      .isLength({ min: 3 }).withMessage('Product name must be at least 3 characters')
      .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('categoryId')
      .notEmpty().withMessage('Category ID is required')
      .isMongoId().withMessage('Invalid category ID format'),
    body('basePrice')
      .isNumeric().withMessage('Base price must be a number')
      .isFloat({ min: 0 }).withMessage('Base price cannot be negative'),
    body('imageUrl')
      .notEmpty().withMessage('Image URL is required')
      .isURL().withMessage('Image URL must be a valid URL'),
    body('preparationTime')
      .optional()
      .isInt({ min: 0 }).withMessage('Preparation time must be a non-negative integer'),
    body('ingredients')
      .optional()
      .isArray().withMessage('Ingredients must be an array'),
    body('ingredients.*')
      .optional()
      .isString().withMessage('Each ingredient must be a string'),
    body('isVegetarian')
      .optional()
      .isBoolean().withMessage('isVegetarian must be a boolean'),
    body('isVegan')
      .optional()
      .isBoolean().withMessage('isVegan must be a boolean'),
    body('isGlutenFree')
      .optional()
      .isBoolean().withMessage('isGlutenFree must be a boolean'),
    body('variants')
      .optional()
      .isArray().withMessage('Variants must be an array'),
    body('variants.*.name')
      .optional()
      .isString().withMessage('Variant name must be a string')
      .notEmpty().withMessage('Variant name cannot be empty'),
    body('variants.*.price')
      .optional()
      .isNumeric().withMessage('Variant price must be a number')
      .isFloat({ min: 0 }).withMessage('Variant price cannot be negative'),
    body('variants.*.isDefault')
      .optional()
      .isBoolean().withMessage('isDefault must be a boolean'),
    body('nutritionalInfo')
      .optional()
      .isObject().withMessage('Nutritional info must be an object'),
    body('nutritionalInfo.calories')
      .optional()
      .isNumeric().withMessage('Calories must be a number')
      .isFloat({ min: 0 }).withMessage('Calories cannot be negative'),
    body('nutritionalInfo.protein')
      .optional()
      .isNumeric().withMessage('Protein must be a number')
      .isFloat({ min: 0 }).withMessage('Protein cannot be negative'),
    body('nutritionalInfo.carbs')
      .optional()
      .isNumeric().withMessage('Carbs must be a number')
      .isFloat({ min: 0 }).withMessage('Carbs cannot be negative'),
    body('nutritionalInfo.fat')
      .optional()
      .isNumeric().withMessage('Fat must be a number')
      .isFloat({ min: 0 }).withMessage('Fat cannot be negative'),
    body('nutritionalInfo.fiber')
      .optional()
      .isNumeric().withMessage('Fiber must be a number')
      .isFloat({ min: 0 }).withMessage('Fiber cannot be negative')
  ],
  productController.createProduct
);

// PUT update product
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid product ID format'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3 }).withMessage('Product name must be at least 3 characters')
      .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('categoryId')
      .optional()
      .isMongoId().withMessage('Invalid category ID format'),
    body('basePrice')
      .optional()
      .isNumeric().withMessage('Base price must be a number')
      .isFloat({ min: 0 }).withMessage('Base price cannot be negative'),
    body('imageUrl')
      .optional()
      .isURL().withMessage('Image URL must be a valid URL'),
    body('thumbnailUrl')
      .optional()
      .isURL().withMessage('Thumbnail URL must be a valid URL'),
    body('preparationTime')
      .optional()
      .isInt({ min: 0 }).withMessage('Preparation time must be a non-negative integer'),
    body('ingredients')
      .optional()
      .isArray().withMessage('Ingredients must be an array'),
    body('ingredients.*')
      .optional()
      .isString().withMessage('Each ingredient must be a string'),
    body('isVegetarian')
      .optional()
      .isBoolean().withMessage('isVegetarian must be a boolean'),
    body('isVegan')
      .optional()
      .isBoolean().withMessage('isVegan must be a boolean'),
    body('isGlutenFree')
      .optional()
      .isBoolean().withMessage('isGlutenFree must be a boolean'),
    body('variants')
      .optional()
      .isArray().withMessage('Variants must be an array'),
    body('variants.*.name')
      .optional()
      .isString().withMessage('Variant name must be a string')
      .notEmpty().withMessage('Variant name cannot be empty'),
    body('variants.*.price')
      .optional()
      .isNumeric().withMessage('Variant price must be a number')
      .isFloat({ min: 0 }).withMessage('Variant price cannot be negative'),
    body('variants.*.isDefault')
      .optional()
      .isBoolean().withMessage('isDefault must be a boolean'),
    body('nutritionalInfo')
      .optional()
      .isObject().withMessage('Nutritional info must be an object'),
    body('nutritionalInfo.calories')
      .optional()
      .isNumeric().withMessage('Calories must be a number')
      .isFloat({ min: 0 }).withMessage('Calories cannot be negative'),
    body('nutritionalInfo.protein')
      .optional()
      .isNumeric().withMessage('Protein must be a number')
      .isFloat({ min: 0 }).withMessage('Protein cannot be negative'),
    body('nutritionalInfo.carbs')
      .optional()
      .isNumeric().withMessage('Carbs must be a number')
      .isFloat({ min: 0 }).withMessage('Carbs cannot be negative'),
    body('nutritionalInfo.fat')
      .optional()
      .isNumeric().withMessage('Fat must be a number')
      .isFloat({ min: 0 }).withMessage('Fat cannot be negative'),
    body('nutritionalInfo.fiber')
      .optional()
      .isNumeric().withMessage('Fiber must be a number')
      .isFloat({ min: 0 }).withMessage('Fiber cannot be negative')
  ],
  productController.updateProduct
);

// DELETE product
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid product ID format')
  ],
  productController.deleteProduct
);

module.exports = router;