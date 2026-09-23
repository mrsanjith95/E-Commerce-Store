import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
    rating: 0,
    numReviews: 0,
  });

  // Action State
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/products');
      if (res.data && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
      if (err.response && err.response.status === 403) {
        setError('Not authorized. Admin access required.');
      } else {
        setError('Unable to load products. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      stock: '',
      rating: 0,
      numReviews: 0,
    });
    setFormErrors({});
    setActionError(null);
    setShowForm(true);
  };

  const handleOpenEditForm = (product) => {
    setIsEditing(true);
    setEditingId(product._id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price !== undefined ? product.price : '',
      category: product.category || '',
      image: product.image || '',
      stock: product.stock !== undefined ? product.stock : '',
      rating: product.rating !== undefined ? product.rating : 0,
      numReviews: product.numReviews !== undefined ? product.numReviews : 0,
    });
    setFormErrors({});
    setActionError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Product name must be at least 2 characters';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      errors.price = 'Price must be a number greater than or equal to 0';
    }
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }
    if (!formData.image.trim()) {
      errors.image = 'Product image URL is required';
    }
    if (formData.stock === '' || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      errors.stock = 'Stock must be a number greater than or equal to 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category.trim(),
      image: formData.image.trim(),
      stock: Number(formData.stock),
      rating: Number(formData.rating || 0),
      numReviews: Number(formData.numReviews || 0),
    };

    try {
      setIsSubmitting(true);
      if (isEditing) {
        // PUT /api/products/:id
        const res = await api.put(`/products/${editingId}`, payload);
        if (res.data && res.data.success) {
          setActionSuccess(`Product "${payload.name}" updated successfully!`);
          handleCloseForm();
          await fetchProducts();
        } else {
          setActionError(res.data?.message || 'Failed to update product.');
        }
      } else {
        // POST /api/products
        const res = await api.post('/products', payload);
        if (res.data && res.data.success) {
          setActionSuccess(`Product "${payload.name}" created successfully!`);
          handleCloseForm();
          await fetchProducts();
        } else {
          setActionError(res.data?.message || 'Failed to create product.');
        }
      }
    } catch (err) {
      console.error('Error submitting product form:', err);
      setActionError(err.response?.data?.message || 'An error occurred while saving the product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    try {
      setIsSubmitting(true);
      setActionError(null);
      setActionSuccess(null);
      const res = await api.delete(`/products/${productId}`);
      setDeleteConfirmId(null);
      if (res.data && res.data.success) {
        setActionSuccess(`Product "${productName}" deleted successfully.`);
        await fetchProducts();
      } else {
        setActionError(res.data?.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setDeleteConfirmId(null);
      setActionError(err.response?.data?.message || 'Unable to delete product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Image fallback SVG
  const getFallbackSvg = (name) =>
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="%23f1f5f9"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10" fill="%2364748b">${encodeURIComponent(name || 'Item')}</text></svg>`;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Product Management</h1>
          <p className="text-muted">Create, update, and manage catalog items and inventory levels.</p>
        </div>
        {!showForm ? (
          <button onClick={handleOpenAddForm} className="btn btn-primary">
            + Add New Product
          </button>
        ) : (
          <button onClick={handleCloseForm} className="btn btn-outline">
            ✕ Close Form
          </button>
        )}
      </div>

      {/* Action Success / Error Notifications */}
      {actionSuccess && (
        <div className="alert-box alert-success">
          <span>✅ {actionSuccess}</span>
          <button
            onClick={() => setActionSuccess(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div className="alert-box alert-danger">
          <span>⚠️ {actionError}</span>
          <button
            onClick={() => setActionError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Add / Edit Product Form Panel */}
      {showForm && (
        <div className="card card-body" style={{ marginBottom: '2rem' }}>
          <h3>{isEditing ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
          <form onSubmit={handleSubmitForm} style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Product Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="prod-name">
                  Product Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="prod-name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Wireless Noise-Canceling Headphones"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                />
                {formErrors.name && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label" htmlFor="prod-category">
                  Category <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="prod-category"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Electronics"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={isSubmitting}
                />
                {formErrors.category && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.category}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="prod-desc">
                Description <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                id="prod-desc"
                className="form-control"
                rows="3"
                placeholder="Product description and key specifications..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
              ></textarea>
              {formErrors.description && (
                <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                  {formErrors.description}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {/* Price */}
              <div className="form-group">
                <label className="form-label" htmlFor="prod-price">
                  Price (₹) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="e.g. 1999"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={isSubmitting}
                />
                {formErrors.price && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.price}
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="form-group">
                <label className="form-label" htmlFor="prod-stock">
                  Stock Units <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="prod-stock"
                  type="number"
                  className="form-control"
                  placeholder="e.g. 25"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  disabled={isSubmitting}
                />
                {formErrors.stock && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.stock}
                  </span>
                )}
              </div>

              {/* Image URL */}
              <div className="form-group">
                <label className="form-label" htmlFor="prod-image">
                  Image URL <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="prod-image"
                  type="text"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  disabled={isSubmitting}
                />
                {formErrors.image && (
                  <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                    {formErrors.image}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" onClick={handleCloseForm} className="btn btn-outline" disabled={isSubmitting}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <h3>Loading product catalog...</h3>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="state-container alert-danger">
          <h3>Unable to load products</h3>
          <p style={{ margin: '0.5rem 0 1rem' }}>{error}</p>
          <button onClick={fetchProducts} className="btn btn-danger">
            🔄 Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="state-container">
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>📦</div>
          <h3>No products found.</h3>
          <p style={{ marginBottom: '1.5rem' }}>Click the button above to add your first product.</p>
          <button onClick={handleOpenAddForm} className="btn btn-primary">
            + Add Product
          </button>
        </div>
      )}

      {/* Products Table */}
      {!loading && !error && products.length > 0 && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  {/* Product Thumbnail & Name */}
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: '220px' }}>
                    <img
                      src={product.image || getFallbackSvg(product.name)}
                      alt={product.name}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', backgroundColor: '#f1f5f9' }}
                      onError={(e) => {
                        e.target.src = getFallbackSvg(product.name);
                      }}
                    />
                    <div>
                      <strong>{product.name}</strong>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        ID: <code>{product._id}</code>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    <span className="badge badge-primary">{product.category}</span>
                  </td>

                  {/* Price */}
                  <td style={{ whiteSpace: 'nowrap', fontWeight: '700' }}>
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </td>

                  {/* Stock */}
                  <td>
                    {product.stock > 0 ? (
                      <span className="badge badge-success">{product.stock} Units</span>
                    ) : (
                      <span className="badge badge-danger">Out of Stock</span>
                    )}
                  </td>

                  {/* Rating */}
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>
                      ⭐ {Number(product.rating || 0).toFixed(1)} ({product.numReviews || 0})
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    {deleteConfirmId === product._id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 'bold' }}>Confirm Delete?</span>
                        <button
                          onClick={() => handleDeleteProduct(product._id, product.name)}
                          disabled={isSubmitting}
                          className="btn btn-danger btn-sm"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="btn btn-outline btn-sm"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEditForm(product)}
                          className="btn btn-outline btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(product._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
