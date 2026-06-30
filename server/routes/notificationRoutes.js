import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { getNotifications, markNotificationsAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', protectRoute, getNotifications);
router.put('/read', protectRoute, markNotificationsAsRead);

export default router;
