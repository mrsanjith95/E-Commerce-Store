import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminDashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
      ]);

      if (productsRes.data && Array.isArray(productsRes.data.products)) {
        setProducts(productsRes.data.products);
      } else {
        setProducts([]);
      }

      if (ordersRes.data && Array.isArray(ordersRes.data.orders)) {
        setOrders(ordersRes.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard metrics:', err);
      setError('Unable to load admin dashboard statistics. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Client-side statistics calculations from API responses
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending').length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>👑 Admin Dashboard</h1>
          <p className="text-muted">Overview of store sales, product inventory, and customer orders.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/admin/products" className="btn btn-outline">
            📦 Manage Products
          </Link>
          <Link to="/admin/orders" className="btn btn-primary">
            🚚 Manage Orders
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <h3>Loading dashboard metrics...</h3>
          <p>Retrieving product and order statistics from server.</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="state-container alert-danger">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
          <h3>Unable to load dashboard data</h3>
          <p style={{ margin: '0.5rem 0 1rem' }}>{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-danger">
            🔄 Retry
          </button>
        </div>
      )}

      {/* Summary Cards Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-4" style={{ marginBottom: '2.5rem' }}>
            <div className="card card-body">
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Total Products</p>
              <h2 style={{ margin: '0.25rem 0', fontSize: '2.2rem' }}>{totalProducts}</h2>
              <span className="badge badge-primary">{products.reduce((acc, p) => acc + (p.stock || 0), 0)} Total Stock Units</span>
            </div>

            <div className="card card-body">
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Total Orders</p>
              <h2 style={{ margin: '0.25rem 0', fontSize: '2.2rem' }}>{totalOrders}</h2>
              <span className="badge badge-info">{orders.length} Placed Orders</span>
            </div>

            <div className="card card-body">
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Pending Orders</p>
              <h2 style={{ color: 'var(--warning)', margin: '0.25rem 0', fontSize: '2.2rem' }}>{pendingOrders}</h2>
              <span className="badge badge-warning">Requires Fulfillment</span>
            </div>

            <div className="card card-body">
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Delivered Orders</p>
              <h2 style={{ color: 'var(--success)', margin: '0.25rem 0', fontSize: '2.2rem' }}>{deliveredOrders}</h2>
              <span className="badge badge-success">{totalRevenue > 0 ? `₹${totalRevenue.toLocaleString('en-IN')}` : 'Fulfilled'}</span>
            </div>
          </div>

          {/* Quick Action Navigation Cards */}
          <div className="grid grid-2">
            <div className="card card-body">
              <h3>📦 Product Management</h3>
              <p className="text-muted" style={{ margin: '0.5rem 0 1.25rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Add new products to the catalog, update prices, adjust stock levels, or remove discontinued inventory items.
              </p>
              <Link to="/admin/products" className="btn btn-outline">
                Go to Product Catalog →
              </Link>
            </div>

            <div className="card card-body">
              <h3>🚚 Order Fulfillment</h3>
              <p className="text-muted" style={{ margin: '0.5rem 0 1.25rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                View customer orders, update order status (Pending, Processing, Shipped, Delivered, Cancelled), and view customer details.
              </p>
              <Link to="/admin/orders" className="btn btn-primary">
                Go to Orders List →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
