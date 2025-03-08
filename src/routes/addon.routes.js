const express = require('express');
const { body, param, query } = require('express-validator');
const { verifyToken } = require('../middlewares/auth.middleware');
const addonController = require('../controllers/addon.controller');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all addons with pagination, sorting, and filtering
router.get('/', [
  // Optional query parameter validation
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isString().withMessage('Sort field must be a string'),
  query('sortDirection').optional().isIn(['asc', 'desc']).withMessage('Sort direction must be asc or desc'),
  query('search').optional().isString().withMessage('Search query must be a string'),
  query('addonType').optional().isIn(['topping', 'sauce', 'extra', 'option']).withMessage('Invalid addon type'),
  query('selectionType').optional().isIn(['single', 'multiple']).withMessage('Invalid selection type'),
  query('productId').optional().isMongoId().withMessage('Invalid product ID format')
], addonController.getAllAddons);

// GET addons by type
router.get(
  '/type/:type',
  [
    param('type').isIn(['topping', 'sauce', 'extra', 'option']).withMessage('Invalid addon type')
  ],
  addonController.getAddonsByType
);

// GET addons by product
router.get(
  '/product/:productId',
  [
    param('productId').isMongoId().withMessage('Invalid product ID format')
  ],
  addonController.getAddonsByProduct
);

// GET addon by ID
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid addon ID format')
  ],
  addonController.getAddonById
);

// POST create new addon
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Addon name is required')
      .isLength({ min: 3 }).withMessage('Addon name must be at least 3 characters')
      .isLength({ max: 50 }).withMessage('Addon name cannot exceed 50 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
    body('price')
      .notEmpty().withMessage('Price is required')
      .isNumeric().withMessage('Price must be a number')
      .isFloat({ min: 0 }).withMessage('Price cannot be negative'),
    body('selectionType')
      .notEmpty().withMessage('Selection type is required')
      .isIn(['single', 'multiple']).withMessage('Selection type must be either single or multiple'),
    body('addonType')
      .notEmpty().withMessage('Addon type is required')
      .isIn(['topping', 'sauce', 'extra', 'option']).withMessage('Invalid addon type'),
    body('imageUrl')
      .optional()
      .isURL().withMessage('Image URL must be a valid URL'),
    body('applicableProducts')
      .optional()
      .isArray().withMessage('Applicable products must be an array'),
    body('applicableProducts.*')
      .optional()
      .isMongoId().withMessage('Each product ID must be a valid MongoDB ID')
  ],
  addonController.createAddon
);

// PUT update addon
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid addon ID format'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3 }).withMessage('Addon name must be at least 3 characters')
      .isLength({ max: 50 }).withMessage('Addon name cannot exceed 50 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
    body('price')
      .optional()
      .isNumeric().withMessage('Price must be a number')
      .isFloat({ min: 0 }).withMessage('Price cannot be negative'),
    body('selectionType')
      .optional()
      .isIn(['single', 'multiple']).withMessage('Selection type must be either single or multiple'),
    body('addonType')
      .optional()
      .isIn(['topping', 'sauce', 'extra', 'option']).withMessage('Invalid addon type'),
    body('imageUrl')
      .optional()
      .isURL().withMessage('Image URL must be a valid URL'),
    body('applicableProducts')
      .optional()
      .isArray().withMessage('Applicable products must be an array'),
    body('applicableProducts.*')
      .optional()
      .isMongoId().withMessage('Each product ID must be a valid MongoDB ID')
  ],
  addonController.updateAddon
);

// DELETE addon
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid addon ID format')
  ],
  addonController.deleteAddon
);

module.exports = router;