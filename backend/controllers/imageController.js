import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Image from '../models/imageModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * -------------------------------------------------------------------
 * SERVICE 1: MOCK AI GENERATOR (Development Mode)
 * Fetches a random stock/placeholder image without using any credits.
 * -------------------------------------------------------------------
 */
const generateMockImageBuffer = async (prompt) => {
  // Simulate AI network processing delay (1.5 seconds)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const placeholderUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024`;
  const response = await fetch(placeholderUrl);

  if (!response.ok) {
    throw new Error('Failed to fetch mock placeholder image');
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

/**
 * -------------------------------------------------------------------
 * SERVICE 2: REAL AI GENERATOR (Production / Live Mode)
 * Calls Together AI (or Pollinations/Replicate) to generate actual images.
 * -------------------------------------------------------------------
 */
const generateRealImageBuffer = async (prompt) => {
  const response = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell-Free',
      prompt: prompt,
      width: 1024,
      height: 1024,
      steps: 4,
      n: 1,
      response_format: 'b64_json',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Real AI API execution failed');
  }

  // Extract base64 image data and convert to Buffer
  const base64Data = data.data[0].b64_json;
  return Buffer.from(base64Data, 'base64');
};

// ===================================================================
// MAIN CONTROLLER ENDPOINT
// ===================================================================

// @desc    Generate Image (Switches between Mock and Real via .env)
// @route   POST /api/images/generate
// @access  Public
export const generateImage = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400);
      throw new Error('Prompt is required');
    }

    // Read toggle status from .env
    const isMockMode = process.env.USE_MOCK_AI === 'true';
    console.log(`[Image Controller] Processing request using: ${isMockMode ? 'MOCK AI (Free)' : 'REAL AI (Live)'}`);

    // 1. Fetch Buffer from appropriate generator
    const imageBuffer = isMockMode
      ? await generateMockImageBuffer(prompt)
      : await generateRealImageBuffer(prompt);

    // 2. Ensure local 'uploads' directory exists
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 3. Save buffer to disk
    const fileName = `img_${Date.now()}.jpg`;
    const filePath = path.join(uploadsDir, fileName);
    await fs.promises.writeFile(filePath, imageBuffer);

    // 4. Construct accessible web URL
    const publicImageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${fileName}`;

    // 5. Save document in MongoDB
    const newImage = await Image.create({
      prompt,
      imagePath: publicImageUrl,
    });

    res.status(201).json({
      success: true,
      data: newImage,
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved images from MongoDB
// @route   GET /api/images
// @access  Public
export const getAllImages = async (req, res, next) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (error) {
    next(error);
  }
};