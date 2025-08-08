import express from 'express';
import dbService from '../services/dbService.js';
import { authenticateToken } from '../middleware/auth.js';
import reportService from '../services/reportService.js';

const router = express.Router();

// Get user's bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await dbService.getUserBookings(req.user.id);
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { event_id } = req.body;

    if (!event_id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const booking = await dbService.createBooking(req.user.id, event_id);
    // Record to Excel
    try {
      const [profile, event] = await Promise.all([
        dbService.getUserProfile(req.user.id),
        dbService.getEventById(event_id)
      ]);
      await reportService.recordBooking({
        booking,
        user: { id: req.user.id, email: req.user.email, name: profile?.name, phone: profile?.phone },
        event
      });
    } catch (e) {
      console.error('Failed to record booking to Excel:', e);
    }
    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    if (error.code === 'ALREADY_BOOKED') {
      return res.status(400).json({ error: 'You have already booked this event' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await dbService.cancelBooking(req.params.id, req.user.id);
    try {
      await reportService.recordCancellation({ bookingId: req.params.id, userId: req.user.id });
    } catch (e) {
      console.error('Failed to record cancellation:', e);
    }
    res.json(booking);
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;