// src/routes/product.routes.js
const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all products
router.get('/', productController.getAllProducts);

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
      .isLength({ min: 2 }).withMessage('Product name must be at least 2 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required'),
    body('price')
      .isNumeric().withMessage('Price must be a number')
      .custom(value => value >= 0).withMessage('Price cannot be negative'),
    body('images')
      .isArray().withMessage('Images must be an array')
      .notEmpty().withMessage('At least one image is required'),
    body('images.*')
      .isURL().withMessage('Image URL must be a valid URL'),
    body('category')
      .optional()
      .isMongoId().withMessage('Invalid category ID format'),
    body('variants')
      .optional()
      .isArray().withMessage('Variants must be an array'),
    body('variants.*.name')
      .optional()
      .notEmpty().withMessage('Variant name is required'),
    body('variants.*.price')
      .optional()
      .isNumeric().withMessage('Variant price must be a number')
      .custom(value => value >= 0).withMessage('Variant price cannot be negative')
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
      .isLength({ min: 2 }).withMessage('Product name must be at least 2 characters'),
    body('price')
      .optional()
      .isNumeric().withMessage('Price must be a number')
      .custom(value => value >= 0).withMessage('Price cannot be negative'),
    body('category')
      .optional()
      .isMongoId().withMessage('Invalid category ID format'),
    body('variants')
      .optional()
      .isArray().withMessage('Variants must be an array')
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