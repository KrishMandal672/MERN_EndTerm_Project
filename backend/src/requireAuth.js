import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) return res.status(503).json({ error: 'Authentication is not configured. Set a JWT_SECRET in backend/.env and restart the API.' });
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Sign in to access your assignments.' });
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload.sub !== 'string') return res.status(401).json({ error: 'Your sign-in has expired. Please sign in again.' });
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Your sign-in has expired. Please sign in again.' });
  }
}

