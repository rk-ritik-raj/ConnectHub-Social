import express from 'express';
import { protectRoute, adminRoute } from '../middleware/authMiddleware.js';
import {
  getAnalytics,
  getRecentContent,
  deleteUserByAdmin,
  deletePostByAdmin,
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/analytics', protectRoute, adminRoute, getAnalytics);
router.get('/recent', protectRoute, adminRoute, getRecentContent);
router.delete('/user/:id', protectRoute, adminRoute, deleteUserByAdmin);
router.delete('/post/:id', protectRoute, adminRoute, deletePostByAdmin);

export default router;
