import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          🛍️ ElectroStore
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          className="navbar-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <ul className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li>
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/products"
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Products
            </NavLink>
          </li>

          {user ? (
            <>
              <li>
                <NavLink
                  to="/cart"
                  onClick={closeMenu}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  Cart <span className="cart-badge">{itemCount}</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/orders"
                  onClick={closeMenu}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  My Orders
                </NavLink>
              </li>
              {isAdmin && (
                <li>
                  <NavLink
                    to="/admin"
                    onClick={closeMenu}
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Admin Dashboard
                  </NavLink>
                </li>
              )}
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">
                  {user.role === 'admin' ? `👑 ${user.name}` : `👤 ${user.name}`}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink
                  to="/cart"
                  onClick={closeMenu}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  Cart <span className="cart-badge">{itemCount}</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  Login
                </NavLink>
              </li>
              <li>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.9rem' }}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
