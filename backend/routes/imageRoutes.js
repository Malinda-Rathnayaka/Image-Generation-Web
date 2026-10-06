import express from 'express';
import { generateImage, getAllImages } from '../controllers/imageController.js';

const router = express.Router();

// POST /api/images/generate -> Generate a new image
router.post('/generate', generateImage);

// GET /api/images -> Fetch all generated images
router.get('/', getAllImages);

export default router;