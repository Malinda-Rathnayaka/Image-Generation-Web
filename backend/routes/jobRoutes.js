import express from 'express';
import { authMiddleware } from '../Middleware/auth.js';
import { safetyGuard } from '../Middleware/safetyGuard.js';
import { createJob, getJobStatus, getSiteInfo, getJobHistory } from '../controllers/jobController.js';

const router = express.Router();

// Site metadata and limits
router.get('/site-info', authMiddleware, getSiteInfo);

// Job history
router.get('/history', authMiddleware, getJobHistory);

// Asynchronous generation pipeline
router.post('/generate', authMiddleware, safetyGuard, createJob);
router.get('/:jobId/status', authMiddleware, getJobStatus);

export default router;