'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Minus, Plus, ShoppingCart, Star, Truck, Shield, RotateCcw, Heart, Share2, Award, Users } from 'lucide-react';
import { productAPI, formatPrice } from '../utils/api';

export default function HomePage() {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [currentImage, setCurrentImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      // First try to get products
      let productsResponse = await productAPI.getProducts();
      
      // If no products exist, seed them first
      if (!productsResponse.success || productsResponse.data.length === 0) {
        console.log('No products found, seeding...');
        await productAPI.seedProducts();
        productsResponse = await productAPI.getProducts();
      }
      
      if (productsResponse.success && productsResponse.data.length > 0) {
        const firstProduct = productsResponse.data[0];
        setProduct(firstProduct);
        
        // Initialize selected variants with first option of each variant
        const initialVariants = {};
        let initialImage = firstProduct.image; // fallback to default image
        
        firstProduct.variants?.forEach(variant => {
          if (variant.options && variant.options.length > 0) {
            const availableOption = variant.options.find(option => option.inStock);
            if (availableOption) {
              initialVariants[variant.name] = availableOption.value;
              
              // If this is the color variant and has an image, use it
              if (variant.name === 'color' && availableOption.image) {
                initialImage = availableOption.image;
              }
            }
          }
        });
        
        setSelectedVariants(initialVariants);
        setCurrentImage(initialImage);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantChange = (variantName, value) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: value
    }));

    // If the variant is color, update the current image
    if (variantName === 'color' && product) {
      const colorVariant = product.variants?.find(v => v.name === 'color');
      if (colorVariant) {
        const selectedColorOption = colorVariant.options?.find(option => option.value === value);
        if (selectedColorOption && selectedColorOption.image) {
          setCurrentImage(selectedColorOption.image);
        }
      }
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.inventory || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    
    try {
      // Check if all required variants are selected
      const requiredVariants = product.variants?.filter(v => v.options?.length > 0) || [];
      const missingVariants = requiredVariants.filter(variant => 
        !selectedVariants[variant.name]
      );
      
      if (missingVariants.length > 0) {
        toast.error(`Please select: ${missingVariants.map(v => v.value).join(', ')}`);
        return;
      }

      // Prepare order data
      const orderData = {
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity,
        selectedVariants: Object.entries(selectedVariants).map(([name, value]) => ({
          name,
          value
        })),
        image: currentImage
      };

      // Store in sessionStorage for checkout page
      sessionStorage.setItem('orderData', JSON.stringify(orderData));
      
      toast.success('Product added! Redirecting to checkout...');
      
      // Redirect to checkout
      setTimeout(() => {
        router.push('/checkout');
      }, 1000);
      
    } catch (error) {
      console.error('Error preparing order:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-xl text-slate-700 font-semibold mb-4">Product not found</p>
          <button 
            onClick={fetchProduct}
            className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.inventory === 0;
  const canAddToCart = !isOutOfStock && quantity <= product.inventory;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      {/* <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900">eCommerce</h1>
            </div>
            <nav className="flex items-center space-x-8">
              <a href="#" className="text-slate-700 hover:text-slate-900 font-medium transition-colors duration-200">Products</a>
              <a href="#" className="text-slate-700 hover:text-slate-900 font-medium transition-colors duration-200">About</a>
              <a href="#" className="text-slate-700 hover:text-slate-900 font-medium transition-colors duration-200">Contact</a>
            </nav>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Image and Additional Content */}
          <div className="space-y-8">
            {/* Product Image */}
            <div className="aspect-square relative bg-slate-200 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-6 right-6 flex space-x-3">
                <button className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200">
                  <Heart className="w-5 h-5 text-slate-700" />
                </button>
                <button className="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200">
                  <Share2 className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Product Details</h3>
              <p className="text-slate-700 leading-relaxed text-lg mb-6">
                {product.description}
              </p>
              
              {/* Key Features */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900">Key Features</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Award className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-slate-800 font-medium">Premium Quality Materials</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-slate-800 font-medium">Advanced Protection Technology</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-slate-800 font-medium">Trusted by 10,000+ Customers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Why Choose This Product?</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-emerald-100 rounded-xl mt-1">
                    <Truck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Free Fast Shipping</h4>
                    <p className="text-slate-600">Get free shipping on orders over $50. Fast delivery within 2-3 business days.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-xl mt-1">
                    <RotateCcw className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Hassle-Free Returns</h4>
                    <p className="text-slate-600">Not satisfied? Return within 30 days for a full refund, no questions asked.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-100 rounded-xl mt-1">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Extended Warranty</h4>
                    <p className="text-slate-600">Enjoy peace of mind with our comprehensive 2-year warranty coverage.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info and Purchase */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                {product.name}
              </h1>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-slate-600 font-medium">(128 reviews)</span>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-slate-900">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-slate-600 font-medium">
                    {product.inventory} items available
                  </p>
                </div>
              </div>
            </div>

            {/* Variants Selection */}
            {product.variants?.map((variant) => (
              <div key={variant.name} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <label className="block text-xl font-bold text-slate-900 mb-6">
                  Choose {variant.value}
                </label>
                <div className="flex flex-wrap gap-3">
                  {variant.options?.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleVariantChange(variant.name, option.value)}
                      disabled={!option.inStock}
                      className={`px-6 py-4 border-2 rounded-xl font-semibold transition-all duration-200 ${
                        selectedVariants[variant.name] === option.value
                          ? 'border-slate-900 bg-slate-900 text-white shadow-lg transform scale-105'
                          : option.inStock
                          ? 'border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50 hover:scale-105'
                          : 'border-slate-200 text-slate-400 cursor-not-allowed line-through bg-slate-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity and Purchase */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <div className="space-y-6">
                {/* Quantity */}
                <div>
                  <label className="block text-xl font-bold text-slate-900 mb-4">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-14 h-14 rounded-xl border-2 border-slate-300 flex items-center justify-center hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                    >
                      <Minus className="w-6 h-6 text-slate-700" />
                    </button>
                    <span className="text-3xl font-bold w-20 text-center text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.inventory}
                      className="w-14 h-14 rounded-xl border-2 border-slate-300 flex items-center justify-center hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                    >
                      <Plus className="w-6 h-6 text-slate-700" />
                    </button>
                  </div>
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={!canAddToCart || isAddingToCart}
                  className={`w-full py-5 px-8 rounded-2xl font-bold text-xl flex items-center justify-center space-x-4 transition-all duration-200 shadow-lg hover:shadow-xl ${
                    isOutOfStock 
                      ? 'bg-slate-400 text-white cursor-not-allowed' 
                      : 'bg-slate-900 text-white hover:bg-slate-800 active:transform active:scale-95'
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="loading-spinner w-7 h-7"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-7 h-7" />
                      <span>{isOutOfStock ? 'Out of Stock' : 'Buy Now'}</span>
                    </>
                  )}
                </button>
                
                {isOutOfStock && (
                  <p className="text-center text-red-600 font-semibold text-lg">
                    This item is currently out of stock
                  </p>
                )}

                {/* Quick Summary */}
                <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
                      <span className="font-semibold text-slate-900">{formatPrice(product.price * quantity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Shipping</span>
                      <span className="font-semibold text-emerald-600">
                        {(product.price * quantity) >= 50 ? 'Free' : '$9.99'}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 mt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-slate-900">Total</span>
                        <span className="text-lg font-bold text-slate-900">
                          {formatPrice(product.price * quantity + ((product.price * quantity) >= 50 ? 0 : 9.99))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}