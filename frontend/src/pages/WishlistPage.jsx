import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const WishlistPage = () => {
  const { wishlist, loading, error, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [cartNotice, setCartNotice] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const products = (wishlist?.products || []).filter(Boolean);

  const handleAddToCart = async (product) => {
    if (!product || product.stock === 0) return;

    try {
      setAddingId(product._id);
      setCartNotice(null);
      const res = await addToCart(product._id, 1);
      setAddingId(null);

      if (res.success) {
        setCartNotice(`Added "${product.name}" to your shopping cart!`);
      } else {
        setCartNotice(`Failed to add: ${res.message || 'Error occurred'}`);
      }
    } catch (err) {
      setAddingId(null);
      setCartNotice(err.response?.data?.message || 'Failed to add item to cart.');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setRemovingId(productId);
      await removeFromWishlist(productId);
    } catch (err) {
      console.error('Error removing product from wishlist:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const getFallbackSvg = (name) =>
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="%23f1f5f9"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%2364748b">${encodeURIComponent(name || 'Item')}</text></svg>`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Wishlist ♡</h1>
          <p className="text-muted">Saved items you love and want to purchase later.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn btn-outline" style={{ width: 'auto' }}>
            ← Continue Shopping
          </Link>
          {products.length > 0 && !showClearConfirm && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn btn-outline"
              style={{ color: 'var(--danger)', width: 'auto' }}
            >
              🗑️ Clear Wishlist
            </button>
          )}
        </div>
      </div>

      {/* Clear Confirmation Prompt */}
      {showClearConfirm && (
        <div className="alert-box alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span>Clear all saved products from your wishlist?</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={async () => {
                await clearWishlist();
                setShowClearConfirm(false);
              }}
              className="btn btn-danger btn-sm"
            >
              Yes, Clear All
            </button>
            <button onClick={() => setShowClearConfirm(false)} className="btn btn-outline btn-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {cartNotice && (
        <div className="alert-box alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✅ {cartNotice}</span>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/cart" className="btn btn-sm btn-primary" style={{ width: 'auto' }}>
              View Cart →
            </Link>
            <button onClick={() => setCartNotice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <h3>Loading wishlist...</h3>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="state-container alert-danger">
          <h3>Unable to load wishlist</h3>
          <p style={{ margin: '0.5rem 0 1rem' }}>{error}</p>
        </div>
      )}

      {/* Empty Wishlist State */}
      {!loading && !error && products.length === 0 && (
        <div className="state-container">
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>♡</div>
          <h3>Your wishlist is empty</h3>
          <p style={{ marginBottom: '1.5rem' }}>Save products you love and find them here later.</p>
          <Link to="/products" className="btn btn-primary" style={{ width: 'auto' }}>
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Wishlist Items Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-3">
          {products.map((product) => {
            if (!product || !product._id) return null;
            const isOutOfStock = product.stock === 0;

            return (
              <div key={product._id} className="card product-card">
                <div className="product-image-container">
                  <img
                    src={product.image || getFallbackSvg(product.name)}
                    alt={product.name || 'Product'}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = getFallbackSvg(product.name);
                    }}
                  />
                  <span className="badge badge-primary product-category-badge">{product.category}</span>
                </div>

                <div className="card-body product-card-body">
                  <h3 className="product-title" title={product.name}>
                    {product.name}
                  </h3>

                  <div className="product-stock-status" style={{ marginTop: '0.25rem' }}>
                    {!isOutOfStock ? (
                      <span className="badge badge-success">In Stock ({product.stock} left)</span>
                    ) : (
                      <span className="badge badge-danger">Out of Stock</span>
                    )}
                  </div>

                  <div className="product-price" style={{ margin: '0.75rem 0' }}>
                    ₹{Number(product.price || 0).toLocaleString('en-IN')}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock || addingId === product._id}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%' }}
                    >
                      🛒 {addingId === product._id ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to={`/products/${product._id}`}
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1 }}
                      >
                        Details
                      </Link>

                      <button
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        disabled={removingId === product._id}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--danger)', flex: 1 }}
                      >
                        {removingId === product._id ? 'Removing...' : '♥ Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
