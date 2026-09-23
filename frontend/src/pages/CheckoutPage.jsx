import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, loading: cartLoading, fetchCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Form Fields State
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // UI State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Redirect if user is not authenticated
  if (!user) {
    navigate('/login', { state: { from: location.pathname } });
    return null;
  }

  const items = cart?.items || [];

  // Calculate estimated summary values for user preview
  const estimatedItemsPrice = items.reduce(
    (sum, item) => sum + (item.subtotal || (item.product?.price || 0) * (item.quantity || 1)),
    0
  );
  const estimatedShippingPrice = estimatedItemsPrice >= 5000 ? 0 : 100;
  const estimatedTaxPrice = Number((estimatedItemsPrice * 0.18).toFixed(2));
  const estimatedTotalPrice = Number((estimatedItemsPrice + estimatedShippingPrice + estimatedTaxPrice).toFixed(2));

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!address.trim()) newErrors.address = 'Street address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate form fields
    if (!validateForm()) {
      return;
    }

    if (items.length === 0) {
      setSubmitError('Your cart is empty. Please add products before checking out.');
      return;
    }

    // Prepare authoritative order payload (containing only shippingAddress and paymentMethod)
    const orderPayload = {
      shippingAddress: {
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      },
      paymentMethod,
    };

    try {
      setIsSubmitting(true);
      const res = await api.post('/orders', orderPayload);
      setIsSubmitting(false);

      if (res.data && res.data.success && res.data.order) {
        // Synchronize CartContext so cart becomes empty
        await fetchCart();
        // Redirect to newly created order page
        navigate(`/orders/${res.data.order._id}`);
      } else {
        setSubmitError(res.data?.message || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error('Error placing order:', err);
      const msg = err.response?.data?.message;

      if (msg && (msg.toLowerCase().includes('stock') || msg.toLowerCase().includes('empty'))) {
        setSubmitError('Some items are no longer available in the requested quantity. Please review your cart.');
        await fetchCart();
      } else {
        setSubmitError(msg || 'Unable to place your order. Please check your address and try again.');
      }
    }
  };

  // Image fallback helper
  const getFallbackSvg = (name) =>
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="%23f1f5f9"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%2364748b">${encodeURIComponent(name || 'Item')}</text></svg>`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Checkout</h1>
          <p className="text-muted">Enter your shipping details and select a payment method.</p>
        </div>
        <Link to="/cart" className="btn btn-outline">
          ← Return to Cart
        </Link>
      </div>

      {/* Loading Cart State */}
      {cartLoading && (
        <div className="state-container">
          <div className="spinner"></div>
          <h3>Loading checkout details...</h3>
        </div>
      )}

      {/* Empty Cart State */}
      {!cartLoading && items.length === 0 && (
        <div className="state-container">
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🛒</div>
          <h3>Your cart is empty.</h3>
          <p style={{ marginBottom: '1.5rem' }}>You need items in your cart to proceed with checkout.</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Main Checkout View */}
      {!cartLoading && items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Form Side */}
          <div className="card card-body">
            <h3 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              1. Shipping Address
            </h3>

            {/* Error Notification */}
            {submitError && (
              <div className="alert-box alert-danger">
                <span>⚠️ {submitError}</span>
                <button
                  onClick={() => setSubmitError(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handlePlaceOrder}>
              {/* Street Address */}
              <div className="form-group">
                <label className="form-label" htmlFor="checkout-address">
                  Street Address <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  className="form-control"
                  placeholder="e.g. 123 MG Road"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.address && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.address}
                  </span>
                )}
              </div>

              {/* City & State */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-city">
                    City <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Mangaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.city && (
                    <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.city}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-state">
                    State <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="checkout-state"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Karnataka"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.state && (
                    <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.state}
                    </span>
                  )}
                </div>
              </div>

              {/* Postal Code & Country */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-postal">
                    Postal Code <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="checkout-postal"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 575001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.postalCode && (
                    <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.postalCode}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="checkout-country">
                    Country <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="checkout-country"
                    type="text"
                    className="form-control"
                    placeholder="e.g. India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.country && (
                    <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.country}
                    </span>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <h3 style={{ margin: '1.5rem 0 1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                2. Payment Method
              </h3>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontWeight: '500' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={isSubmitting}
                  />
                  💵 Cash on Delivery (COD)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontWeight: '500' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={isSubmitting}
                  />
                  💳 Card Payment (Simulated)
                </label>
              </div>

              {/* Informational note for CARD method */}
              {paymentMethod === 'CARD' && (
                <div className="alert-box alert-info" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                  ℹ️ Card payment integration will be added later. Payment status will remain Pending. No card details are collected.
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Items & Estimated Summary Sidebar */}
          <div className="card card-body">
            <h3 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              Order Review
            </h3>

            {/* Item List */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {items.map((item, index) => {
                const product = item.product || {};
                const itemSubtotal = item.subtotal || (product.price || 0) * (item.quantity || 1);
                return (
                  <div
                    key={product._id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <img
                      src={product.image || getFallbackSvg(product.name)}
                      alt={product.name || 'Product'}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      onError={(e) => {
                        e.target.src = getFallbackSvg(product.name);
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.95rem' }}>{product.name || 'Product'}</h4>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                        Qty: {item.quantity} × ₹{Number(product.price || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <strong style={{ fontSize: '0.95rem' }}>₹{Number(itemSubtotal).toLocaleString('en-IN')}</strong>
                  </div>
                );
              })}
            </div>

            {/* Estimated Price Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-muted">Items Subtotal</span>
              <span>₹{Number(estimatedItemsPrice).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-muted">Shipping</span>
              <span>{estimatedShippingPrice === 0 ? 'FREE' : `₹${estimatedShippingPrice}`}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-muted">GST Tax (18%)</span>
              <span>₹{Number(estimatedTaxPrice).toLocaleString('en-IN')}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justify: 'space-between',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border)',
                fontSize: '1.2rem',
                fontWeight: '700',
              }}
            >
              <span>Estimated Total</span>
              <span style={{ color: 'var(--primary)' }}>₹{Number(estimatedTotalPrice).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
