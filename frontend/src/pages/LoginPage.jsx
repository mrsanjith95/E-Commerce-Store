import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const redirectPath = typeof location.state?.from === 'string'
        ? location.state.from
        : (location.state?.from?.pathname || '/');
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Input validation
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login({ email: email.trim(), password });
    setIsSubmitting(false);

    if (result.success) {
      const redirectPath = typeof location.state?.from === 'string'
        ? location.state.from
        : (location.state?.from?.pathname || '/');
      navigate(redirectPath, { replace: true });
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto' }}>
      <div className="card card-body">
        <h2 className="text-center" style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
        <p className="text-muted text-center" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Sign in to your account to continue.
        </p>

        {errorMessage && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #f87171',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            fontSize: '0.9rem'
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-muted" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
