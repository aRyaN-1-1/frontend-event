import express from 'express';
import dbService from '../services/dbService.js';
import storageService from '../services/storageService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all coaches
router.get('/', async (req, res) => {
  try {
    const coaches = await dbService.getCoaches();
    res.json(coaches);
  } catch (error) {
    console.error('Get coaches error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single coach
router.get('/:id', async (req, res) => {
  try {
    const coach = await dbService.getCoachById(req.params.id);
    res.json(coach);
  } catch (error) {
    console.error('Get coach error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new coach (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const coachData = {
      ...req.body,
      user_id: req.user.id
    };

    const newCoach = await dbService.insert('coaches', coachData);
    res.status(201).json(newCoach[0]);
  } catch (error) {
    console.error('Create coach error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update coach (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updatedCoach = await dbService.update('coaches', req.params.id, {
      ...req.body,
      updated_at: new Date().toISOString()
    });
    
    res.json(updatedCoach[0]);
  } catch (error) {
    console.error('Update coach error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete coach (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await dbService.delete('coaches', req.params.id);
    res.json({ message: 'Coach deleted successfully' });
  } catch (error) {
    console.error('Delete coach error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

// Upload coach image
router.post('/upload-image', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { dataUrl } = req.body;
    if (!dataUrl) return res.status(400).json({ error: 'Image data required' });
    const url = await storageService.uploadBase64('coach-images', 'coaches', dataUrl);
    res.json({ url });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: error.message });
  }
});