import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { requireAuth } from './requireAuth.js';

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tokenFor = user => jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '12h' });

router.use((_req, res, next) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) return res.status(503).json({ error: 'Authentication is not configured. Set a JWT_SECRET with at least 32 characters in server/.env.' });
  next();
});

router.post('/register', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!emailPattern.test(email) || email.length > 254) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (password.length < 8 || password.length > 72) return res.status(400).json({ error: 'Use a password between 8 and 72 characters.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });
    res.status(201).json({ token: tokenFor(user), user: { id: user.id, email: user.email } });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: 'An account with that email already exists.' });
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) return res.status(400).json({ error: 'Enter your email and password.' });
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !await bcrypt.compare(password, user.passwordHash)) return res.status(401).json({ error: 'Email or password is incorrect.' });
    res.json({ token: tokenFor(user), user: { id: user.id, email: user.email } });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.userId)) return res.status(401).json({ error: 'Please sign in again.' });
    const user = await User.findById(req.userId).select('email');
    if (!user) return res.status(401).json({ error: 'Please sign in again.' });
    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) { next(error); }
});

export default router;
