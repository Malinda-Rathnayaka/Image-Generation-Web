import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import PromptStudio from './components/PromptStudio';
import CanvasViewport from './components/CanvasViewport';
import JobHistory from './components/JobHistory';
import TenantModal from './components/TenantModal';
import { 
  checkHealth, 
  fetchSiteInfo, 
  fetchJobHistory, 
  submitJob, 
  pollJobUntilDone 
} from './api/jobApi';
import './App.css';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('evo_api_key') || 'tshirt');
  const [userId, setUserId] = useState(() => localStorage.getItem('evo_user_id') || 'user_demo');

  const [health, setHealth] = useState({ status: 'checking' });
  const [siteInfo, setSiteInfo] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [activeImage, setActiveImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stageInfo, setStageInfo] = useState(null);
  const [error, setError] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 1. Initial health and site data bootstrap
  const refreshData = useCallback(async (currentKey = apiKey, currentUser = userId) => {
    // Health check
    const healthRes = await checkHealth();
    setHealth(healthRes);

    if (healthRes.status === 'healthy') {
      try {
        const siteData = await fetchSiteInfo(currentKey, currentUser);
        if (siteData.success) {
          setSiteInfo(siteData.site);
        }
      } catch (err) {
        console.warn('Failed to fetch site info:', err.message);
      }

      try {
        setLoadingHistory(true);
        const historyData = await fetchJobHistory(currentKey, currentUser);
        setJobs(historyData);
        if (historyData.length > 0 && !activeImage) {
          setActiveImage(historyData[0]);
        }
      } catch (err) {
        console.warn('Failed to fetch history:', err.message);
      } finally {
        setLoadingHistory(false);
      }
    }
  }, [apiKey, userId, activeImage]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      checkHealth().then(setHealth);
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // 2. Handle Generation Pipeline
  const handleGenerate = async ({ prompt, options }) => {
    setLoading(true);
    setError('');
    setStageInfo({ status: 'pending', jobId: 'Dispatching...' });

    try {
      // Step A: Send POST /api/v1/jobs/generate -> Returns immediate 202 Accepted
      const jobResponse = await submitJob(prompt, options, apiKey, userId);
      setStageInfo({ status: 'pending', jobId: jobResponse.jobId });

      // Step B: Asynchronous polling until background worker finishes
      const result = await pollJobUntilDone(
        jobResponse.jobId, 
        apiKey, 
        userId, 
        (statusUpdate) => {
          setStageInfo(statusUpdate);
        }
      );

      if (result.status === 'failed') {
        throw new Error(result.errorMessage || 'Generation failed in neural engine.');
      }

      // Step C: Render newly generated asset
      const completedImage = {
        jobId: result.jobId,
        prompt,
        imagePath: result.imagePath,
        simulatedCost: result.simulatedCost,
        createdAt: new Date().toISOString()
      };

      setActiveImage(completedImage);

      // Prepend to recent jobs list
      setJobs((prev) => [completedImage, ...prev]);

      // Re-fetch site info to update budget meters
      fetchSiteInfo(apiKey, userId).then(res => {
        if (res?.success) setSiteInfo(res.site);
      });

    } catch (err) {
      const serverMessage = err.response?.data?.message || err.message;
      setError(serverMessage);
    } finally {
      setLoading(false);
      setStageInfo(null);
    }
  };

  // 3. Handle Tenant switch
  const handleSaveTenant = (newApiKey, newUserId) => {
    setApiKey(newApiKey);
    setUserId(newUserId);
    localStorage.setItem('evo_api_key', newApiKey);
    localStorage.setItem('evo_user_id', newUserId);
    refreshData(newApiKey, newUserId);
  };

  return (
    <div className="studio-app">
      {/* Top Navbar */}
      <Navbar 
        health={health} 
        siteInfo={siteInfo} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
      />

      {/* Main Studio View */}
      <main className="studio-main">
        {/* Left Control Panel */}
        <PromptStudio 
          onGenerate={handleGenerate} 
          loading={loading} 
          error={error} 
        />

        {/* Center / Right Viewport */}
        <div className="canvas-viewport">
          <CanvasViewport 
            activeImage={activeImage} 
            loading={loading} 
            stageInfo={stageInfo}
          />

          {/* MongoDB Generations History */}
          <JobHistory 
            jobs={jobs} 
            onSelectJob={setActiveImage} 
            onRefreshHistory={() => refreshData()}
            loadingHistory={loadingHistory}
          />
        </div>
      </main>

      {/* Tenant / API Key Settings Modal */}
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