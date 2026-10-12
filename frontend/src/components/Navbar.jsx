import React from 'react';
import { Sparkles, Activity, ShieldCheck, Settings, Layers, DollarSign } from 'lucide-react';

export default function Navbar({ health, siteInfo, onOpenSettings }) {
  const isHealthy = health?.status === 'healthy';
  const spentUsd = siteInfo?.spentUsd || 0;
  const budgetUsd = siteInfo?.limits?.monthlyBudgetUsd || 10.0;
  const budgetPercent = Math.min(100, Math.round((spentUsd / budgetUsd) * 100));

  return (
    <header className="studio-header">
      <div className="brand-wrapper">
        <div className="brand-logo-icon">
          <Sparkles size={24} />
        </div>
        <div className="brand-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1>EVO ART</h1>
            <span className="brand-badge">STUDIO AI</span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        {/* Backend Connectivity Status */}
        <div className="telemetry-badge" title={isHealthy ? 'Backend API connected' : 'Backend offline'}>
          <span className={`pulse-dot ${isHealthy ? '' : 'error'}`}></span>
          <span>{isHealthy ? 'API Engine: Online' : 'API Engine: Offline'}</span>
        </div>

        {/* Site Multi-tenant Budget Meter */}
        <div className="telemetry-badge budget-bar-container" title={`Spent: $${spentUsd.toFixed(3)} of $${budgetUsd.toFixed(2)} monthly quota`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>Tenant: {siteInfo?.name || 'Default'}</span>
            <span>${spentUsd.toFixed(3)} / ${budgetUsd.toFixed(2)}</span>
          </div>
          <div className="budget-bar-track">
            <div className="budget-bar-fill" style={{ width: `${Math.max(5, budgetPercent)}%` }}></div>
          </div>
        </div>

        {/* Tenant Switcher & Settings */}
        <button
          id="btn-open-settings"
          className="site-badge-btn"
          onClick={onOpenSettings}
          title="Configure API Key and User ID"
        >
          <Settings size={15} />
          <span>Tenant Config</span>
        </button>
      </div>
    </header>
  );
}
