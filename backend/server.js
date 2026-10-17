import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { seedAdmin } from './utils/seedAdmin.js';
import jobRoutes from './routes/jobRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Connect MongoDB & Seed Initial Admin
connectDB().then(() => {
  seedAdmin();
});

// 2. Global Middlewares
app.use(cors());
app.use(express.json());

// Serve uploaded/generated files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health endpoint for Milestone 1 requirements
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// 3. Modular Core API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/jobs', jobRoutes);

// 4. Centralized Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Server] Running on http://localhost:${PORT}`));
