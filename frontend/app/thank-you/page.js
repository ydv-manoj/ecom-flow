'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Package, 
  Truck, 
  Mail, 
  Phone, 
  MapPin,
  ArrowLeft,
  Download
} from 'lucide-react';
import { orderAPI, formatPrice, formatDate } from '../../utils/api';

// Separate component that uses useSearchParams
function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderAPI.getOrder(orderNumber);
      
      if (response.success) {
        setOrder(response.data);
      } else {
        setError('Order not found');
      }
    } catch (error) {
      // console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-emerald-600',
          bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
          borderColor: 'border-emerald-200',
          title: 'Order Confirmed!',
          message: 'Thank you for your purchase. Your order has been successfully processed and payment confirmed.',
          nextSteps: [
            'You will receive a confirmation email shortly',
            'Your order will be processed within 1-2 business days',
            'You\'ll get tracking information once shipped'
          ]
        };
      case 'declined':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
          borderColor: 'border-red-200',
          title: 'Payment Declined',
          message: 'Unfortunately, your payment was declined by your card issuer. No charges have been made.',
          nextSteps: [
            'Check your card details and try again',
            'Contact your bank to authorize the transaction',
            'Try using a different payment method'
          ]
        };
      case 'failed':
        return {
          icon: AlertTriangle,
          color: 'text-amber-600',
          bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
          borderColor: 'border-amber-200',
          title: 'Payment Processing Error',
          message: 'We encountered a technical issue while processing your payment. This is temporary.',
          nextSteps: [
            'Please try placing your order again',
            'If the issue persists, contact our support team',
            'Your card has not been charged'
          ]
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-slate-600',
          bgColor: 'bg-gradient-to-br from-slate-50 to-gray-50',
          borderColor: 'border-slate-200',
          title: 'Order Status Unknown',
          message: 'We\'re checking your order status. Please contact support if you have questions.',
          nextSteps: []
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h1>
          <p className="text-slate-600 mb-6">
            {error || 'We couldn\'t find the order you\'re looking for.'}
          </p>
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium">
              <ArrowLeft className="w-5 h-5" />
              <span>Continue Shopping</span>
            </Link>
            <h1 className="ml-6 text-2xl font-bold text-slate-900">Order Confirmation</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 rounded-3xl p-8 mb-8 shadow-xl`}>
          <div className="text-center">
            <StatusIcon className={`w-20 h-20 ${statusConfig.color} mx-auto mb-6 drop-shadow-lg`} />
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              {statusConfig.title}
            </h1>
            <p className="text-lg text-slate-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              {statusConfig.message}
            </p>
            
            {statusConfig.nextSteps.length > 0 && (
              <div className="text-left max-w-md mx-auto bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">What happens next:</h3>
                <ul className="space-y-3">
                  {statusConfig.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-slate-600 rounded-full mt-2.5 flex-shrink-0"></span>
                      <span className="text-slate-700 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-slate-900 rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Order Details</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Order Number</span>
                  <span className="font-mono text-sm bg-slate-900 text-white px-3 py-2 rounded-lg font-bold">
                    {order.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Order Date</span>
                  <span className="text-slate-900 font-semibold">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Status</span>
                  <span className={`capitalize ${statusConfig.color} font-bold text-lg`}>
                    {order.status}
                  </span>
                </div>
                {order.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Transaction ID</span>
                    <span className="font-mono text-sm text-slate-800 font-semibold">{order.transactionId}</span>
                  </div>
                )}
                {order.notes && (
                  <div className="pt-4 border-t border-slate-200">
                    <span className="text-slate-600 font-medium block mb-2">Notes</span>
                    <span className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg block">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Customer Information</h2>
              
              <div className="space-y-5">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Mail className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{order.customerInfo.fullName}</p>
                    <p className="text-slate-600 font-medium">{order.customerInfo.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Phone className="w-5 h-5 text-slate-600" />
                  </div>
                  <p className="text-slate-800 font-semibold">{order.customerInfo.phone}</p>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-semibold">{order.customerInfo.address}</p>
                    <p className="text-slate-700 font-medium">
                      {order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Payment Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-slate-700 to-slate-900 rounded-lg text-white text-xs flex items-center justify-center font-bold shadow-lg">
                    CARD
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Credit Card</p>
                    <p className="text-slate-600 font-mono font-semibold">
                      •••• •••• •••• {order.paymentInfo.cardNumber.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="text-slate-600 font-semibold">
                  Expires: {order.paymentInfo.expiryDate}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-5 mb-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-xl">
                    <div className="relative w-16 h-16 bg-slate-200 rounded-xl overflow-hidden shadow-md">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{item.productName}</h3>
                      {item.selectedVariants?.length > 0 && (
                        <p className="text-sm text-slate-600 font-medium">
                          {item.selectedVariants.map(v => `${v.name}: ${v.value}`).join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-slate-700 font-semibold">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-lg">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-slate-200 space-y-4 pt-6">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Shipping</span>
                  <span className="font-semibold text-slate-800">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Tax</span>
                  <span className="font-semibold text-slate-800">{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-slate-900">Total</span>
                    <span className="text-slate-900">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 space-y-4">
                {order.status === 'approved' && (
                  <div className="flex items-center space-x-3 text-sm text-emerald-800 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <Truck className="w-5 h-5" />
                    <span className="font-semibold">Your order will be shipped within 1-2 business days</span>
                  </div>
                )}
                
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 text-slate-800 font-semibold rounded-xl hover:bg-slate-200 transition-all duration-200 border border-slate-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Print Order Details</span>
                </button>
                
                <Link href="/" className="block w-full">
                  <button className="w-full px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Need Help Section */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Need Help?</h3>
            <p className="text-slate-600 mb-8 text-lg leading-relaxed">
              If you have any questions about your order, please don't hesitate to contact our customer service team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@ecommerce.com" 
                className="px-6 py-3 bg-slate-100 text-slate-800 font-semibold rounded-xl hover:bg-slate-200 transition-all duration-200 border border-slate-200"
              >
                Email Support
              </a>
              <a 
                href="tel:+1-555-123-4567" 
                className="px-6 py-3 bg-slate-100 text-slate-800 font-semibold rounded-xl hover:bg-slate-200 transition-all duration-200 border border-slate-200"
              >
                Call (555) 123-4567
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-slate-700 font-medium">Loading page...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ThankYouPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThankYouContent />
    </Suspense>
  );
}