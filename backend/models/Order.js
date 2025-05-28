const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedVariants: [{
    name: String,
    value: String
  }],
  image: {
    type: String,
    required: true // Store the variant-specific image URL
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const customerInfoSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  zipCode: {
    type: String,
    required: [true, 'Zip code is required'],
    match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid zip code']
  }
});

const paymentInfoSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: [true, 'Card number is required'],
  },
  expiryDate: {
    type: String,
    required: [true, 'Expiry date is required'],
    match: [/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format']
  },
  cvv: {
    type: String,
    required: [true, 'CVV is required'],
    match: [/^\d{3}$/, 'CVV must be 3 digits']
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [orderItemSchema],
  customerInfo: customerInfoSchema,
  paymentInfo: paymentInfoSchema,
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'failed'],
    default: 'pending'
  },
  transactionId: {
    type: String
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp.slice(-6)}${random}`;
  }
  next();
});

// Add indexes for better performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);