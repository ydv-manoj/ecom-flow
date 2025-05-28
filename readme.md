# 🛒 eCommerce Checkout Flow Simulation

A complete 3-page eCommerce application built with **Next.js App Router**, **Express.js**, and **MongoDB**, featuring dynamic payment simulation and email notifications.

## 🌟 Features

- **Landing Page**: Product display with variant selection and quantity controls
- **Checkout Page**: Complete form validation and payment simulation
- **Thank You Page**: Order confirmation with full transaction details
- **Payment Simulation**: Different CVV codes trigger different payment outcomes
- **Email Notifications**: Automated confirmation emails via Mailtrap
- **Database Storage**: All order and customer data stored in MongoDB
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🏗️ Project Structure

```
ecommerce-project/
├── backend/                    # Express backend
│   ├── server.js              # Main server file
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── Product.js         # Product schema
│   │   └── Order.js           # Order schema
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── emailController.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── email.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── package.json
│   └── .env.example
│
├── frontend/                  # Next.js frontend (App Router)
│   ├── app/
│   │   ├── layout.js         # Root layout
│   │   ├── page.js           # Landing page
│   │   ├── globals.css       # Global styles
│   │   ├── checkout/
│   │   │   └── page.js       # Checkout page
│   │   └── thank-you/
│   │       └── page.js       # Thank you page
│   ├── utils/
│   │   └── api.js            # API utilities
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
│
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### 1. Clone the Repository

```bash
git clone 
cd ecommerce-project
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Mailtrap Email Configuration
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password

# Email Settings
FROM_EMAIL=noreply@ecommerce.com
```

Start the backend server:

```bash
npm run dev
```

Backend will be running on `http://localhost:5001`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

Start the frontend development server:

```bash
npm run dev
```

Frontend will be running on `http://localhost:3000`

### 4. Database Seeding

The application will automatically seed a sample product when you first visit the landing page. You can also manually seed products by making a POST request to:

```
POST http://localhost:5000/api/products/seed
```

## 🎮 Payment Simulation

Use these CVV codes during checkout to simulate different payment outcomes:

- **111** → ✅ **Approved Transaction**
- **222** → ❌ **Declined Transaction**  
- **333** → ⚠️ **Gateway Error/Failure**
- **Any other 3 digits** → ✅ **Approved**

### Example Test Data

**Card Number**: `1234 5678 9012 3456`  
**Expiry Date**: `12/26` (any future date)  
**CVV**: Use codes above for different outcomes

## 📧 Email Configuration

### Mailtrap Setup

1. Sign up for a free account at [mailtrap.io](https://mailtrap.io)
2. Create a new inbox in sandbox mode
3. Copy your SMTP credentials
4. Update the `.env` file with your credentials

### Email Templates

The application sends different email templates based on payment outcomes:

- **Approved**: Confirmation email with order details
- **Declined**: Payment declined notification with retry instructions
- **Failed**: Technical error notification

## 🛠️ API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products/seed` - Seed sample products

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:orderNumber` - Get order by number
- `GET /api/orders` - Get all orders (admin)

### Email
- `POST /api/email/send-order-email` - Send confirmation email
- `GET /api/email/test-connection` - Test email connection

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Form Validation**: Real-time validation with react-hook-form
- **Loading States**: Smooth loading indicators and transitions
- **Toast Notifications**: User-friendly success/error messages
- **Card Formatting**: Automatic credit card number formatting
- **Inventory Management**: Real-time stock checking
- **Variant Selection**: Dynamic product variant options

## 🔒 Security Features

- **Input Validation**: Server-side validation for all inputs
- **Card Masking**: Credit card numbers are masked in storage
- **CVV Protection**: CVV codes are never stored
- **Error Handling**: Comprehensive error handling and logging
- **CORS Protection**: Configured CORS policies

## 📱 Page Flow

1. **Landing Page** (`/`)
   - Browse product with variants (color, size)
   - Select quantity and options
   - Add to cart and proceed to checkout

2. **Checkout Page** (`/checkout`)
   - Enter customer information
   - Provide shipping address
   - Enter payment details with simulation
   - Submit order with real-time validation

3. **Thank You Page** (`/thank-you`)
   - View order confirmation
   - See payment status (approved/declined/failed)
   - Download/print order details
   - Access customer support

## 🧪 Testing the Flow

1. **Start both servers** (backend on :5000, frontend on :3000)
2. **Visit landing page**: Select product variants and quantity
3. **Proceed to checkout**: Fill out the form with test data
4. **Use simulation CVV**: Try different CVV codes for different outcomes
5. **View confirmation**: Check the thank you page and email notifications

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. Push code to GitHub
2. Connect to Railway or Render
3. Set environment variables
4. Deploy with auto-scaling

### Frontend Deployment (Vercel/Netlify)

1. Connect GitHub repository
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy with automatic CI/CD

### Environment Variables for Production

**Backend:**
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_pass
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string format
   - Verify network connectivity

2. **API Connection Issues**
   - Verify backend is running on correct port
   - Check CORS configuration
   - Ensure frontend API URL is correct

3. **Email Not Sending**
   - Verify Mailtrap credentials
   - Check spam folder
   - Review server logs for errors

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Review environment variable configuration

## 📝 Development Notes

- **App Router**: Uses Next.js 13+ App Router for modern routing
- **Server Components**: Optimized for performance where possible
- **Error Boundaries**: Comprehensive error handling throughout
- **TypeScript Ready**: Easy migration to TypeScript if needed
- **Scalable Architecture**: Modular design for easy expansion

