import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { createStory, getStoriesFeed, viewStory } from '../controllers/storyController.js';

const router = express.Router();

router.post('/', protectRoute, upload.single('media'), createStory);
router.get('/feed', protectRoute, getStoriesFeed);
router.post('/view/:id', protectRoute, viewStory);

export default router;
