import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import PromptStudio from '../../components/PromptStudio';
import CanvasViewport from '../../components/CanvasViewport';
import JobHistory from '../../components/JobHistory';
import { 
  fetchJobHistory, 
  submitJob, 
  pollJobUntilDone,
  fetchSiteInfo
} from '../../api/jobApi';
import { useAuth } from '../../context/AuthContext';

export default function StudioPage() {
  const { apiKey, userId, siteInfo, setSiteInfo } = useOutletContext();
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stageInfo, setStageInfo] = useState(null);
  const [error, setError] = useState('');

  // 1. Initial job history bootstrap
  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const historyData = await fetchJobHistory(apiKey, userId);
      setJobs(historyData);
      if (historyData.length > 0 && !activeImage) {
        setActiveImage(historyData[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, [apiKey, userId, activeImage]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // 2. Handle Generation Pipeline
  const handleGenerate = async ({ prompt, options }) => {
    setLoading(true);
    setError('');
    setStageInfo({ status: 'pending', jobId: 'Dispatching...' });

    try {
      // Step A: Send POST /api/v1/jobs/generate -> Returns immediate 202 Accepted
      const effectiveUserId = user ? user.id || user._id : userId;
      const jobResponse = await submitJob(prompt, options, apiKey, effectiveUserId);
      setStageInfo({ status: 'pending', jobId: jobResponse.jobId });

      // Step B: Asynchronous polling until background worker finishes
      const result = await pollJobUntilDone(
        jobResponse.jobId, 
        apiKey, 
        effectiveUserId, 
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
      fetchSiteInfo(apiKey, effectiveUserId).then(res => {
        if (res?.success && setSiteInfo) setSiteInfo(res.site);
      });

    } catch (err) {
      const serverMessage = err.response?.data?.message || err.message;
      setError(serverMessage);
    } finally {
      setLoading(false);
      setStageInfo(null);
    }
  };

  return (
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
          onRefreshHistory={loadHistory}
          loadingHistory={loadingHistory}
        />
      </div>
    </main>
  );
}
