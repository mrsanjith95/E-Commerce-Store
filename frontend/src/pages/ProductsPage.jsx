import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/products');
      if (res.data && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/products');
        if (isMounted) {
          if (res.data && Array.isArray(res.data.products)) {
            setProducts(res.data.products);
          } else if (Array.isArray(res.data)) {
            setProducts(res.data);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching products:', err);
          setError('Unable to load products. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Extract unique categories from products list dynamically
  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [products]);

  // Filter and sort products client-side
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // 1. Client-side search by name or category (case-insensitive)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.category && p.category.toLowerCase().includes(term))
      );
    }

    // 2. Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 3. Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name-asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default:
        // Default (newest first as returned by backend)
        break;
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortBy]);

  return (
    <div>
      {/* Page Header & Controls */}
      <div className="page-header">
        <div>
          <h1>Explore Products</h1>
          <p className="text-muted">Browse our collection of electronics and devices.</p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 200px' }}>
            <label htmlFor="product-search" className="sr-only" style={{ display: 'none' }}>
              Search Products
            </label>
            <input
              id="product-search"
              type="text"
              className="form-control"
              placeholder="🔍 Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search products"
            />
          </div>

          {/* Category Filter */}
          <div style={{ flex: '1 1 150px' }}>
            <label htmlFor="category-select" className="sr-only" style={{ display: 'none' }}>
              Category
            </label>
            <select
              id="category-select"
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ flex: '1 1 150px' }}>
            <label htmlFor="sort-select" className="sr-only" style={{ display: 'none' }}>
              Sort By
            </label>
            <select
              id="sort-select"
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              <option value="default">Default Sort</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <h3>Loading products...</h3>
          <p>Please wait while we retrieve the latest inventory.</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="state-container alert-danger">
          <div>
            <h3 style={{ color: 'var(--danger)' }}>Unable to load products</h3>
            <p style={{ margin: '0.5rem 0' }}>{error}</p>
            <button onClick={fetchProducts} className="btn btn-danger" style={{ marginTop: '0.75rem', width: 'auto' }}>
              🔄 Retry
            </button>
          </div>
        </div>
      )}

      {/* Initial Empty State (Backend returned 0 products) */}
      {!loading && !error && products.length === 0 && (
        <div className="state-container">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📦</div>
          <h3>No products available</h3>
          <p>Check back later for new arrivals.</p>
        </div>
      )}

      {/* Filtered Empty State (Search / Category returned 0 products) */}
      {!loading && !error && products.length > 0 && filteredAndSortedProducts.length === 0 && (
        <div className="state-container">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your search criteria or category filter.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSortBy('default');
            }}
            className="btn btn-outline"
            style={{ marginTop: '0.5rem', width: 'auto' }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && filteredAndSortedProducts.length > 0 && (
        <div className="grid grid-3">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

