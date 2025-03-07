const express = require('express');
const { body, param, query } = require('express-validator');
const { verifyToken } = require('../middlewares/auth.middleware');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all categories with pagination, sorting, and search
router.get('/', [
  // Optional query parameter validation
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isString().withMessage('Sort field must be a string'),
  query('sortDirection').optional().isIn(['asc', 'desc']).withMessage('Sort direction must be asc or desc'),
  query('search').optional().isString().withMessage('Search query must be a string')
], categoryController.getAllCategories);

// GET category by ID
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid category ID format')
  ],
  categoryController.getCategoryById
);

// POST create new category
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Category name is required')
      .isLength({ min: 3 }).withMessage('Category name must be at least 3 characters')
      .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('imageUrl')
      .notEmpty().withMessage('Image URL is required')
      .isURL().withMessage('Image URL must be a valid URL')
  ],
  categoryController.createCategory
);

// PUT update category
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid category ID format'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3 }).withMessage('Category name must be at least 3 characters')
      .isLength({ max: 100 }).withMessage('Category name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('imageUrl')
      .optional()
      .isURL().withMessage('Image URL must be a valid URL'),
    body('thumbnailUrl')
      .optional()
      .isURL().withMessage('Thumbnail URL must be a valid URL')
  ],
  categoryController.updateCategory
);

// DELETE category
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid category ID format')
  ],
  categoryController.deleteCategory
);

module.exports = router;