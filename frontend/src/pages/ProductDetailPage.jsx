import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartSuccessNotice, setCartSuccessNotice] = useState(null);
  const [cartErrorNotice, setCartErrorNotice] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setCartSuccessNotice(null);
        setCartErrorNotice(null);
        const res = await api.get(`/products/${id}`);
        if (res.data && res.data.product) {
          setProduct(res.data.product);
          // Default quantity is 1 if stock > 0, otherwise 0
          setQuantity(res.data.product.stock > 0 ? 1 : 0);
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (err.response && err.response.status === 404) {
          setError('Product not found.');
        } else {
          setError('Unable to load product details.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setQuantity(1);
      return;
    }
    if (!product) return;

    if (val < 1) {
      setQuantity(1);
    } else if (val > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(val);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setCartSuccessNotice(null);
    setCartErrorNotice(null);

    // 1. Require Authentication: If logged out, redirect to /login
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!product || product.stock === 0) return;

    if (quantity < 1 || quantity > product.stock) {
      setCartErrorNotice(`Please select a valid quantity between 1 and ${product.stock}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await addToCart(product._id, quantity);
      setIsSubmitting(false);

      if (res.success) {
        setCartSuccessNotice(`Added ${quantity} item(s) to your cart!`);
      } else {
        setCartErrorNotice(res.message || 'Failed to add item to cart.');
      }
    } catch (err) {
      setIsSubmitting(false);
      const msg = err.response?.data?.message || 'An error occurred while updating your cart.';
      setCartErrorNotice(msg);
    }
  };

  // Image fallback SVG
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400" fill="%23f1f5f9"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%2364748b">${encodeURIComponent(product?.name || 'Product Image')}</text></svg>`;

  return (
    <div>
      <Link to="/products" className="btn btn-outline" style={{ marginBottom: '1.5rem' }}>
        ← Back to Products
      </Link>

      {/* Loading State */}
      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <h3>Loading product...</h3>
          <p>Fetching product details from server.</p>
        </div>
      )}

      {/* Error State */}
      {!loading && (error || !product) && (
        <div className="state-container alert-danger">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
          <h3>Product not found.</h3>
          <p style={{ margin: '0.5rem 0 1.5rem' }}>
            {error || 'The product you are looking for does not exist or has been removed.'}
          </p>
          <Link to="/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      )}

      {/* Product Details Display */}
      {!loading && !error && product && (
        <div className="card">
          <div className="card-body product-detail-grid">
            {/* Product Image */}
            <div className="product-detail-image-box">
              <img
                src={imageError || !product.image ? fallbackSvg : product.image}
                alt={product.name}
                className="product-detail-image"
                onError={() => setImageError(true)}
              />
            </div>

            {/* Product Info */}
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
                {product.category}
              </span>
              <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>{product.name}</h1>

              {/* Rating & Reviews */}
              <div
                className="product-rating"
                style={{ marginBottom: '1rem', fontSize: '1rem' }}
                aria-label={`Rating: ${product.rating || 0} out of 5 stars with ${product.numReviews || 0} reviews`}
              >
                <span className="stars-icon">★</span>
                <span className="rating-value" style={{ fontSize: '1rem' }}>
                  {Number(product.rating || 0).toFixed(1)}
                </span>
                <span className="reviews-count" style={{ fontSize: '0.95rem' }}>
                  ({product.numReviews || 0} {product.numReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              {/* Price */}
              <h2 style={{ color: 'var(--primary)', marginBottom: '1.25rem', fontSize: '2rem' }}>
                ₹{Number(product.price).toLocaleString('en-IN')}
              </h2>

              {/* Description */}
              <p style={{ marginBottom: '1.5rem', color: '#475569', lineHeight: '1.7' }}>
                {product.description}
              </p>

              {/* Stock Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                {product.stock > 0 ? (
                  <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="badge badge-danger" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Add-To-Cart Success Notification */}
              {cartSuccessNotice && (
                <div className="alert-box alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✅ {cartSuccessNotice}</span>
                  <Link to="/cart" className="btn btn-sm btn-primary" style={{ marginLeft: '1rem' }}>
                    Go to Cart →
                  </Link>
                </div>
              )}

              {/* Add-To-Cart Error Notification */}
              {cartErrorNotice && (
                <div className="alert-box alert-danger">
                  <span>⚠️ {cartErrorNotice}</span>
                  <button
                    onClick={() => setCartErrorNotice(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Quantity & Add to Cart Form */}
              <form onSubmit={handleAddToCart} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                <div>
                  <label htmlFor="quantity-input" className="sr-only" style={{ display: 'none' }}>
                    Quantity
                  </label>
                  <input
                    id="quantity-input"
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min={product.stock > 0 ? 1 : 0}
                    max={product.stock}
                    disabled={product.stock === 0 || isSubmitting}
                    className="form-control"
                    aria-label="Quantity"
                    style={{ width: '90px', padding: '0.65rem' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={product.stock === 0 || isSubmitting}
                  style={{ opacity: product.stock === 0 || isSubmitting ? 0.6 : 1 }}
                >
                  🛒 {isSubmitting ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
