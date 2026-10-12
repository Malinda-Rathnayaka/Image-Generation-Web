import { submitJob, pollJobUntilDone } from './jobApi';

export const generateImage = async (prompt, options = {}, apiKey = 'tshirt', userId = 'user_demo') => {
  const job = await submitJob(prompt, options, apiKey, userId);
  const result = await pollJobUntilDone(job.jobId, apiKey, userId);
  if (result.status === 'failed') {
    throw new Error(result.errorMessage || 'Image generation failed');
  }
  return {
    _id: result.jobId,
    prompt,
    imagePath: result.imagePath,
    simulatedCost: result.simulatedCost,
    status: result.status,
    createdAt: new Date().toISOString()
  };
};