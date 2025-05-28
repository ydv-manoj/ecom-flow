'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CreditCard, Lock, User, MapPin, Phone, Mail } from 'lucide-react';
import { orderAPI, emailAPI, formatPrice } from '../../utils/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm();

  useEffect(() => {
    // Get order data from sessionStorage
    const storedOrderData = sessionStorage.getItem('orderData');
    if (storedOrderData) {
      setOrderData(JSON.parse(storedOrderData));
    } else {
      toast.error('No product selected. Redirecting to home...');
      router.push('/');
    }
  }, [router]);

  const watchedCardNumber = watch('cardNumber', '');
  const watchedExpiryDate = watch('expiryDate', '');
  const watchedCvv = watch('cvv', '');

  // Format card number input
  useEffect(() => {
    if (watchedCardNumber) {
      const formatted = watchedCardNumber
        .replace(/\s/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
      if (formatted !== watchedCardNumber) {
        setValue('cardNumber', formatted);
      }
    }
  }, [watchedCardNumber, setValue]);

  // Format expiry date input
  useEffect(() => {
    if (watchedExpiryDate) {
      const formatted = watchedExpiryDate
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1/$2')
        .slice(0, 5);
      if (formatted !== watchedExpiryDate) {
        setValue('expiryDate', formatted);
      }
    }
  }, [watchedExpiryDate, setValue]);

  // Format CVV input
  useEffect(() => {
    if (watchedCvv) {
      const formatted = watchedCvv.replace(/\D/g, '').slice(0, 3);
      if (formatted !== watchedCvv) {
        setValue('cvv', formatted);
      }
    }
  }, [watchedCvv, setValue]);

  const validateCardNumber = (value) => {
    if (!value) {
      return 'Card number is required';
    }
    
    const cleanCardNumber = value.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleanCardNumber)) {
      return 'Card number must be exactly 16 digits';
    }
    
    return true;
  };

  const validateExpiryDate = (value) => {
    if (!value || !/^\d{2}\/\d{2}$/.test(value)) {
      return 'Please enter a valid expiry date (MM/YY)';
    }
    
    const [month, year] = value.split('/');
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    // Validate month is between 1-12
    if (monthNum < 1 || monthNum > 12) {
      return 'Month must be between 01 and 12';
    }
    
    // Validate year is in the future
    const expiry = new Date(parseInt(`20${year}`), monthNum - 1);
    const now = new Date();
    
    if (expiry <= now) {
      return 'Expiry date must be in the future';
    }
    
    return true;
  };

  const onSubmit = async (formData) => {
    if (!orderData) {
      toast.error('Order data not found');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data for API
      const orderPayload = {
        items: [{
          productId: orderData.productId,
          productName: orderData.productName,
          price: orderData.price,
          quantity: orderData.quantity,
          selectedVariants: orderData.selectedVariants,
          image: orderData.image // Include the selected variant image
        }],
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        paymentInfo: {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          expiryDate: formData.expiryDate,
          cvv: formData.cvv
        }
      };

      // Create order
      const orderResponse = await orderAPI.createOrder(orderPayload);
      
      if (orderResponse.success) {
        const { orderNumber } = orderResponse.data;
        
        toast.success('Order created successfully!');
        
        // Send confirmation email
        try {
          await emailAPI.sendOrderEmail(orderNumber);
          console.log('Confirmation email sent');
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't show error to user as order was successful
        }
        
        // Clear order data from sessionStorage
        sessionStorage.removeItem('orderData');
        
        // Redirect to thank you page
        setTimeout(() => {
          router.push(`/thank-you?orderNumber=${orderNumber}`);
        }, 1000);
        
      } else {
        toast.error(orderResponse.message || 'Order failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const subtotal = orderData.price * orderData.quantity;
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="ml-6 text-2xl font-bold text-slate-900">Checkout</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Checkout Form */}
          <div className="space-y-8">
            <div className="space-y-8">
              {/* Customer Information */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Customer Information</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      Full Name
                    </label>
                    <input
                      type="text"
                      {...register('fullName', { 
                        required: 'Full name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                      })}
                      className={`w-full px-4 py-3 border-2 rounded-xl text-slate-900 font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200 ${
                        errors.fullName 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-slate-300 hover:border-slate-400 focus:border-slate-600'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && (
                      <p className="mt-2 text-sm text-red-600 font-semibold">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          {...register('email', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Please enter a valid email address'
                            }
                          })}
                          className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-slate-900 font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200 ${
                            errors.email 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-slate-300 hover:border-slate-400 focus:border-slate-600'
                          }`}
                          placeholder="john@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600 font-semibold">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          {...register('phone', { 
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[\+]?[1-9][\d]{0,15}$/,
                              message: 'Please enter a valid phone number'
                            }
                          })}
                          className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-slate-900 font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200 ${
                            errors.phone 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-slate-300 hover:border-slate-400 focus:border-slate-600'
                          }`}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-2 text-sm text-red-600 font-semibold">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Shipping Address</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      Street Address
                    </label>
                    <input
                      type="text"
                      {...register('address', { 
                        required: 'Address is required',
                        minLength: { value: 5, message: 'Address must be at least 5 characters' }
                      })}
                      className={`w-full px-4 py-3 border-2 rounded-xl text-slate-900 font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200 ${
                        errors.address 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-slate-300 hover:border-slate-400 focus:border-slate-600'
                      }`}
                      placeholder="123 Main Street"
                    />
                    {errors.address && (
                      <p className="mt-2 text-sm text-red-600 font-semibold">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3">
                        City
                      </label>
                      <input
                        type="text"
                        {...register('city', { 
                          required: 'City is required',
                          minLength: { value: 2, message: 'City must be at least 2 characters' }
                        })}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-slate-900 font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200 ${
                          errors.city 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-slate-300 hover:border-slate-400 focus:border-slate-600'
                        }`}
                        placeholder="New York"
                      />
                      {errors.city && (
                        <p className="mt-2 text-sm text-red-600 font-semibold">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3">
                        State
                      </label>
                      <input
                        type="text"
                        {...register('state', { 
                          required: 'State is required',
                          minLength: { value: 2, message: 'State must be at least 2 characters' }
                        })}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-slate-900 font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200 ${
                          errors.state 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-slate-300 hover:border-slate-400 focus:border-slate-600'
                        }`}
                        placeholder="NY"
                      />
                      {errors.state && (
                        <p className="mt-2 text-sm text-red-600 font-semibold">{errors.state.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        {...register('zipCode', { 
                          required: 'Zip code is required',
                          pattern: {
                            value: /^\d{5}(-\d{4})?$/,
                            message: 'Please enter a valid zip code'
                          }
                        })}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-slate-900 font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200 ${
                          errors.zipCode 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-slate-300 hover:border-slate-400 focus:border-slate-600'
                        }`}
                        placeholder="10001"
                      />
                      {errors.zipCode && (
                        <p className="mt-2 text-sm text-red-600 font-semibold">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Payment Information</h2>
                </div>
                
                {/* Payment Simulation Instructions */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
                  <h3 className="font-bold text-blue-900 mb-3 text-lg">Payment Simulation</h3>
                  <p className="text-blue-800 mb-4 font-medium">Use these CVV codes to simulate different outcomes:</p>
                  <ul className="text-blue-700 space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span><strong>111</strong> → ✅ Approved Transaction</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span><strong>222</strong> → ❌ Declined Transaction</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span><strong>333</strong> → ⚠️ Gateway Error</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span><strong>Any other 3 digits</strong> → ✅ Approved</span>
                    </li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      Card Number
                    </label>
                    <input
                      type="text"
                      {...register('cardNumber', { 
                        required: 'Card number is required',
                        validate: validateCardNumber
                      })}
                      className={`w-full px-4 py-3 border-2 rounded-xl text-slate-900 font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200 ${
                        errors.cardNumber 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-slate-300 hover:border-slate-400 focus:border-slate-600'
                      }`}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {errors.cardNumber && (
                      <p className="mt-2 text-sm text-red-600 font-semibold">{errors.cardNumber.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        {...register('expiryDate', { 
                          required: 'Expiry date is required',
                          validate: validateExpiryDate
                        })}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-slate-900 font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200 ${
                          errors.expiryDate 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-slate-300 hover:border-slate-400 focus:border-slate-600'
                        }`}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      {errors.expiryDate && (
                        <p className="mt-2 text-sm text-red-600 font-semibold">{errors.expiryDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-3">
                        CVV
                      </label>
                      <input
                        type="text"
                        {...register('cvv', { 
                          required: 'CVV is required',
                          pattern: {
                            value: /^\d{3}$/,
                            message: 'CVV must be 3 digits'
                          }
                        })}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-slate-900 font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-200 ${
                          errors.cvv 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-slate-300 hover:border-slate-400 focus:border-slate-600'
                        }`}
                        placeholder="123"
                        maxLength={3}
                      />
                      {errors.cvv && (
                        <p className="mt-2 text-sm text-red-600 font-semibold">{errors.cvv.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="w-full py-4 px-8 bg-slate-900 text-white font-bold text-lg rounded-2xl hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 active:transform active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner w-6 h-6"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-6 h-6" />
                    <span>Complete Order</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Order Summary</h2>
              
              {/* Product */}
              <div className="flex items-center space-x-5 pb-8 border-b border-slate-200">
                <div className="relative w-20 h-20 bg-slate-200 rounded-xl overflow-hidden shadow-md">
                  <Image
                    src={orderData.image}
                    alt={orderData.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg">{orderData.productName}</h3>
                  {orderData.selectedVariants?.length > 0 && (
                    <p className="text-slate-600 font-medium">
                      {orderData.selectedVariants.map(v => `${v.name}: ${v.value}`).join(', ')}
                    </p>
                  )}
                  <p className="text-slate-700 font-semibold">Qty: {orderData.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-lg">{formatPrice(subtotal)}</p>
                </div>
              </div>

              {/* Order Totals */}
              <div className="space-y-4 pt-8">
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
                    <span className="text-slate-900">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-3 text-slate-700">
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold">Your payment information is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}