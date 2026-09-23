import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);

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
      </div>

      <div className="card-body product-card-body">
        <h3 className="product-title" title={name}>
          {name}
        </h3>

        <div className="product-rating" aria-label={`Rating: ${rating} out of 5 stars with ${numReviews} reviews`}>
          <span className="stars-icon">★</span>
          <span className="rating-value">{Number(rating).toFixed(1)}</span>
          <span className="reviews-count">({numReviews} {numReviews === 1 ? 'review' : 'reviews'})</span>
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
          <Link to={`/products/${_id}`} className="btn btn-outline btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
