import axiosClient, { BASE_URL } from './axiosClient';

export const createApiClient = (apiKey = 'tshirt', userId = 'user_demo') => {
  return axiosClient;
};

export const checkHealth = async () => {
  try {
    const res = await axiosClient.get('/health', { timeout: 4000 });
    return res.data;
  } catch (err) {
    return { status: 'down', error: err.message };
  }
};

export const fetchSiteInfo = async (apiKey, userId) => {
  const headers = {};
  if (apiKey) headers['x-api-key'] = apiKey;
  if (userId) headers['x-user-id'] = userId;
  const res = await axiosClient.get('/api/v1/jobs/site-info', { headers });
  return res.data;
};

export const fetchJobHistory = async (apiKey, userId) => {
  const headers = {};
  if (apiKey) headers['x-api-key'] = apiKey;
  if (userId) headers['x-user-id'] = userId;
  const res = await axiosClient.get('/api/v1/jobs/history', { headers });
  return res.data.jobs || [];
};

export const submitJob = async (prompt, options = {}, apiKey, userId) => {
  const headers = {};
  if (apiKey) headers['x-api-key'] = apiKey;
  if (userId) headers['x-user-id'] = userId;
  const res = await axiosClient.post('/api/v1/jobs/generate', { prompt, options }, { headers });
  return res.data; // { success: true, jobId, status, createdAt }
};

export const fetchJobStatus = async (jobId, apiKey, userId) => {
  const headers = {};
  if (apiKey) headers['x-api-key'] = apiKey;
  if (userId) headers['x-user-id'] = userId;
  const res = await axiosClient.get(`/api/v1/jobs/${jobId}/status`, { headers });
  return res.data; // { jobId, status, imagePath, errorMessage, simulatedCost }
};

export const pollJobUntilDone = async (jobId, apiKey, userId, onProgress = null, maxAttempts = 30) => {
  let attempts = 0;
  while (attempts < maxAttempts) {
    attempts++;
    const statusData = await fetchJobStatus(jobId, apiKey, userId);
    if (onProgress) {
      onProgress(statusData, attempts);
    }

    if (statusData.status === 'completed' || statusData.status === 'failed') {
      return statusData;
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
  }
  throw new Error('Image generation job timed out. Please check history.');
};
