const express = require('express');
const {
  sendOrderEmail,
  testEmailConnection
} = require('../controllers/emailController');

const router = express.Router();

// Send order confirmation email
router.post('/send-order-email', sendOrderEmail);

// Test email connection
router.get('/test-connection', testEmailConnection);

module.exports = router;