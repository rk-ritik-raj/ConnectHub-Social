import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { sendMessage, getChatHistory, getConversations } from '../controllers/messageController.js';

const router = express.Router();

router.post('/send/:receiverId', protectRoute, upload.single('media'), sendMessage);
router.get('/chat/:userId', protectRoute, getChatHistory);
router.get('/conversations', protectRoute, getConversations);

export default router;
