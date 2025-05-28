const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  options: [{
    label: String,
    value: String,
    inStock: {
      type: Boolean,
      default: true
    },
    image: {
      type: String,
      required: false // Optional image field for variant options
    }
  }]
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  variants: [variantSchema],
  inventory: {
    type: Number,
    required: true,
    min: [0, 'Inventory cannot be negative'],
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add index for better performance
productSchema.index({ name: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);