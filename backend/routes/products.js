const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateInventory,
  seedProducts
} = require('../controllers/productController');

const router = express.Router();

// Get all products
router.get('/', getProducts);

// Seed products (for initial setup)
router.post('/seed', seedProducts);

// Get single product
router.get('/:id', getProduct);

// Create product
router.post('/', createProduct);

// Update inventory
router.patch('/inventory', updateInventory);

module.exports = router;