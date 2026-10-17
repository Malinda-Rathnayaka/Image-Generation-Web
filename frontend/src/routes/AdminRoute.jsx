import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="spinner-orbit"></div>
        <p>Verifying administrative privileges...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="unauthorized-container">
        <div className="unauthorized-card">
          <div className="unauthorized-icon-wrapper">
            <ShieldAlert size={48} className="unauthorized-icon" />
          </div>
          <h2>Restricted Access</h2>
          <p>
            You do not have administrative privileges to access this control center.
            Only accounts with the <strong>Admin</strong> role can view and manage user accounts.
          </p>
          <div className="unauthorized-actions">
            <Link to="/studio" className="btn-secondary">
              <ArrowLeft size={16} /> Return to Studio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
