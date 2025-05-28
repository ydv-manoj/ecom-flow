import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    // console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Product API functions
export const productAPI = {
  // Get all products
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // Get single product
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Seed products (for initial setup)
  seedProducts: async () => {
    const response = await api.post('/products/seed');
    return response.data;
  }
};

// Order API functions
export const orderAPI = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get order by order number
  getOrder: async (orderNumber) => {
    const response = await api.get(`/orders/${orderNumber}`);
    return response.data;
  },

  // Get all orders
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  }
};

// Email API functions
export const emailAPI = {
  // Send order confirmation email
  sendOrderEmail: async (orderNumber) => {
    const response = await api.post('/email/send-order-email', { orderNumber });
    return response.data;
  },

  // Test email connection
  testEmailConnection: async () => {
    const response = await api.get('/email/test-connection');
    return response.data;
  }
};

// Utility functions
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export default api;