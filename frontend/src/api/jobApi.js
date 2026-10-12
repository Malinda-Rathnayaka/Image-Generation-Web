import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const createApiClient = (apiKey = 'tshirt', userId = 'user_demo') => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'x-user-id': userId
    }
  });
};

export const checkHealth = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
    return res.data;
  } catch (err) {
    return { status: 'down', error: err.message };
  }
};

export const fetchSiteInfo = async (apiKey = 'tshirt', userId = 'user_demo') => {
  const client = createApiClient(apiKey, userId);
  const res = await client.get('/api/v1/jobs/site-info');
  return res.data;
};

export const fetchJobHistory = async (apiKey = 'tshirt', userId = 'user_demo') => {
  const client = createApiClient(apiKey, userId);
  const res = await client.get('/api/v1/jobs/history');
  return res.data.jobs || [];
};

export const submitJob = async (prompt, options = {}, apiKey = 'tshirt', userId = 'user_demo') => {
  const client = createApiClient(apiKey, userId);
  const res = await client.post('/api/v1/jobs/generate', { prompt, options });
  return res.data; // { success: true, jobId, status, createdAt }
};

export const fetchJobStatus = async (jobId, apiKey = 'tshirt', userId = 'user_demo') => {
  const client = createApiClient(apiKey, userId);
  const res = await client.get(`/api/v1/jobs/${jobId}/status`);
  return res.data; // { jobId, status, imagePath, errorMessage, simulatedCost }
};

export const pollJobUntilDone = async (jobId, apiKey = 'tshirt', userId = 'user_demo', onProgress = null, maxAttempts = 30) => {
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
