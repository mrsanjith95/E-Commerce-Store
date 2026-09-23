import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Field validations
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({ name: name.trim(), email: email.trim(), password });
    setIsSubmitting(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '3rem auto' }}>
      <div className="card card-body">
        <h2 className="text-center" style={{ marginBottom: '0.5rem' }}>Create Account</h2>
        <p className="text-muted text-center" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Join ElectroStore today for seamless shopping.
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
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Sanjith Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register Account'}
          </button>
        </form>

        <p className="text-center text-muted" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
