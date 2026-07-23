import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

const signToken = (id: string, role: string): string =>
  jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email and password are required.' });
    return;
  }
  try {
    const exists = await User.findOne({ email });
    if (exists) { res.status(400).json({ error: 'Email already in use.' }); return; }
    const user = await User.create({ name, email, password });
    const token = signToken(user._id.toString(), user.role);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: 'Email and password are required.' }); return; }
  try {
    const user = await User.findOne({ email });
    if (!user) { res.status(401).json({ error: 'Invalid credentials.' }); return; }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) { res.status(401).json({ error: 'Invalid credentials.' }); return; }
    const token = signToken(user._id.toString(), user.role);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
