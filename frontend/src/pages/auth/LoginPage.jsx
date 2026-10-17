import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/studio';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-glow-orb orb-1"></div>
      <div className="auth-glow-orb orb-2"></div>

      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-brand-badge">
            <Sparkles size={20} className="sparkle-icon" />
            <span>EVO ART STUDIO</span>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your neural creation workspace</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="field-icon" />
              <input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-with-action">
              <label htmlFor="login-password">Password</label>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
            id="login-submit-button"
          >
            {submitting ? (
              <span className="btn-loading-flex">
                <span className="spinner-mini"></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              <span className="btn-loading-flex">
                <span>Sign In</span>
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        {/* Register Redirect Footer */}
        <div className="auth-card-footer">
          <div className="admin-quick-fill-hint">
            <span>Admin Seed Account:</span>
            <button
              type="button"
              className="btn-quick-fill"
              onClick={() => {
                setEmail('admin@evoart.com');
                setPassword('Admin@123456');
              }}
            >
              Fill Admin Credentials
            </button>
          </div>

          <p style={{ marginTop: '14px' }}>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
