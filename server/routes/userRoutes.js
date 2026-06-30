import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  getUserProfile,
  updateUserProfile,
  updateAvatar,
  followUnfollowUser,
  getSuggestedUsers,
  searchUsers,
  getFollowers,
  getFollowing,
  changePassword,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/profile/:username', protectRoute, getUserProfile);
router.put('/profile', protectRoute, updateUserProfile);
router.put('/profile/avatar', protectRoute, upload.single('avatar'), updateAvatar);
router.post('/follow/:id', protectRoute, followUnfollowUser);
router.get('/suggested', protectRoute, getSuggestedUsers);
router.get('/search', protectRoute, searchUsers);
router.get('/followers/:userId', protectRoute, getFollowers);
router.get('/following/:userId', protectRoute, getFollowing);
router.put('/change-password', protectRoute, changePassword);

export default router;
