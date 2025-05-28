const Order = require('../models/Order');
const Product = require('../models/Product');
const { v4: uuidv4 } = require('uuid');

// Simulate payment processing based on CVV
const simulatePayment = (cvv) => {
  const cvvNum = parseInt(cvv);
  
  if (cvvNum === 111) {
    return { status: 'approved', transactionId: `TXN-${uuidv4().slice(0, 8)}` };
  } else if (cvvNum === 222) {
    return { status: 'declined', transactionId: null, error: 'Card declined by issuer' };
  } else if (cvvNum === 333) {
    return { status: 'failed', transactionId: null, error: 'Gateway timeout error' };
  } else {
    // Default to approved for any other CVV
    return { status: 'approved', transactionId: `TXN-${uuidv4().slice(0, 8)}` };
  }
};

// Validate card number is exactly 16 digits
const validateCardNumber = (cardNumber) => {
  const cleanCardNumber = cardNumber.replace(/\s/g, '');
  return /^\d{16}$/.test(cleanCardNumber);
};

// Validate expiry date is in the future and month is valid
const validateExpiryDate = (expiryDate) => {
  // Check format MM/YY
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    return { valid: false, message: 'Expiry date must be in MM/YY format' };
  }

  const [month, year] = expiryDate.split('/');
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  // Validate month is between 1-12
  if (monthNum < 1 || monthNum > 12) {
    return { valid: false, message: 'Month must be between 01 and 12' };
  }

  // Validate year is in the future
  const expiry = new Date(parseInt(`20${year}`), monthNum - 1);
  const now = new Date();
  
  if (expiry <= now) {
    return { valid: false, message: 'Expiry date must be in the future' };
  }

  return { valid: true };
};

// Create new order
const createOrder = async (req, res) => {
  try {
    const { items, customerInfo, paymentInfo } = req.body;

    // Validate card number
    if (!validateCardNumber(paymentInfo.cardNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Card number must be exactly 16 digits'
      });
    }

    // Validate expiry date
    const expiryValidation = validateExpiryDate(paymentInfo.expiryDate);
    if (!expiryValidation.valid) {
      return res.status(400).json({
        success: false,
        message: expiryValidation.message
      });
    }

    // Calculate subtotal and validate items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productName} not found`
        });
      }

      // Check inventory
      if (product.inventory < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${product.name}`
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants || [],
        image: item.image || product.image, // Use variant image if provided, fallback to product image
        subtotal: itemSubtotal
      });
    }

    // Calculate shipping and tax
    const shipping = subtotal >= 50 ? 0 : 9.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    // Simulate payment processing
    const paymentResult = simulatePayment(paymentInfo.cvv);

    // Create order
    const order = new Order({
      items: orderItems,
      customerInfo,
      orderNumber: uuidv4(), // Will be generated in pre-save hook
      paymentInfo: {
        cardNumber: paymentInfo.cardNumber.replace(/\d(?=\d{4})/g, '*'), // Mask card number
        expiryDate: paymentInfo.expiryDate,
        cvv: paymentInfo.cvv // Keep CVV for simulation purposes 
      },
      total: total, // Now includes shipping and tax
      status: paymentResult.status,
      transactionId: paymentResult.transactionId,
      notes: paymentResult.error || null
    });

    await order.save();

    // Update inventory only if payment was approved
    if (paymentResult.status === 'approved') {
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { inventory: -item.quantity } }
        );
      }
    }

    res.status(201).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        transactionId: order.transactionId,
        total: order.total,
        error: paymentResult.error || null
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get order by order number
const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.productId', 'name image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Get all orders (admin/testing purposes)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.productId', 'name image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Update order email status
const updateEmailStatus = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await Order.findOneAndUpdate(
      { orderNumber },
      { emailSent: true },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update email status',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrder,
  getAllOrders,
  updateEmailStatus
};