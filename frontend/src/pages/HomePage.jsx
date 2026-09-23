import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/products');
        if (res.data && Array.isArray(res.data.products)) {
          // Select first 4 products for featured section
          setFeaturedProducts(res.data.products.slice(0, 4));
        } else if (Array.isArray(res.data)) {
          setFeaturedProducts(res.data.slice(0, 4));
        } else {
          setFeaturedProducts([]);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Unable to load featured products.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero">
        <h1>Next-Gen Electronics & Audio</h1>
        <p>Discover high-performance wireless headphones, gadgets, and tech accessories engineered for superior performance.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--primary)' }}>
            Shop Now
          </Link>
          <Link to="/register" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
            Create Account
          </Link>
        </div>
      </section>

      {/* Value Propositions */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="grid grid-3">
          <div className="card card-body text-center">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚚</div>
            <h3>Free Fast Shipping</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>On all orders above ₹5000 with real-time status tracking.</p>
          </div>

          <div className="card card-body text-center">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
            <h3>Secure Payments</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Cash on Delivery (COD) and Card options supported.</p>
          </div>

          <div className="card card-body text-center">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚡</div>
            <h3>Verified Tech</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Curated premium electronics with guaranteed authentic warranty.</p>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="page-header">
          <div>
            <h2>Featured Products</h2>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Explore our top rated tech arrivals</p>
          </div>
          <Link to="/products" className="btn btn-outline">
            View All Products →
          </Link>
        </div>

        {loading && (
          <div className="state-container">
            <div className="spinner"></div>
            <p>Loading featured products...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-container alert-danger">
            <p>{error}</p>
            <Link to="/products" className="btn btn-outline" style={{ marginTop: '0.5rem' }}>
              Explore Products Catalog
            </Link>
          </div>
        )}

        {!loading && !error && featuredProducts.length === 0 && (
          <div className="state-container">
            <p>No featured products available at the moment.</p>
          </div>
        )}

        {!loading && !error && featuredProducts.length > 0 && (
          <div className="grid grid-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
