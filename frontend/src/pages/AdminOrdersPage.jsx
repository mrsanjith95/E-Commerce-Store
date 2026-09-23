import React, { useState, useEffect } from 'react';
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

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Updating State
  const [updatingId, setUpdatingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Order Details Modal / Preview State
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/orders');
      if (res.data && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      if (err.response && err.response.status === 403) {
        setError('Not authorized. Admin role required.');
      } else {
        setError('Unable to load customer orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      setActionError(null);
      setActionSuccess(null);

      // PUT /api/orders/:id/status -> expects body { status: newStatus }
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });

      if (res.data && res.data.success) {
        setActionSuccess(`Order status updated to "${newStatus}"!`);
        await fetchOrders();
        // If modal preview is open for this order, update selectedOrder
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data.order);
        }
      } else {
        setActionError(res.data?.message || 'Failed to update order status.');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setActionError(err.response?.data?.message || 'Unable to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getFallbackSvg = (name) =>
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="%23f1f5f9"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%2364748b">${encodeURIComponent(name || 'Item')}</text></svg>`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Order Fulfillment</h1>
          <p className="text-muted">Monitor all customer orders and update shipment delivery statuses.</p>
        </div>
      </div>

      {/* Action Notifications */}
      {actionSuccess && (
        <div className="alert-box alert-success">
          <span>✅ {actionSuccess}</span>
          <button
            onClick={() => setActionSuccess(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div className="alert-box alert-danger">
          <span>⚠️ {actionError}</span>
          <button
            onClick={() => setActionError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Selected Order Detail Modal / Preview Card */}
      {selectedOrder && (
        <div className="card card-body" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>🔍 Order Details Preview (#{selectedOrder._id})</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="btn btn-outline btn-sm">
              ✕ Close Preview
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            {/* Customer & Shipping */}
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Customer & Shipping</h4>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
                <strong>Name:</strong> {selectedOrder.user?.name || 'Customer information unavailable'}<br />
                <strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}<br />
                <strong>Address:</strong> {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}, {selectedOrder.shippingAddress?.country}
              </p>
            </div>

            {/* Payment & Status */}
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Payment & Status</h4>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
                <strong>Payment Method:</strong> {selectedOrder.paymentMethod}<br />
                <strong>Payment Status:</strong> <PaymentStatusBadge status={selectedOrder.paymentStatus} /><br />
                <strong>Order Status:</strong> <OrderStatusBadge status={selectedOrder.orderStatus} />
              </p>
              {selectedOrder.orderStatus === 'Delivered' && selectedOrder.deliveredAt && (
                <div style={{ fontSize: '0.85rem', color: '#065f46', marginTop: '0.5rem', fontWeight: '600' }}>
                  🎉 Delivered on {new Date(selectedOrder.deliveredAt).toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {/* Order Items & Totals */}
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Order Items ({selectedOrder.orderItems?.length || 0})</h4>
              <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '0.75rem' }}>
                {(selectedOrder.orderItems || []).map((item, idx) => (
                  <div key={item.product || idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <img
                      src={item.image || getFallbackSvg(item.name)}
                      alt={item.name}
                      style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => { e.target.src = getFallbackSvg(item.name); }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong>{item.name}</strong> ({item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')})
                    </div>
                    <strong>₹{Number(item.subtotal).toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                <div>Items Subtotal: ₹{Number(selectedOrder.itemsPrice || 0).toLocaleString('en-IN')}</div>
                <div>Shipping: ₹{Number(selectedOrder.shippingPrice || 0).toLocaleString('en-IN')}</div>
                <div>GST (18%): ₹{Number(selectedOrder.taxPrice || 0).toLocaleString('en-IN')}</div>
                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--primary)', marginTop: '0.35rem' }}>
                  Total: ₹{Number(selectedOrder.totalPrice || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <h3>Loading orders list...</h3>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="state-container alert-danger">
          <h3>Unable to load orders</h3>
          <p style={{ margin: '0.5rem 0 1rem' }}>{error}</p>
          <button onClick={fetchOrders} className="btn btn-danger">
            🔄 Retry
          </button>
        </div>
      )}

      {/* Empty Orders State */}
      {!loading && !error && orders.length === 0 && (
        <div className="state-container">
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>📦</div>
          <h3>No orders found.</h3>
          <p>Customer orders will appear here once placed.</p>
        </div>
      )}

      {/* Orders Table */}
      {!loading && !error && orders.length > 0 && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const totalUnits = (order.orderItems || []).reduce(
                  (sum, item) => sum + (Number(item.quantity) || 0),
                  0
                );

                const shortId = order._id ? `#${order._id.substring(0, 10)}...` : '#N/A';

                return (
                  <tr key={order._id}>
                    {/* Order ID */}
                    <td>
                      <code title={order._id}>{shortId}</code>
                    </td>

                    {/* Customer */}
                    <td>
                      {order.user ? (
                        <div>
                          <strong>{order.user.name || 'Customer'}</strong>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {order.user.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                          Customer information unavailable
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                    </td>

                    {/* Items */}
                    <td>{totalUnits} units</td>

                    {/* Payment Method & Status */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                          {order.paymentMethod}
                        </span>
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>
                    </td>

                    {/* Order Status Select Control */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <select
                          className="form-control"
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                          style={{ width: '135px', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      {order.orderStatus === 'Delivered' && order.deliveredAt && (
                        <div style={{ fontSize: '0.7rem', color: '#065f46', marginTop: '0.2rem' }}>
                          Delivered: {new Date(order.deliveredAt).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </td>

                    {/* Total Amount */}
                    <td style={{ whiteSpace: 'nowrap', fontWeight: '700', color: 'var(--secondary)' }}>
                      ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Actions */}
                    <td>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
                      >
                        View Details
                      </button>
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

export default AdminOrdersPage;
