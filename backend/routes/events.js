import express from 'express';
import dbService from '../services/dbService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all events with optional filters
router.get('/', async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.eventTypes) {
      filters.eventTypes = req.query.eventTypes.split(',');
    }
    
    if (req.query.location) {
      filters.location = req.query.location;
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      filters.priceRange = [
        parseFloat(req.query.minPrice) || 0,
        parseFloat(req.query.maxPrice) || 1000
      ];
    }
    
    if (req.query.date) {
      filters.date = req.query.date;
    }

    const events = await dbService.getEvents(filters);
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await dbService.getEventById(req.params.id);
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new event (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      created_by: req.user.id
    };

    const newEvent = await dbService.insert('events', eventData);
    res.status(201).json(newEvent[0]);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update event (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updatedEvent = await dbService.update('events', req.params.id, {
      ...req.body,
      updated_at: new Date().toISOString()
    });
    
    res.json(updatedEvent[0]);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete event (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await dbService.delete('events', req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle event sold out status (admin only)
router.patch('/:id/sold-out', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { sold_out } = req.body;
    
    const updatedEvent = await dbService.update('events', req.params.id, {
      sold_out,
      updated_at: new Date().toISOString()
    });
    
    res.json(updatedEvent[0]);
  } catch (error) {
    console.error('Toggle sold out error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;