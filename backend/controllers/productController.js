const Product = require('../models/Product');

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get single product by ID
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Create a new product (for seeding/admin purposes)
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update product inventory
const updateInventory = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.inventory < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient inventory'
      });
    }

    product.inventory -= quantity;
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory',
      error: error.message
    });
  }
};

// Seed products (for initial setup)
const seedProducts = async (req, res) => {
  try {
    // Check if products already exist
    const existingProducts = await Product.find();
    if (existingProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Products already exist'
      });
    }

    const sampleProducts = [
      {
        name: "Converse Chuck Taylor All Star II Hi",
        description: "The iconic Chuck Taylor All Star returns with premium materials and enhanced comfort. Features a lugged outsole, padded non-slip tongue, and micro-suede lining for all-day comfort.",
        price: 75.00,
        image: "https://www.converse.in/media/catalog/product/1/6/162050c_a_107x1.jpg?auto=webp&format=pjpg&width=640&height=800&fit=cover",
        variants: [
          {
            name: "color",
            value: "Color",
            options: [
              { 
                label: "Black", 
                value: "black", 
                inStock: true,
                image: "https://www.converse.in/media/catalog/product/1/6/162050c_a_107x1.jpg?auto=webp&format=pjpg&width=640&height=800&fit=cover"
              },
              { 
                label: "White", 
                value: "white", 
                inStock: true,
                image: "https://www.converse.in/media/catalog/product/1/3/132169c_a_08x1.jpg?auto=webp&format=pjpg&width=640&height=800&fit=cover"
              },
              { 
                label: "Red", 
                value: "red", 
                inStock: true,
                image: "https://www.converse.in/media/catalog/product/m/9/m9621c_01.jpg?auto=webp&format=pjpg&width=640&height=800&fit=cover"
              },
              { 
                label: "Navy", 
                value: "navy", 
                inStock: false,
                image: "https://www.converse.in/media/catalog/product/a/0/a07434c_a_107x1.jpg?auto=webp&format=pjpg&width=640&height=800&fit=cover"
              }
            ]
          },
          {
            name: "size",
            value: "Size",
            options: [
              { label: "7", value: "7", inStock: true },
              { label: "8", value: "8", inStock: true },
              { label: "9", value: "9", inStock: true },
              { label: "10", value: "10", inStock: true },
              { label: "11", value: "11", inStock: false }
            ]
          }
        ],
        inventory: 50
      }
    ];

    const products = await Product.insertMany(sampleProducts);
    
    res.status(201).json({
      success: true,
      message: 'Products seeded successfully',
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to seed products',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateInventory,
  seedProducts
};