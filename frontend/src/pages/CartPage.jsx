import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartItemRow = ({ item, onUpdateQuantity, onRemove, isUpdating }) => {
  const [imgError, setImgError] = useState(false);
  const product = item.product || {};
  const stock = product.stock || 0;
  const currentQty = item.quantity || 1;

  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="%23f1f5f9"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%2364748b">${encodeURIComponent(product.name || 'Img')}</text></svg>`;

  const handleDecrease = () => {
    if (currentQty > 1 && !isUpdating) {
      onUpdateQuantity(product._id, currentQty - 1);
    }
  };

  const handleIncrease = () => {
    if (currentQty < stock && !isUpdating) {
      onUpdateQuantity(product._id, currentQty + 1);
    }
  };

  return (
    <tr>
      {/* Product Image & Info */}
      <td style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '220px' }}>
        <img
          src={imgError || !product.image ? fallbackSvg : product.image}
          alt={product.name || 'Product'}
          style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', backgroundColor: '#f1f5f9' }}
          onError={() => setImgError(true)}
        />
        <div>
          <Link to={`/products/${product._id}`} style={{ fontWeight: '600', color: 'var(--secondary)' }}>
            {product.name || 'Unnamed Product'}
          </Link>
          <div className="text-muted" style={{ fontSize: '0.8rem' }}>
            {product.category} {stock <= 5 && stock > 0 && <span style={{ color: 'var(--danger)' }}>({stock} left)</span>}
          </div>
        </div>
      </td>

      {/* Unit Price */}
      <td style={{ whiteSpace: 'nowrap' }}>
        ₹{Number(product.price || 0).toLocaleString('en-IN')}
      </td>

      {/* Quantity Control Buttons */}
      <td>
        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={handleDecrease}
            disabled={currentQty <= 1 || isUpdating}
            aria-label="Decrease quantity"
            style={{
              padding: '0.35rem 0.65rem',
              border: 'none',
              background: '#f8fafc',
              cursor: currentQty <= 1 || isUpdating ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: currentQty <= 1 || isUpdating ? 0.4 : 1,
            }}
          >
            −
          </button>
          <span style={{ padding: '0.35rem 0.75rem', fontWeight: '600', minWidth: '36px', textAlign: 'center', fontSize: '0.9rem' }}>
            {currentQty}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={currentQty >= stock || isUpdating}
            aria-label="Increase quantity"
            style={{
              padding: '0.35rem 0.65rem',
              border: 'none',
              background: '#f8fafc',
              cursor: currentQty >= stock || isUpdating ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: currentQty >= stock || isUpdating ? 0.4 : 1,
            }}
          >
            +
          </button>
        </div>
      </td>

      {/* Item Subtotal */}
      <td style={{ whiteSpace: 'nowrap', fontWeight: '700', color: 'var(--secondary)' }}>
        ₹{Number(item.subtotal || (product.price * currentQty)).toLocaleString('en-IN')}
      </td>

      {/* Remove Button */}
      <td>
        <button
          type="button"
          onClick={() => onRemove(product._id)}
          disabled={isUpdating}
          className="btn btn-danger"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
          aria-label={`Remove ${product.name} from cart`}
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

const CartPage = () => {
  const { cart, loading, error, updateCartItem, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await updateCartItem(productId, quantity);
      if (!res.success) {
        setActionError(res.message);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update quantity.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await removeFromCart(productId);
      if (!res.success) {
        setActionError(res.message);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to remove item.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmClearCart = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await clearCart();
      setShowClearConfirm(false);
      if (!res.success) {
        setActionError(res.message);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to clear cart.');
    } finally {
      setActionLoading(false);
    }
  };

  const items = cart?.items || [];
  const cartTotal = cart?.total || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Shopping Cart</h1>
          <p className="text-muted">Review your items before proceeding to checkout.</p>
        </div>
        {items.length > 0 && (
          <Link to="/products" className="btn btn-outline">
            ← Continue Shopping
          </Link>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <h3>Loading cart...</h3>
          <p>Retrieving your saved shopping items.</p>
        </div>
      )}

      {/* Error Message Alert */}
      {(error || actionError) && (
        <div className="alert-box alert-danger">
          <span>⚠️ {actionError || error}</span>
          <button
            onClick={() => setActionError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Empty Cart Display */}
      {!loading && items.length === 0 && (
        <div className="state-container">
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🛒</div>
          <h3>Your cart is empty</h3>
          <p style={{ marginBottom: '1.5rem' }}>Looks like you haven't added any products to your cart yet.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products & Shop Now
          </Link>
        </div>
      )}

      {/* Cart Data View */}
      {!loading && items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Cart Items Table */}
          <div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <CartItemRow
                      key={item.product?._id || index}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                      isUpdating={actionLoading}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Clear Cart Controls */}
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {showClearConfirm ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fee2e2', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.9rem', color: '#991b1b', fontWeight: '600' }}>Clear all items from cart?</span>
                  <button
                    onClick={handleConfirmClearCart}
                    disabled={actionLoading}
                    className="btn btn-danger btn-sm"
                  >
                    Yes, Clear
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  disabled={actionLoading}
                  className="btn btn-outline"
                  style={{ color: 'var(--danger)', borderColor: 'var(--border)', fontSize: '0.85rem' }}
                >
                  🗑️ Clear Cart
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  Order Summary
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="text-muted">Total Items</span>
                  <span style={{ fontWeight: '600' }}>
                    {items.reduce((sum, i) => sum + (i.quantity || 0), 0)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1.25rem 0', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontWeight: '700', fontSize: '1.25rem' }}>
                  <span>Cart Total</span>
                  <span style={{ color: 'var(--primary)' }}>₹{Number(cartTotal).toLocaleString('en-IN')}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  disabled={items.length === 0}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  Proceed to Checkout →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
