import express from 'express';
import dbService from '../services/dbService.js';
import authService from '../services/authService.js';
import reportService from '../services/reportService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await dbService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile/:userId?', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Only allow users to view their own profile unless they're admin
    if (userId !== req.user.id) {
      const isAdmin = await authService.hasRole(req.user.id, 'admin');
      if (!isAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const profile = await dbService.getUserProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const updatedProfile = await dbService.update('profiles', req.user.id, {
      name,
      phone,
      updated_at: new Date().toISOString()
    });
    
    res.json(updatedProfile[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

// Admin: download bookings report with summaries
router.get('/admin/bookings-report', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const filePath = await reportService.generateSummaries();
    return res.download(filePath, 'bookings.xlsx');
  } catch (error) {
    console.error('Report download error:', error);
    res.status(500).json({ error: error.message });
  }
});