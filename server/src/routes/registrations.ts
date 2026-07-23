import { Router, Response } from 'express';
import Registration from '../models/Registration';
import Event from '../models/Event';
import { protect, adminOnly } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// POST /api/registrations
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  const { eventId } = req.body;
  if (!eventId) { res.status(400).json({ error: 'eventId is required.' }); return; }
  try {
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) { res.status(404).json({ error: 'Event not found.' }); return; }
    if (event.registeredCount >= event.capacity) { res.status(400).json({ error: 'Event is fully booked.' }); return; }

    const existing = await Registration.findOne({ user: req.user!.id, event: eventId });
    if (existing) {
      if (existing.status === 'confirmed') { res.status(400).json({ error: 'Already registered for this event.' }); return; }
      existing.status = 'confirmed';
      existing.registeredAt = new Date();
      await existing.save();
      await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });
      res.json({ message: 'Re-registered successfully.', registration: existing });
      return;
    }

    const registration = await Registration.create({ user: req.user!.id, event: eventId });
    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });
    res.status(201).json({ message: 'Registered successfully.', registration });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/registrations/my
router.get('/my', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const registrations = await Registration.find({ user: req.user!.id })
      .populate('event', 'title date location category imageUrl')
      .sort({ registeredAt: -1 });
    res.json(registrations);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/registrations/admin/all
router.get('/admin/all', protect, adminOnly, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const registrations = await Registration.find()
      .populate('user', 'name email')
      .populate('event', 'title date')
      .sort({ registeredAt: -1 });
    res.json(registrations);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/registrations/admin/event/:eventId
router.get('/admin/event/:eventId', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId, status: 'confirmed' })
      .populate('user', 'name email')
      .sort({ registeredAt: -1 });
    res.json(registrations);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/registrations/:id
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) { res.status(404).json({ error: 'Registration not found.' }); return; }
    if (reg.user.toString() !== req.user!.id) { res.status(403).json({ error: 'Not authorized.' }); return; }
    if (reg.status === 'cancelled') { res.status(400).json({ error: 'Already cancelled.' }); return; }
    reg.status = 'cancelled';
    await reg.save();
    await Event.findByIdAndUpdate(reg.event, { $inc: { registeredCount: -1 } });
    res.json({ message: 'Registration cancelled.' });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
