import crypto from 'crypto';
import Job from '../models/Job.js';
import { ProviderFactory } from '../services/providers/ProviderFactory.js';

// POST /api/v1/jobs/generate
export const createJob = async (req, res, next) => {
  try {
    const { prompt, options } = req.body;
    const jobId = 'job_' + crypto.randomBytes(8).toString('hex');

    // Create job record in 'pending' status
    const job = await Job.create({
      jobId,
      siteId: req.site._id,
      userId: req.userId,
      prompt,
      options: options || {}
    });

    // Execute background process asynchronously (returns immediate 202 Accepted)
    processJobInBackground(job.jobId, req.site);

    return res.status(202).json({
      success: true,
      jobId: job.jobId,
      status: 'pending',
      createdAt: job.createdAt
    });
  } catch (err) {
    next(err); // Delegates to centralized error handler in server.js
  }
};

// Async worker process
async function processJobInBackground(jobId, site) {
  try {
    const job = await Job.findOne({ jobId });
    if (!job) return;

    job.status = 'processing';
    await job.save();

    try {
      const provider = ProviderFactory.getProvider();
      const result = await provider.generateImage(job.prompt, job.options);

      job.status = 'completed';
      job.imagePath = result.imagePath;
      job.simulatedCost = result.simulatedCost || 0;
      await job.save();

      // Increment site budget usage accumulator (using spentUsd to match MongoDB schema)
      site.spentUsd = (site.spentUsd || 0) + (result.simulatedCost || 0);
      await site.save();
    } catch (err) {
      console.error(`[Background Worker Error] Job ${jobId} failed:`, err.message);
      job.status = 'failed';
      job.errorMessage = err.message || 'Image generation failed.';
      await job.save();
    }
  } catch (fatalErr) {
    console.error(`[Fatal Background Worker Error] Job ${jobId}:`, fatalErr);
  }
}

// GET /api/v1/jobs/:jobId/status
export const getJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findOne({ jobId: req.params.jobId, siteId: req.site._id });
    if (!job) {
      res.status(404);
      throw new Error('Job not found.');
    }

    return res.status(200).json({
      jobId: job.jobId,
      status: job.status,
      imagePath: job.imagePath || null,
      errorMessage: job.errorMessage || null,
      simulatedCost: job.simulatedCost
    });
  } catch (err) {
    next(err); // Delegates to centralized error handler in server.js
  }
};

// GET /api/v1/jobs/site-info
export const getSiteInfo = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      site: {
        id: req.site._id,
        name: req.site.name,
        spentUsd: req.site.spentUsd || 0,
        limits: req.site.limits || { monthlyBudgetUsd: 10.0, rateLimitRpm: 30 },
        features: req.site.features || {},
        theme: req.site.theme || null
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/jobs/history
export const getJobHistory = async (req, res, next) => {
  try {
    const jobs = await Job.find({ siteId: req.site._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .select('jobId prompt status imagePath simulatedCost createdAt options errorMessage');

    return res.status(200).json({
      success: true,
      jobs
    });
  } catch (err) {
    next(err);
  }
};