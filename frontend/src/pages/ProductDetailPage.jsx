import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const renderStars = (num) => {
  const rounded = Math.min(5, Math.max(0, Math.round(num)));
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist: addWishlist, removeFromWishlist: removeWishlist } = useWishlist();
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

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const inWishlist = product ? isInWishlist(product._id) : false;

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (inWishlist) {
      await removeWishlist(product._id);
    } else {
      await addWishlist(product._id);
    }
  };

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/products/${id}`);
      if (res.data && res.data.product) {
        setProduct(res.data.product);
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
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const res = await api.get(`/products/${id}/reviews`);
      if (res.data && Array.isArray(res.data.reviews)) {
        setReviews(res.data.reviews);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (id) {
        await fetchProductDetails();
        if (isMounted) {
          await fetchReviews();
        }
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id, fetchProductDetails, fetchReviews]);

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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSuccess(null);
    setReviewError(null);

    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!newComment.trim()) {
      setReviewError('Please enter a review comment.');
      return;
    }

    const ratingVal = Number(newRating);
    if (!Number.isInteger(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      setReviewError('Rating must be an integer between 1 and 5.');
      return;
    }

    try {
      setReviewSubmitting(true);
      const res = await api.post(`/products/${id}/reviews`, {
        rating: ratingVal,
        comment: newComment.trim(),
      });
      setReviewSubmitting(false);

      if (res.data && res.data.success) {
        setReviewSuccess('Thank you! Your review has been submitted.');
        setNewComment('');
        setNewRating(5);
        // Refresh reviews & product info to update total rating and count
        await fetchReviews();
        await fetchProductDetails();
      } else {
        setReviewError(res.data?.message || 'Failed to submit review.');
      }
    } catch (err) {
      setReviewSubmitting(false);
      console.error('Error submitting review:', err);
      setReviewError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      setDeletingReviewId(reviewId);
      setReviewError(null);
      setReviewSuccess(null);
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.data && res.data.success) {
        setReviewSuccess('Review deleted successfully.');
        await fetchReviews();
        await fetchProductDetails();
      } else {
        setReviewError(res.data?.message || 'Failed to delete review.');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      setReviewError(err.response?.data?.message || 'Failed to delete review.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  // Check if current logged-in user has already submitted a review
  const userHasReviewed = user && reviews.some((r) => {
    const revUserId = typeof r.user === 'object' ? r.user?._id : r.user;
    return revUserId && revUserId.toString() === user._id.toString();
  });

  // Image fallback SVG
  const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400" fill="%23f1f5f9"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%2364748b">${encodeURIComponent(product?.name || 'Product Image')}</text></svg>`;

  return (
    <div>
      <Link to="/products" className="btn btn-outline" style={{ marginBottom: '1.5rem', width: 'auto' }}>
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
          <h3>Product not found</h3>
          <p style={{ margin: '0.5rem 0 1.5rem' }}>
            {error || 'The product you are looking for does not exist or has been removed.'}
          </p>
          <Link to="/products" className="btn btn-primary" style={{ width: 'auto' }}>
            Back to Products
          </Link>
        </div>
      )}

      {/* Product Details Display */}
      {!loading && !error && product && (
        <>
          <div className="card" style={{ marginBottom: '2.5rem' }}>
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
                  <span className="stars-icon" style={{ color: '#f59e0b', fontSize: '1.1rem' }}>
                    {renderStars(product.rating || 0)}
                  </span>
                  <span className="rating-value" style={{ fontSize: '1.05rem' }}>
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
                    <Link to="/cart" className="btn btn-sm btn-primary" style={{ marginLeft: '1rem', width: 'auto' }}>
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

                {/* Quantity, Add to Cart & Wishlist Form */}
                <form onSubmit={handleAddToCart} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
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
                    style={{ opacity: product.stock === 0 || isSubmitting ? 0.6 : 1, width: 'auto' }}
                  >
                    🛒 {isSubmitting ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>

                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className="btn btn-outline"
                    style={{
                      width: 'auto',
                      color: inWishlist ? 'var(--danger)' : 'var(--text-main)',
                      borderColor: inWishlist ? 'var(--danger)' : 'var(--border)',
                    }}
                  >
                    {inWishlist ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="card">
            <div className="card-body">
              <h2 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                Customer Reviews & Ratings
              </h2>

              {/* Rating Summary Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', background: 'var(--surface-alt)', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary)', lineHeight: '1' }}>
                    {Number(product.rating || 0).toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>out of 5</div>
                </div>
                <div>
                  <div style={{ color: '#f59e0b', fontSize: '1.4rem', letterSpacing: '0.1em' }}>
                    {renderStars(product.rating || 0)}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '0.2rem' }}>
                    Based on {product.numReviews || 0} {product.numReviews === 1 ? 'review' : 'reviews'}
                  </div>
                </div>
              </div>

              {/* Notifications */}
              {reviewSuccess && (
                <div className="alert-box alert-success">
                  <span>✅ {reviewSuccess}</span>
                  <button onClick={() => setReviewSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                </div>
              )}
              {reviewError && (
                <div className="alert-box alert-danger">
                  <span>⚠️ {reviewError}</span>
                  <button onClick={() => setReviewError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                </div>
              )}

              {/* Review Submission Form / Login Prompt */}
              <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
                {user ? (
                  userHasReviewed ? (
                    <div className="alert-box alert-info" style={{ margin: 0 }}>
                      <span>ℹ️ You have already submitted a review for this product.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit}>
                      <h3 style={{ marginBottom: '1rem' }}>Write a Review</h3>

                      <div className="form-group">
                        <label className="form-label" htmlFor="review-rating-select">
                          Rating <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <select
                          id="review-rating-select"
                          className="form-control"
                          value={newRating}
                          onChange={(e) => setNewRating(Number(e.target.value))}
                          disabled={reviewSubmitting}
                          style={{ maxWidth: '200px' }}
                        >
                          <option value={5}>5 ★★★★★ (Excellent)</option>
                          <option value={4}>4 ★★★★☆ (Good)</option>
                          <option value={3}>3 ★★★☆☆ (Average)</option>
                          <option value={2}>2 ★★☆☆☆ (Fair)</option>
                          <option value={1}>1 ★☆☆☆☆ (Poor)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="review-comment-textarea">
                          Your Comment <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <textarea
                          id="review-comment-textarea"
                          className="form-control"
                          rows="4"
                          placeholder="Share details of your experience with this product..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          disabled={reviewSubmitting}
                          required
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={reviewSubmitting}
                        style={{ width: 'auto' }}
                      >
                        {reviewSubmitting ? 'Submitting Review...' : 'Submit Review'}
                      </button>
                    </form>
                  )
                ) : (
                  <div className="alert-box alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🔒 Please log in to your account to write a review.</span>
                    <button
                      onClick={() => navigate('/login', { state: { from: location.pathname } })}
                      className="btn btn-sm btn-primary"
                      style={{ width: 'auto', marginLeft: '1rem' }}
                    >
                      Login to Write a Review
                    </button>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div>
                <h3 style={{ marginBottom: '1.25rem' }}>User Reviews</h3>

                {reviewsLoading && (
                  <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div className="spinner" style={{ width: '30px', height: '30px' }}></div>
                    <p className="text-muted">Loading reviews...</p>
                  </div>
                )}

                {!reviewsLoading && reviews.length === 0 && (
                  <p className="text-muted" style={{ fontStyle: 'italic', padding: '1rem 0' }}>
                    No reviews yet. Be the first to review this product!
                  </p>
                )}

                {!reviewsLoading && reviews.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {reviews.map((rev) => {
                      const revUserId = typeof rev.user === 'object' ? rev.user?._id : rev.user;
                      const isOwner = user && revUserId && revUserId.toString() === user._id.toString();
                      const isAdmin = user && user.role === 'admin';
                      const formattedDate = rev.createdAt
                        ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '';

                      return (
                        <div
                          key={rev._id}
                          style={{
                            padding: '1.25rem',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--surface)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div>
                              <strong style={{ fontSize: '1rem', color: 'var(--secondary)' }}>
                                {rev.name || rev.user?.name || 'Anonymous User'}
                              </strong>
                              {isOwner && (
                                <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                                  You
                                </span>
                              )}
                              <div style={{ color: '#f59e0b', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                                {renderStars(rev.rating)}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span className="text-muted" style={{ fontSize: '0.825rem' }}>
                                {formattedDate}
                              </span>
                              {(isOwner || isAdmin) && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(rev._id)}
                                  disabled={deletingReviewId === rev._id}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                                >
                                  {deletingReviewId === rev._id ? 'Deleting...' : 'Delete'}
                                </button>
                              )}
                            </div>
                          </div>

                          <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', marginTop: '0.5rem', whiteSpace: 'pre-line' }}>
                            "{rev.comment}"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductDetailPage;
