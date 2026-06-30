import express from 'express';
import { body } from 'express-validator';
import { signup, verifyEmail, login, logout, forgotPassword, resetPassword, getMe } from '../controllers/authController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/signup',
  [
    body('username')
      .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters long')
      .matches(/^[a-zA-Z0-9_.]+$/).withMessage('Username can only contain alphanumeric characters, underscores, and dots'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('fullName').notEmpty().withMessage('Full name is required').trim(),
  ],
  signup
);

router.post('/verify-email', verifyEmail);

router.post(
  '/login',
  [
    body('loginIdentifier').notEmpty().withMessage('Username or Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protectRoute, getMe);

export default router;
