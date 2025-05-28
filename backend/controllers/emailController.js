const nodemailer = require('nodemailer');
const Order = require('../models/Order');

// Create Mailtrap transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
    port: process.env.MAILTRAP_PORT || 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    }
  });
};

// Generate email templates
const generateEmailTemplate = (order, type) => {
  const { orderNumber, customerInfo, items, total, status, transactionId } = order;
  const customerName = customerInfo.fullName;
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.productName}
        ${item.selectedVariants?.length ? 
          ` (${item.selectedVariants.map(v => `${v.name}: ${v.value}`).join(', ')})` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${item.price.toFixed(2)}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${item.subtotal.toFixed(2)}
      </td>
    </tr>
  `).join('');

  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background-color: #fff; padding: 30px; border: 1px solid #ddd; }
      .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
      .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      .order-table th { background-color: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; }
      .order-table td { padding: 10px; border-bottom: 1px solid #eee; }
      .total-row { font-weight: bold; background-color: #f8f9fa; }
      .success { color: #28a745; }
      .error { color: #dc3545; }
      .warning { color: #ffc107; }
    </style>
  `;

  if (type === 'approved') {
    return {
      subject: `✅ Order Confirmation - ${orderNumber}`,
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1 class="success">✅ Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${customerName},</p>
            <p>Thank you for your order! We're excited to confirm that your payment has been processed successfully.</p>
            
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Status:</strong> <span class="success">Approved</span></p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            
            <table class="order-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; padding: 15px;">Total:</td>
                  <td style="text-align: right; padding: 15px;">$${total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <h3>Shipping Information</h3>
            <p>
              ${customerInfo.address}<br>
              ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}
            </p>
            
            <p>We'll send you another email with tracking information once your order ships.</p>
            <p>If you have any questions, please don't hesitate to contact our customer service team.</p>
          </div>
          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p><small>This is an automated email. Please do not reply to this message.</small></p>
          </div>
        </div>
      `
    };
  } else if (type === 'declined') {
    return {
      subject: `❌ Payment Declined - ${orderNumber}`,
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1 class="error">❌ Payment Declined</h1>
          </div>
          <div class="content">
            <p>Dear ${customerName},</p>
            <p>We're sorry to inform you that your payment for order ${orderNumber} has been declined by your card issuer.</p>
            
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Status:</strong> <span class="error">Declined</span></p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total:</strong> $${total.toFixed(2)}</p>
            
            <h3>What's Next?</h3>
            <p>Here are some steps you can take:</p>
            <ul>
              <li>Check that your card details are correct</li>
              <li>Ensure you have sufficient funds available</li>
              <li>Contact your bank to authorize the transaction</li>
              <li>Try using a different payment method</li>
            </ul>
            
            <p>You can retry your order anytime by visiting our website. Your items will remain available subject to inventory.</p>
            <p>If you continue to experience issues, please contact our customer service team for assistance.</p>
          </div>
          <div class="footer">
            <p>We're here to help!</p>
            <p><small>This is an automated email. Please do not reply to this message.</small></p>
          </div>
        </div>
      `
    };
  } else { // failed
    return {
      subject: `⚠️ Payment Processing Error - ${orderNumber}`,
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1 class="warning">⚠️ Payment Processing Error</h1>
          </div>
          <div class="content">
            <p>Dear ${customerName},</p>
            <p>We encountered a technical error while processing your payment for order ${orderNumber}. This issue is temporary and not related to your payment method.</p>
            
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Status:</strong> <span class="warning">Processing Failed</span></p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total:</strong> $${total.toFixed(2)}</p>
            
            <h3>What's Next?</h3>
            <p>Please try placing your order again in a few minutes. If the problem persists:</p>
            <ul>
              <li>Wait 15-30 minutes and try again</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try using a different browser or device</li>
              <li>Contact our customer service team</li>
            </ul>
            
            <p>We apologize for any inconvenience this may have caused. Our technical team has been notified and is working to resolve the issue.</p>
          </div>
          <div class="footer">
            <p>Thank you for your patience!</p>
            <p><small>This is an automated email. Please do not reply to this message.</small></p>
          </div>
        </div>
      `
    };
  }
};

// Send order confirmation email
const sendOrderEmail = async (req, res) => {
  try {
    const { orderNumber } = req.body;
    
    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order number is required'
      });
    }

    // Get order details
    const order = await Order.findOne({ orderNumber })
      .populate('items.productId', 'name image');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if Mailtrap credentials are provided
    if (!process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASS) {
      console.log('Mailtrap credentials not found. Email simulation only.');
      return res.status(200).json({
        success: true,
        message: 'Email simulation completed (no SMTP credentials)',
        data: {
          orderNumber,
          emailType: order.status,
          simulatedOnly: true
        }
      });
    }

    const transporter = createTransporter();
    
    // Generate email template based on order status
    const emailType = order.status === 'approved' ? 'approved' : 
                     order.status === 'declined' ? 'declined' : 'failed';
    
    const emailTemplate = generateEmailTemplate(order, emailType);
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@ecommerce.com',
      to: order.customerInfo.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    await transporter.sendMail(mailOptions);
    
    // Update order email status
    await Order.findOneAndUpdate(
      { orderNumber },
      { emailSent: true }
    );

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: {
        orderNumber,
        emailType,
        recipient: order.customerInfo.email
      }
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
};

// Test email connection
const testEmailConnection = async (req, res) => {
  try {
    if (!process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASS) {
      return res.status(400).json({
        success: false,
        message: 'Mailtrap credentials not configured'
      });
    }

    const transporter = createTransporter();
    await transporter.verify();
    
    res.status(200).json({
      success: true,
      message: 'Email connection successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email connection failed',
      error: error.message
    });
  }
};

module.exports = {
  sendOrderEmail,
  testEmailConnection
};