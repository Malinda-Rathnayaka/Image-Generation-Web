import React, { useState } from 'react';
import { X, Key, User, Shield, Info, Check } from 'lucide-react';

export default function TenantModal({ 
  isOpen, 
  onClose, 
  currentApiKey, 
  currentUserId, 
  siteInfo, 
  onSave 
}) {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [userId, setUserId] = useState(currentUserId);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSave(apiKey.trim(), userId.trim());
    onClose();
  };

  const handleSelectPreset = (key) => {
    setApiKey(key);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '18px' }}>Tenant & API Key Configuration</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="setting-group">
            <label className="setting-label">Preset Registered Sites</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                className={`site-badge-btn ${apiKey === 'tshirt' ? 'active' : ''}`}
                style={{ 
                  flex: 1, 
                  justifyContent: 'center', 
                  borderColor: apiKey === 'tshirt' ? 'var(--accent-primary)' : 'var(--border-subtle)' 
                }}
                onClick={() => handleSelectPreset('tshirt')}
              >
                Site: "tshirt"
              </button>

              <button
                type="button"
                className={`site-badge-btn ${apiKey === 'restaurant' ? 'active' : ''}`}
                style={{ 
                  flex: 1, 
                  justifyContent: 'center', 
                  borderColor: apiKey === 'restaurant' ? 'var(--accent-primary)' : 'var(--border-subtle)' 
                }}
                onClick={() => handleSelectPreset('restaurant')}
              >
                Site: "restaurant"
              </button>
            </div>
          </div>

          <div className="setting-group">
            <label className="setting-label">API Key (x-api-key)</label>
            <input
              type="text"
              className="setting-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. tshirt"
              required
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Hashed with SHA-256 by the backend to identify tenant permissions and budgets.
            </span>
          </div>

          <div className="setting-group">
            <label className="setting-label">User ID (x-user-id)</label>
            <input
              type="text"
              className="setting-input"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. user_demo"
              required
            />
          </div>

          {siteInfo && (
            <div style={{ 
              background: 'var(--bg-input)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-md)', 
              padding: '12px', 
              marginBottom: '20px', 
              fontSize: '12px', 
              color: 'var(--text-secondary)' 
            }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Active Tenant Telemetry:
              </div>
              <div>Tenant ID: {siteInfo.name}</div>
              <div>Spent: ${Number(siteInfo.spentUsd || 0).toFixed(4)} / ${siteInfo.limits?.monthlyBudgetUsd || 10.0}</div>
              <div>Rate Limit: {siteInfo.limits?.rateLimitRpm || 30} req/min</div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="site-badge-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-generate" style={{ padding: '10px 20px', fontSize: '14px' }}>
              <Check size={16} /> Save & Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
