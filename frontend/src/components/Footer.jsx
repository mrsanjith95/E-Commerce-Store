import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div>
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>🛍️ ElectroStore</h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            Your one-stop destination for premium electronics, gadgets, and audio gear. Built with the MERN stack.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: '1rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <li><Link to="/" style={{ color: '#94a3b8' }}>Home</Link></li>
            <li><Link to="/products" style={{ color: '#94a3b8' }}>All Products</Link></li>
            <li><Link to="/cart" style={{ color: '#94a3b8' }}>Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: '1rem' }}>Account</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <li><Link to="/login" style={{ color: '#94a3b8' }}>Login</Link></li>
            <li><Link to="/register" style={{ color: '#94a3b8' }}>Register</Link></li>
            <li><Link to="/orders" style={{ color: '#94a3b8' }}>My Orders</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: '1rem' }}>Backend Status</h4>
          <p style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: '600' }}>
            🟢 Express API: http://localhost:5000/api
          </p>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            MongoDB Atlas Connected
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 ElectroStore. MERN E-Commerce Store Portfolio Project.</p>
      </div>
    </footer>
  );
};

export default Footer;
