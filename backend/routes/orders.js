const express = require('express');
const {
  createOrder,
  getOrder,
  getAllOrders,
  updateEmailStatus
} = require('../controllers/orderController');

const router = express.Router();

// Create new order
router.post('/', createOrder);

// Get all orders (admin/testing)
router.get('/', getAllOrders);

// Get order by order number
router.get('/:orderNumber', getOrder);

// Update email status
router.patch('/:orderNumber/email-status', updateEmailStatus);

module.exports = router;