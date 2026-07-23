import { Router, Request, Response } from 'express';
import Event from '../models/Event';
import { protect, adminOnly } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// GET /api/events
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, page = 1, limit = 9 } = req.query;
    const filter: Record<string, unknown> = { isActive: true };
    if (category) filter.category = category;
    if (search)   filter.title = { $regex: search, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      Event.find(filter).populate('organizer', 'name email').sort({ date: 1 }).skip(skip).limit(Number(limit)),
      Event.countDocuments(filter),
    ]);
    res.json({ events, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/events/categories
router.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Event.distinct('category');
    res.json(categories);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) { res.status(404).json({ error: 'Event not found.' }); return; }
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/events (admin)
router.post('/', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user!.id });
    res.status(201).json(event);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error.';
    res.status(400).json({ error: msg });
  }
});

// PUT /api/events/:id (admin)
router.put('/:id', protect, adminOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) { res.status(404).json({ error: 'Event not found.' }); return; }
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/events/:id (admin - soft delete)
router.delete('/:id', protect, adminOnly, async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!event) { res.status(404).json({ error: 'Event not found.' }); return; }
    res.json({ message: 'Event deactivated successfully.' });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
