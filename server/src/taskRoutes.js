import express from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { requireAuth } from './requireAuth.js';

const router = express.Router();
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const allowedEffort = new Set([1, 2, 3]);
const allowedImportance = new Set([1, 2, 3]);
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { owner: req.userId, ...(status === 'done' ? { done: true } : status === 'active' ? { done: false } : {}) };
    const tasks = await Task.find(filter).sort({ due: 1, createdAt: -1 }).lean();
    res.json({ tasks });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, course, due, effort, importance } = req.body ?? {};
    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    const cleanCourse = typeof course === 'string' ? course.trim() : '';
    if (!cleanTitle || cleanTitle.length > 80) return res.status(400).json({ error: 'Assignment name is required and must be 80 characters or fewer.' });
    if (!cleanCourse || cleanCourse.length > 40) return res.status(400).json({ error: 'Course is required and must be 40 characters or fewer.' });
    if (!isValidDate(due)) return res.status(400).json({ error: 'Enter a valid due date.' });
    if (!allowedEffort.has(Number(effort)) || !allowedImportance.has(Number(importance))) return res.status(400).json({ error: 'Choose a valid effort and importance.' });
    const duplicate = await Task.findOne({ owner: req.userId, title: { $regex: `^${escapeRegex(cleanTitle)}$`, $options: 'i' }, course: { $regex: `^${escapeRegex(cleanCourse)}$`, $options: 'i' }, due });
    if (duplicate) return res.status(409).json({ error: 'That assignment is already in your workload.' });
    const task = await Task.create({ owner: req.userId, title: cleanTitle, course: cleanCourse, due, effort: Number(effort), importance: Number(importance) });
    res.status(201).json({ task });
  } catch (error) { next(error); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'This assignment ID is invalid.' });
    if (typeof req.body?.done !== 'boolean') return res.status(400).json({ error: 'A completion status is required.' });
    const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, { done: req.body.done, completedAt: req.body.done ? new Date() : null }, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ error: 'Assignment not found.' });
    res.json({ task });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'This assignment ID is invalid.' });
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!task) return res.status(404).json({ error: 'Assignment not found.' });
    res.json({ message: 'Assignment removed.' });
  } catch (error) { next(error); }
});

function isValidDate(value) {
  if (typeof value !== 'string' || !datePattern.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
export default router;

