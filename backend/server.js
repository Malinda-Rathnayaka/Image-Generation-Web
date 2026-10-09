import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import jobRoutes from './routes/jobRoutes.js'; // Replaces imageRoutes.js

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Connect MongoDB
connectDB();

// 2. Global Middlewares
app.use(cors());
app.use(express.json());

// Serve uploaded/generated files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health endpoint for Milestone 1 requirements
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// 3. Modular Core Job Routes
app.use('/api/v1/jobs', jobRoutes);

// 4. Centralized Error Handler (Preserved from your code)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Server] Running on http://localhost:${PORT}`));