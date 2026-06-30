import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  createPost,
  getFeed,
  getExplore,
  getUserPosts,
  deletePost,
  likeUnlikePost,
  saveUnsavePost,
  getSavedPosts,
  addComment,
  getPostComments,
  togglePinPost,
  getPostInsights,
  getAICaptionSuggestions,
  getAIHashtagSuggestions,
  getAICommentSuggestionsController,
  getReels,
} from '../controllers/postController.js';

const router = express.Router();

router.post('/', protectRoute, upload.array('media', 10), createPost);
router.get('/feed', protectRoute, getFeed);
router.get('/explore', protectRoute, getExplore);
router.get('/reels', protectRoute, getReels);
router.get('/user/:username', protectRoute, getUserPosts);
router.delete('/:id', protectRoute, deletePost);
router.post('/like/:id', protectRoute, likeUnlikePost);
router.post('/save/:id', protectRoute, saveUnsavePost);
router.get('/saved', protectRoute, getSavedPosts);
router.post('/comment/:id', protectRoute, addComment);
router.get('/:id/comments', protectRoute, getPostComments);
router.post('/pin/:id', protectRoute, togglePinPost);
router.get('/insights/:id', protectRoute, getPostInsights);

// AI Assist Routes
router.get('/ai/caption', protectRoute, getAICaptionSuggestions);
router.get('/ai/hashtag', protectRoute, getAIHashtagSuggestions);
router.get('/ai/commentsuggest', protectRoute, getAICommentSuggestionsController);

export default router;
