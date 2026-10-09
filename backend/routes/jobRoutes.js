import express from 'express';
import { authMiddleware } from '../Middleware/auth.js';
import { safetyGuard } from '../Middleware/safetyGuard.js';
import { createJob, getJobStatus } from '../controllers/jobController.js';

const router = express.Router();

// Asynchronous generation pipeline
router.post('/generate', authMiddleware, safetyGuard, createJob);
router.get('/:jobId/status', authMiddleware, getJobStatus);

export default router;