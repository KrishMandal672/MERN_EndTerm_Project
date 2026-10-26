import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './authRoutes.js';
import taskRoutes from './taskRoutes.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(x => x.trim());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', (_req, res) => res.json({ api: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
const requireDatabase = (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'The database is not connected yet. Check MONGODB_URI and restart the server.' });
  next();
};
app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/tasks', requireDatabase, taskRoutes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(here, '../../frontend/dist');
app.use(express.static(frontendDist));
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(frontendDist, 'index.html'), error => error && next(error));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error?.status === 400 || error?.status === 413) return res.status(error.status).json({ error: error.status === 413 ? 'Request is too large.' : 'Request data is invalid.' });
  if (error?.name === 'ValidationError') return res.status(400).json({ error: 'Some assignment details are invalid.' });
  if (error?.name === 'CastError') return res.status(400).json({ error: 'The requested record is invalid.' });
  if (error?.code === 11000) return res.status(409).json({ error: 'That record already exists.' });
  res.status(500).json({ error: 'Something went wrong on the server. Please try again.' });
});

app.listen(port, () => console.log(`LastLap API listening on port ${port}`));
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).then(() => console.log('MongoDB connected')).catch(error => console.error('MongoDB connection failed:', error.message));
} else {
  console.warn('MONGODB_URI is missing. Add it to backend/.env to enable database features.');
}


