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
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsRes, ordersRes] = await Promise.all([
          api.get('/products'),
          api.get('/orders'),
        ]);

        if (isMounted) {
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
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching admin dashboard metrics:', err);
          setError('Unable to load admin dashboard statistics. Please check your credentials and try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  // Client-side statistics calculations from API responses
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending').length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>👑 Admin Dashboard</h1>
          <p className="text-muted">Overview of store sales, product inventory, and customer orders.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/products" className="btn btn-outline" style={{ width: 'auto' }}>
            📦 Manage Products
          </Link>
          <Link to="/admin/orders" className="btn btn-outline" style={{ width: 'auto' }}>
            🚚 Manage Orders
          </Link>
          <Link to="/admin/reviews" className="btn btn-primary" style={{ width: 'auto' }}>
            💬 Manage Reviews
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
          <button onClick={fetchDashboardData} className="btn btn-danger" style={{ width: 'auto' }}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Summary Cards Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-4" style={{ marginBottom: '2.5rem' }}>
            <div className="card card-body" style={{ borderLeft: '4px solid var(--primary)' }}>
              <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: '600' }}>TOTAL PRODUCTS</p>
              <h2 style={{ margin: '0.35rem 0', fontSize: '2.25rem' }}>{totalProducts}</h2>
              <span className="badge badge-primary">{totalStockUnits} Total Stock Units</span>
            </div>

            <div className="card card-body" style={{ borderLeft: '4px solid var(--info)' }}>
              <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: '600' }}>TOTAL ORDERS</p>
              <h2 style={{ margin: '0.35rem 0', fontSize: '2.25rem' }}>{totalOrders}</h2>
              <span className="badge badge-info">{orders.length} Customer Orders</span>
            </div>

            <div className="card card-body" style={{ borderLeft: '4px solid var(--warning)' }}>
              <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: '600' }}>PENDING ORDERS</p>
              <h2 style={{ color: 'var(--warning)', margin: '0.35rem 0', fontSize: '2.25rem' }}>{pendingOrders}</h2>
              <span className="badge badge-warning">Requires Fulfillment</span>
            </div>

            <div className="card card-body" style={{ borderLeft: '4px solid var(--success)' }}>
              <p className="text-muted" style={{ fontSize: '0.85rem', fontWeight: '600' }}>DELIVERED ORDERS</p>
              <h2 style={{ color: 'var(--success)', margin: '0.35rem 0', fontSize: '2.25rem' }}>{deliveredOrders}</h2>
              <span className="badge badge-success">{totalRevenue > 0 ? `₹${totalRevenue.toLocaleString('en-IN')} Revenue` : 'Fulfilled'}</span>
            </div>
          </div>

          {/* Quick Action Navigation Cards */}
          <div className="grid grid-3">
            <div className="card card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>📦</span>
                <h3>Product Catalog</h3>
              </div>
              <p className="text-muted" style={{ margin: '0.5rem 0 1.5rem', fontSize: '0.925rem', lineHeight: '1.6' }}>
                Add new items, modify price points, set inventory stock levels, or remove obsolete products.
              </p>
              <Link to="/admin/products" className="btn btn-outline" style={{ width: 'auto' }}>
                Manage Products →
              </Link>
            </div>

            <div className="card card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>🚚</span>
                <h3>Order Fulfillment</h3>
              </div>
              <p className="text-muted" style={{ margin: '0.5rem 0 1.5rem', fontSize: '0.925rem', lineHeight: '1.6' }}>
                Review customer purchases, change order statuses (Pending, Processing, Shipped, Delivered), and inspect details.
              </p>
              <Link to="/admin/orders" className="btn btn-outline" style={{ width: 'auto' }}>
                Manage Orders →
              </Link>
            </div>

            <div className="card card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>💬</span>
                <h3>Review Moderation</h3>
              </div>
              <p className="text-muted" style={{ margin: '0.5rem 0 1.5rem', fontSize: '0.925rem', lineHeight: '1.6' }}>
                Monitor customer product reviews and ratings across the store and delete inappropriate reviews.
              </p>
              <Link to="/admin/reviews" className="btn btn-primary" style={{ width: 'auto' }}>
                Manage Reviews →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;

