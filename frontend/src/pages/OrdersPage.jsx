import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/orders/my-orders');
      if (res.data && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching my orders:', err);
      setError('Unable to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadOrders = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/orders/my-orders');
        if (isMounted) {
          if (res.data && Array.isArray(res.data.orders)) {
            setOrders(res.data.orders);
          } else {
            setOrders([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching my orders:', err);
          setError('Unable to load your orders. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Orders</h1>
          <p className="text-muted">Track and review your complete order history.</p>
        </div>
        <Link to="/products" className="btn btn-outline" style={{ width: 'auto' }}>
          Browse Products
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <h3>Loading your orders...</h3>
          <p>Please wait while we retrieve your order history.</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="state-container alert-danger">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
          <h3>Unable to load your orders</h3>
          <p style={{ margin: '0.5rem 0 1rem' }}>{error}</p>
          <button onClick={fetchOrders} className="btn btn-danger" style={{ width: 'auto' }}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Empty Orders State */}
      {!loading && !error && orders.length === 0 && (
        <div className="state-container">
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>📦</div>
          <h3>You haven't placed any orders yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>Explore our catalog and make your first purchase!</p>
          <Link to="/products" className="btn btn-primary" style={{ width: 'auto' }}>
            Start Shopping
          </Link>
        </div>
      )}

      {/* Orders List / Table */}
      {!loading && !error && orders.length > 0 && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const totalUnits = (order.orderItems || []).reduce(
                  (sum, item) => sum + (Number(item.quantity) || 0),
                  0
                );

                const formattedDate = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A';

                const shortId = order._id ? `#${order._id.substring(0, 10)}...` : '#N/A';

                return (
                  <tr key={order._id}>
                    <td>
                      <code title={order._id}>{shortId}</code>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formattedDate}</td>
                    <td>
                      {totalUnits} {totalUnits === 1 ? 'item' : 'items'}
                    </td>
                    <td>
                      <span className="badge badge-secondary">
                        {order.paymentMethod === 'COD' ? '💵 COD' : order.paymentMethod === 'RAZORPAY' ? '💳 RAZORPAY' : order.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td>
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: '800', color: 'var(--secondary)' }}>
                      ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <Link
                        to={`/orders/${order._id}`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

