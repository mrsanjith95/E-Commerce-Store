import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const renderStars = (num) => {
  const rounded = Math.min(5, Math.max(0, Math.round(num)));
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
};

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/reviews');
      if (res.data && Array.isArray(res.data.reviews)) {
        setReviews(res.data.reviews);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
      if (err.response && err.response.status === 403) {
        setError('Not authorized. Admin role required.');
      } else {
        setError('Unable to load customer reviews.');
      }
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
        const res = await api.get('/reviews');
        if (isMounted) {
          if (res.data && Array.isArray(res.data.reviews)) {
            setReviews(res.data.reviews);
          } else {
            setReviews([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching admin reviews:', err);
          if (err.response && err.response.status === 403) {
            setError('Not authorized. Admin role required.');
          } else {
            setError('Unable to load customer reviews.');
          }
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

  const handleDeleteReview = async (reviewId) => {
    try {
      setDeletingId(reviewId);
      setActionError(null);
      setActionSuccess(null);
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.data && res.data.success) {
        setActionSuccess('Review deleted successfully.');
        await fetchReviews();
      } else {
        setActionError(res.data?.message || 'Failed to delete review.');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      setActionError(err.response?.data?.message || 'Unable to delete review.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Review Moderation</h1>
          <p className="text-muted">Monitor and delete customer reviews across all products.</p>
        </div>
        <Link to="/admin" className="btn btn-outline" style={{ width: 'auto' }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="alert-box alert-success">
          <span>✅ {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {actionError && (
        <div className="alert-box alert-danger">
          <span>⚠️ {actionError}</span>
          <button onClick={() => setActionError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <h3>Loading customer reviews...</h3>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="state-container alert-danger">
          <h3>Unable to load reviews</h3>
          <p style={{ margin: '0.5rem 0 1rem' }}>{error}</p>
          <button onClick={fetchReviews} className="btn btn-danger" style={{ width: 'auto' }}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && reviews.length === 0 && (
        <div className="state-container">
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>💬</div>
          <h3>No reviews found</h3>
          <p>Product reviews submitted by customers will appear here.</p>
        </div>
      )}

      {/* Reviews Table */}
      {!loading && !error && reviews.length > 0 && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => {
                const product = rev.product || {};
                const user = rev.user || {};
                const formattedDate = rev.createdAt
                  ? new Date(rev.createdAt).toLocaleDateString('en-IN')
                  : 'N/A';

                return (
                  <tr key={rev._id}>
                    {/* Product */}
                    <td>
                      <Link to={`/products/${product._id}`} style={{ fontWeight: '600', color: 'var(--primary)' }}>
                        {product.name || 'Unknown Product'}
                      </Link>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {product.category}
                      </div>
                    </td>

                    {/* Reviewer */}
                    <td>
                      <strong>{rev.name || user.name || 'Anonymous'}</strong>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {user.email || ''}
                      </div>
                    </td>

                    {/* Rating */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#f59e0b', fontSize: '0.95rem' }}>
                        {renderStars(rev.rating)}
                      </span>{' '}
                      <strong>({rev.rating})</strong>
                    </td>

                    {/* Comment */}
                    <td style={{ maxWidth: '300px', fontSize: '0.9rem' }}>
                      <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        "{rev.comment}"
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                      {formattedDate}
                    </td>

                    {/* Action */}
                    <td>
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        disabled={deletingId === rev._id}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
                      >
                        {deletingId === rev._id ? 'Deleting...' : 'Delete'}
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

export default AdminReviewsPage;
