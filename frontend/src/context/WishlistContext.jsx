import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current user's wishlist from API
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist({ products: [] });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/wishlist');
      if (res.data && res.data.wishlist) {
        setWishlist(res.data.wishlist);
      } else {
        setWishlist({ products: [] });
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Unable to retrieve wishlist.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch wishlist automatically whenever authenticated user state changes
  useEffect(() => {
    let isMounted = true;
    const loadWishlist = async () => {
      if (!user) {
        if (isMounted) {
          setWishlist({ products: [] });
        }
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/wishlist');
        if (isMounted) {
          if (res.data && res.data.wishlist) {
            setWishlist(res.data.wishlist);
          } else {
            setWishlist({ products: [] });
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching wishlist:', err);
          setError('Unable to retrieve wishlist.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWishlist();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Add product to wishlist: POST /api/wishlist/:productId
  const addToWishlist = async (productId) => {
    if (!user) {
      return { success: false, requireAuth: true, message: 'Please login to save products to your wishlist.' };
    }

    try {
      setError(null);
      const res = await api.post(`/wishlist/${productId}`);
      if (res.data && res.data.success && res.data.wishlist) {
        setWishlist(res.data.wishlist);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Failed to add item to wishlist.' };
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      const msg = err.response?.data?.message || 'Failed to add item to wishlist.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Remove product from wishlist: DELETE /api/wishlist/:productId
  const removeFromWishlist = async (productId) => {
    if (!user) {
      return { success: false, requireAuth: true, message: 'Please login to manage your wishlist.' };
    }

    try {
      setError(null);
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data && res.data.success && res.data.wishlist) {
        setWishlist(res.data.wishlist);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Failed to remove item from wishlist.' };
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      const msg = err.response?.data?.message || 'Failed to remove item from wishlist.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Clear all items from wishlist: DELETE /api/wishlist
  const clearWishlist = async () => {
    if (!user) {
      setWishlist({ products: [] });
      return { success: true };
    }

    try {
      setError(null);
      const res = await api.delete('/wishlist');
      if (res.data && res.data.success) {
        setWishlist({ user: user._id, products: [] });
        return { success: true, message: 'Wishlist cleared.' };
      }
      return { success: false, message: res.data?.message || 'Failed to clear wishlist.' };
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      const msg = err.response?.data?.message || 'Failed to clear wishlist.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Helper check if a product is currently in wishlist
  const isInWishlist = (productId) => {
    if (!productId || !wishlist || !Array.isArray(wishlist.products)) return false;
    return wishlist.products.some((item) => {
      const id = typeof item === 'object' ? item?._id : item;
      return id && id.toString() === productId.toString();
    });
  };

  const wishlistCount = wishlist?.products?.length || 0;

  const value = {
    wishlist,
    wishlistCount,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
