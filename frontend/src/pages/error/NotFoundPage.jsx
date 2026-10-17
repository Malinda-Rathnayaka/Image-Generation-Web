import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon-wrapper">
          <Sparkles size={48} className="unauthorized-icon" />
        </div>
        <h2>404 - Page Not Found</h2>
        <p>The neural canvas page you are looking for does not exist or has been relocated.</p>
        <div className="unauthorized-actions">
          <Link to="/studio" className="btn-secondary">
            <ArrowLeft size={16} /> Return to Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
