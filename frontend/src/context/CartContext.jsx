import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch cart data from GET /api/cart
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], total: 0 });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/cart');
      if (res.data && res.data.success && res.data.cart) {
        setCart(res.data.cart);
      } else {
        setCart({ items: [], total: 0 });
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      if (err.response && err.response.status === 401) {
        setCart({ items: [], total: 0 });
      } else {
        setError('Unable to load shopping cart.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch cart whenever authentication user state changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [], total: 0 });
    }
  }, [user, fetchCart]);

  // Add product to cart: POST /api/cart
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      setError(null);
      const res = await api.post('/cart', { productId, quantity });
      if (res.data && res.data.success) {
        // Re-fetch cart to ensure populated product details and exact total are synchronized
        await fetchCart();
        return { success: true, message: res.data.message || 'Product added to cart' };
      } else {
        return { success: false, message: res.data.message || 'Failed to add product to cart' };
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      const msg = err.response?.data?.message || 'Unable to add product to cart. Please try again.';
      return { success: false, message: msg };
    }
  };

  // Update cart item quantity: PUT /api/cart/:productId
  const updateCartItem = async (productId, quantity) => {
    if (!user) return { success: false, message: 'Authentication required' };

    try {
      setError(null);
      const res = await api.put(`/cart/${productId}`, { quantity });
      if (res.data && res.data.success) {
        await fetchCart();
        return { success: true, message: res.data.message || 'Cart updated' };
      } else {
        return { success: false, message: res.data.message || 'Failed to update cart' };
      }
    } catch (err) {
      console.error('Error updating cart item:', err);
      const msg = err.response?.data?.message || 'Unable to update cart item.';
      return { success: false, message: msg };
    }
  };

  // Remove item from cart: DELETE /api/cart/:productId
  const removeFromCart = async (productId) => {
    if (!user) return { success: false, message: 'Authentication required' };

    try {
      setError(null);
      const res = await api.delete(`/cart/${productId}`);
      if (res.data && res.data.success) {
        await fetchCart();
        return { success: true, message: res.data.message || 'Item removed' };
      } else {
        return { success: false, message: res.data.message || 'Failed to remove item' };
      }
    } catch (err) {
      console.error('Error removing item from cart:', err);
      const msg = err.response?.data?.message || 'Unable to remove item from cart.';
      return { success: false, message: msg };
    }
  };

  // Clear entire cart: DELETE /api/cart
  const clearCart = async () => {
    if (!user) return { success: false, message: 'Authentication required' };

    try {
      setError(null);
      const res = await api.delete('/cart');
      if (res.data && res.data.success) {
        setCart({ items: [], total: 0 });
        return { success: true, message: res.data.message || 'Cart cleared' };
      } else {
        return { success: false, message: res.data.message || 'Failed to clear cart' };
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      const msg = err.response?.data?.message || 'Unable to clear cart.';
      return { success: false, message: msg };
    }
  };

  // Calculate total number of items in cart for Navbar badge
  const itemCount = cart?.items
    ? cart.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        itemCount,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
