import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/currency';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, loading } = useCart();

  if (loading) return <div className="p-8 text-center">Loading cart...</div>;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Helmet>
          <title>Your Cart - ShopVibe</title>
        </Helmet>
        <div className="max-w-md mx-auto">
          <ShoppingBag className="h-24 w-24 mx-auto text-gray-200 mb-6" />
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products">
            <Button className="rounded-full bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-lg">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Your Cart - ShopVibe</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.products?.images?.[0] && (
                    <img
                      src={item.products.images[0]}
                      alt={item.products.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        <Link to={`/products/${item.products?.slug}`} className="hover:text-blue-900">
                          {item.products?.name}
                        </Link>
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {item.selected_size && (
                      <p className="text-sm text-gray-500 mt-1">Size: <span className="font-medium text-gray-900">{item.selected_size}</span></p>
                    )}
                    <p className="text-blue-900 font-bold mt-1">
                      {formatCurrency(item.product_variants?.price || item.products?.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-full">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2 hover:bg-gray-50 rounded-l-full text-gray-600"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-50 rounded-r-full text-gray-600"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getCartTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{getCartTotal() > 50 ? 'Free' : formatCurrency(5)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span className="text-blue-900">
                    {formatCurrency(getCartTotal() + (getCartTotal() > 50 ? 0 : 5))}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full rounded-full bg-blue-900 hover:bg-blue-800 text-white py-6 shadow-lg shadow-blue-900/20"
                onClick={() => navigate('/checkout')}
              >
                Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;