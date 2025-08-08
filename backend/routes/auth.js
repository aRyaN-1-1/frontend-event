import express from 'express';
import authService from '../services/authService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.signUp(email, password, { name, phone });
    
    res.status(201).json({
      message: 'User created successfully',
      user: result.user,
      session: result.session
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.signIn(email, password);
    
    res.json({
      message: 'Signed in successfully',
      user: result.user,
      session: {
        access_token: result.session?.access_token || result.session?.accessToken || req.headers.authorization?.split(' ')[1] || null,
        refresh_token: result.session?.refresh_token || result.session?.refreshToken || null
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Sign out
router.post('/signout', authenticateToken, async (req, res) => {
  try {
    await authService.signOut();
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const roles = await authService.getUserRoles(req.user.id);
    res.json({
      user: req.user,
      roles
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Refresh session
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const result = await authService.refreshSession(refresh_token);
    
    res.json({
      message: 'Session refreshed successfully',
      user: result.user,
      session: result.session
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: error.message });
  }
});

export default router;