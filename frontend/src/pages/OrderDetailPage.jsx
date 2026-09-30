import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const OrderStatusBadge = ({ status }) => {
  let badgeClass = 'badge-secondary';
  switch (status) {
    case 'Pending':
      badgeClass = 'badge-warning';
      break;
    case 'Processing':
    case 'Shipped':
      badgeClass = 'badge-primary';
      break;
    case 'Delivered':
      badgeClass = 'badge-success';
      break;
    case 'Cancelled':
      badgeClass = 'badge-danger';
      break;
    default:
      badgeClass = 'badge-secondary';
  }
  return <span className={`badge ${badgeClass}`}>{status || 'Pending'}</span>;
};

const PaymentStatusBadge = ({ status }) => {
  let badgeClass = 'badge-secondary';
  switch (status) {
    case 'Pending':
      badgeClass = 'badge-warning';
      break;
    case 'Paid':
      badgeClass = 'badge-success';
      break;
    case 'Failed':
      badgeClass = 'badge-danger';
      break;
    default:
      badgeClass = 'badge-secondary';
  }
  return <span className={`badge ${badgeClass}`}>{status || 'Pending'}</span>;
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/orders/${id}`);
        if (res.data && res.data.order) {
          setOrder(res.data.order);
        } else {
          setError('Order details not found.');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        if (err.response && err.response.status === 403) {
          setError('Not authorized to view this order.');
        } else if (err.response && err.response.status === 404) {
          setError('Order not found.');
        } else {
          setError('Unable to load order details.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  // Image fallback SVG
  const getFallbackSvg = (name) =>
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="%23f1f5f9"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%2364748b">${encodeURIComponent(name || 'Item')}</text></svg>`;

  return (
    <div>
      <Link to="/" className="btn btn-outline" style={{ marginBottom: '1.5rem' }}>
        ← Back to Home
      </Link>

      {/* Loading State */}
      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <h3>Loading order details...</h3>
          <p>Retrieving your order invoice and status.</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="state-container alert-danger">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
          <h3>{error}</h3>
          <p style={{ margin: '0.5rem 0 1.5rem' }}>
            {error.includes('authorized')
              ? 'You do not have permission to access this order invoice.'
              : 'The requested order could not be located.'}
          </p>
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      )}

      {/* Order Details Content */}
      {!loading && !error && order && (
        <div>
          {/* Header */}
          <div className="page-header">
            <div>
              <h1>Order #{order._id}</h1>
              <p className="text-muted">
                Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>Order Status:</span>
              <OrderStatusBadge status={order.orderStatus} />
            </div>
          </div>

          {/* Grid Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Shipping & Payment Card */}
            <div className="card card-body">
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                Shipping Address
              </h3>
              <p style={{ color: '#475569', lineHeight: '1.6' }}>
                <strong>{order.user?.name || 'Customer'}</strong><br />
                {order.shippingAddress?.address}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}<br />
                {order.shippingAddress?.country}
              </p>

              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', margin: '1.75rem 0 1rem' }}>
                Payment Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#475569' }}>
                <div>
                  <strong>Payment Method:</strong>{' '}
                  {order.paymentMethod === 'COD'
                    ? 'Cash on Delivery (COD)'
                    : order.paymentMethod === 'RAZORPAY'
                    ? 'Razorpay (Online Payment)'
                    : order.paymentMethod}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong>Payment Status:</strong>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
                {order.paymentStatus === 'Paid' && order.paidAt && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Paid on {new Date(order.paidAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Payment ID: <code>{order.razorpayPaymentId}</code>
                  </div>
                )}
              </div>

              {/* Delivery Info */}
              {order.orderStatus === 'Delivered' && order.deliveredAt && (
                <div style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: '#d1fae5', borderRadius: 'var(--radius-sm)', color: '#065f46' }}>
                  🎉 Delivered on {new Date(order.deliveredAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              )}
            </div>

            {/* Order Items & Financial Summary Card */}
            <div className="card card-body">
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                Order Items
              </h3>

              {/* Items List */}
              <div style={{ marginBottom: '1.5rem' }}>
                {(order.orderItems || []).map((item, idx) => (
                  <div
                    key={item.product || idx}
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
                      src={item.image || getFallbackSvg(item.name)}
                      alt={item.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      onError={(e) => {
                        e.target.src = getFallbackSvg(item.name);
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.95rem' }}>{item.name}</h4>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <strong style={{ fontSize: '0.95rem' }}>₹{Number(item.subtotal).toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>

              {/* Authoritative Financial Totals (Returned by Backend API) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted">Items Subtotal:</span>
                <span>₹{Number(order.itemsPrice).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted">Shipping:</span>
                <span>{order.shippingPrice === 0 ? 'FREE' : `₹${Number(order.shippingPrice).toLocaleString('en-IN')}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted">Tax (18% GST):</span>
                <span>₹{Number(order.taxPrice).toLocaleString('en-IN')}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border)',
                  fontWeight: '700',
                  fontSize: '1.2rem',
                }}
              >
                <span>Total Amount:</span>
                <span style={{ color: 'var(--primary)' }}>₹{Number(order.totalPrice).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
