import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import TenantModal from '../TenantModal';
import { checkHealth, fetchSiteInfo } from '../../api/jobApi';

export default function MainLayout() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('evo_api_key') || 'tshirt');
  const [userId, setUserId] = useState(() => localStorage.getItem('evo_user_id') || 'user_demo');
  const [health, setHealth] = useState({ status: 'checking' });
  const [siteInfo, setSiteInfo] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const loadData = useCallback(async (currentKey = apiKey, currentUser = userId) => {
    try {
      const healthRes = await checkHealth();
      setHealth(healthRes);

      if (healthRes.status === 'healthy') {
        const siteData = await fetchSiteInfo(currentKey, currentUser);
        if (siteData?.success) {
          setSiteInfo(siteData.site);
        }
      }
    } catch (err) {
      console.warn('Layout sync error:', err.message);
    }
  }, [apiKey, userId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      checkHealth().then(setHealth);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSaveTenant = (newApiKey, newUserId) => {
    setApiKey(newApiKey);
    setUserId(newUserId);
    localStorage.setItem('evo_api_key', newApiKey);
    localStorage.setItem('evo_user_id', newUserId);
    loadData(newApiKey, newUserId);
  };

  return (
    <div className="studio-app">
      <Navbar 
        health={health} 
        siteInfo={siteInfo} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
      />
      
      <div className="layout-body-content">
        <Outlet context={{ apiKey, userId, siteInfo, setSiteInfo }} />
      </div>

      <TenantModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentApiKey={apiKey}
        currentUserId={userId}
        siteInfo={siteInfo}
        onSave={handleSaveTenant}
      />
    </div>
  );
}
