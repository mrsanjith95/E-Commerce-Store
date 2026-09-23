import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './layouts/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />

              {/* Protected User Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="admin" element={<AdminDashboardPage />} />
                <Route path="admin/products" element={<AdminProductsPage />} />
                <Route path="admin/orders" element={<AdminOrdersPage />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
