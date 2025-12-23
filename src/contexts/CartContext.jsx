import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useSupabaseAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('cart_items')
        .select(`
          *,
          products (id, name, slug, price, images),
          product_variants (id, name, price, sku)
        `);

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', getSessionId());
      }

      const { data, error } = await query;
      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, variantId = null, quantity = 1, size = null) => {
    try {
      // Check if item already exists with same product, variant AND size
      const existingItem = cartItems.find(item => 
        item.product_id === productId && 
        item.variant_id === variantId && 
        item.selected_size === size
      );

      if (existingItem) {
        return updateQuantity(existingItem.id, existingItem.quantity + quantity);
      }

      const cartData = {
        product_id: productId,
        variant_id: variantId,
        quantity,
        selected_size: size,
        user_id: user?.id || null,
        session_id: user ? null : getSessionId(),
      };

      const { error } = await supabase
        .from('cart_items')
        .insert([cartData]);

      if (error) throw error;
      await fetchCart();
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error };
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date() })
        .eq('id', cartItemId);

      if (error) throw error;
      await fetchCart();
      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, error };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      await fetchCart();
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error };
    }
  };

  const clearCart = async () => {
    try {
      let query = supabase.from('cart_items').delete();
      
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', getSessionId());
      }

      const { error } = await query;
      if (error) throw error;
      setCartItems([]);
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error };
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product_variants?.price || item.products?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};