import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const renderStars = (num) => {
  const rounded = Math.min(5, Math.max(0, Math.round(num)));
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
};

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  if (!product) return null;

  const {
    _id,
    name,
    category,
    price,
    rating = 0,
    numReviews = 0,
    stock = 0,
    image,
  } = product;

  const inWishlist = isInWishlist(_id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (inWishlist) {
      await removeFromWishlist(_id);
    } else {
      await addToWishlist(_id);
    }
  };

  // Placeholder svg image fallback if image is missing or fails to load
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" fill="%23f1f5f9"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%2364748b">${encodeURIComponent(name || 'Product Image')}</text></svg>`;

  return (
    <div className="card product-card">
      <div className="product-image-container">
        <img
          src={imageError || !image ? fallbackSvg : image}
          alt={name || 'Product Image'}
          className="product-image"
          onError={() => setImageError(true)}
        />
        <span className="badge badge-primary product-category-badge">{category}</span>

        {/* Wishlist Button Overlay */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            zIndex: 3,
            border: 'none',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.1rem',
            color: inWishlist ? '#ef4444' : '#64748b',
            boxShadow: 'var(--shadow-xs)',
            transition: 'var(--transition)',
          }}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {inWishlist ? '♥' : '♡'}
        </button>
      </div>

      <div className="card-body product-card-body">
        <h3 className="product-title" title={name}>
          {name}
        </h3>

        <div className="product-rating" aria-label={numReviews > 0 ? `Rating: ${rating} out of 5 stars with ${numReviews} reviews` : 'No reviews yet'}>
          {numReviews > 0 ? (
            <>
              <span className="stars-icon" style={{ color: '#f59e0b' }}>{renderStars(rating)}</span>
              <span className="rating-value">{Number(rating).toFixed(1)}</span>
              <span className="reviews-count">({numReviews})</span>
            </>
          ) : (
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>No reviews yet</span>
          )}
        </div>

        <div className="product-stock-status">
          {stock > 0 ? (
            <span className="badge badge-success">In Stock ({stock} left)</span>
          ) : (
            <span className="badge badge-danger">Out of Stock</span>
          )}
        </div>

        <div className="product-card-footer">
          <div className="product-price">₹{Number(price).toLocaleString('en-IN')}</div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link to={`/products/${_id}`} className="btn btn-outline btn-sm">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;


