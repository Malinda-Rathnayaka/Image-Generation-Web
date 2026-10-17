import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Palette, 
  Image as ImageIcon, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Coins, 
  ChevronDown,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ health, siteInfo, onOpenSettings }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isHealthy = health?.status === 'healthy';
  const spentUsd = siteInfo?.spentUsd || 0;
  const budgetUsd = siteInfo?.limits?.monthlyBudgetUsd || 50.0;
  const budgetPercent = Math.min(100, Math.round((spentUsd / budgetUsd) * 100));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="studio-header">
      {/* Left: Brand Logo & Main Nav */}
      <div className="header-left-section">
        <NavLink to="/studio" className="brand-wrapper">
          <div className="brand-logo-icon">
            <Sparkles size={22} />
          </div>
          <div className="brand-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1>EVO ART</h1>
              <span className="brand-badge">PRO AI</span>
            </div>
          </div>
        </NavLink>

        {/* Navigation Tabs */}
        <nav className="header-nav-tabs">
          <NavLink 
            to="/studio" 
            className={({ isActive }) => `nav-tab-item ${isActive ? 'active' : ''}`}
          >
            <Palette size={16} />
            <span>Studio</span>
          </NavLink>

          <NavLink 
            to="/history" 
            className={({ isActive }) => `nav-tab-item ${isActive ? 'active' : ''}`}
          >
            <ImageIcon size={16} />
            <span>Gallery</span>
          </NavLink>

          {isAdmin && (
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => `nav-tab-item admin-tab ${isActive ? 'active' : ''}`}
            >
              <Users size={16} />
              <span>Admin Management</span>
              <span className="admin-chip">ADMIN</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Right: Telemetry, Credits & User Profile */}
      <div className="header-actions">
        <div className="telemetry-badge" title={isHealthy ? 'Backend API connected' : 'Backend offline'}>
          <span className={`pulse-dot ${isHealthy ? '' : 'error'}`}></span>
          <span>{isHealthy ? 'Engine Online' : 'Engine Offline'}</span>
        </div>

        {siteInfo && (
          <div 
            className="telemetry-badge budget-bar-container" 
            title={`Tenant Budget: $${spentUsd.toFixed(2)} / $${budgetUsd.toFixed(2)}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span>Quota</span>
              <span>${spentUsd.toFixed(2)} / ${budgetUsd.toFixed(2)}</span>
            </div>
            <div className="budget-bar-track">
              <div className="budget-bar-fill" style={{ width: `${Math.max(5, budgetPercent)}%` }}></div>
            </div>
          </div>
        )}

        <div className="credits-badge" title="Generation Credits Available">
          <Coins size={14} className="credits-icon" />
          <span>{user?.credits ?? 50} Credits</span>
        </div>

        {onOpenSettings && (
          <button
            id="btn-open-settings"
            className="site-badge-btn"
            onClick={onOpenSettings}
            title="Configure Tenant API Key"
          >
            <Settings size={15} />
            <span>Tenant</span>
          </button>
        )}

        <div className="user-profile-menu-container">
          <button 
            className="user-profile-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
          >
            <div className="user-avatar-circle">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-meta-info">
              <span className="user-name-label">{user?.name || 'User'}</span>
              <span className={`user-role-label ${user?.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                {user?.role ? user.role.toUpperCase() : 'USER'}
              </span>
            </div>
            <ChevronDown size={14} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown-panel">
              <div className="dropdown-header">
                <strong>{user?.name}</strong>
                <span className="dropdown-email">{user?.email}</span>
                <span className={`badge-role-tag ${user?.role === 'admin' ? 'tag-admin' : 'tag-user'}`}>
                  {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                </span>
              </div>

              <div className="dropdown-divider"></div>

              <NavLink 
                to="/profile" 
                className="dropdown-item" 
                onClick={() => setDropdownOpen(false)}
              >
                <UserIcon size={16} />
                <span>My Profile</span>
              </NavLink>

              {isAdmin && (
                <NavLink 
                  to="/admin/users" 
                  className="dropdown-item admin-item" 
                  onClick={() => setDropdownOpen(false)}
                >
                  <ShieldCheck size={16} />
                  <span>Admin User Manager</span>
                </NavLink>
              )}

              <div className="dropdown-divider"></div>

              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
