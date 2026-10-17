import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Shield } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and re-enter.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password
      });
      navigate('/studio', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-glow-orb orb-1"></div>
      <div className="auth-glow-orb orb-2"></div>

      <div className="auth-card register-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-brand-badge">
            <Sparkles size={20} className="sparkle-icon" />
            <span>EVO ART STUDIO</span>
          </div>
          <h2>Create Account</h2>
          <p>Join the next-generation generative AI creative suite</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="field-icon" />
              <input
                id="reg-name"
                type="text"
                placeholder="Alex Mercer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="field-icon" />
              <input
                id="reg-email"
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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

            <div className="form-group">
              <label htmlFor="reg-confirm-password">Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  id="reg-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="system-notice-tip">
            <Shield size={16} className="tip-icon" />
            <span>The first account created in the system automatically gains <strong>Administrator</strong> privileges.</span>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
            id="register-submit-button"
          >
            {submitting ? (
              <span className="btn-loading-flex">
                <span className="spinner-mini"></span>
                <span>Creating Account...</span>
              </span>
            ) : (
              <span className="btn-loading-flex">
                <span>Complete Registration</span>
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-card-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Log in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
