import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { uploadToCloudinaryOrLocal } from '../utils/mediaUpload.js';
import { io } from '../server.js';
import { getReceiverSocketId } from '../sockets/socketHandler.js';

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Determine if the logged-in user follows this profile
    const isFollowing = user.followers.includes(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        isFollowing,
      },
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const updateUserProfile = async (req, res) => {
  const { fullName, bio, website, isPrivate } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName) user.fullName = fullName.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (website !== undefined) user.website = website.trim();
    if (isPrivate !== undefined) user.isPrivate = isPrivate;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const imageUrl = await uploadToCloudinaryOrLocal(req.file);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: imageUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePic: imageUrl,
      user,
    });
  } catch (error) {
    console.error('Error in updateAvatar:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const followUnfollowUser = async (req, res) => {
  const { id } = req.params; // Target user's id

  try {
    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow logic
      currentUser.following = currentUser.following.filter((uid) => uid.toString() !== id);
      targetUser.followers = targetUser.followers.filter((uid) => uid.toString() !== req.user._id.toString());
      
      await Promise.all([currentUser.save(), targetUser.save()]);

      res.status(200).json({ success: true, message: 'Unfollowed successfully', isFollowing: false });
    } else {
      // Follow logic
      currentUser.following.push(id);
      targetUser.followers.push(req.user._id);

      await Promise.all([currentUser.save(), targetUser.save()]);

      // Create Follow Notification
      const notification = new Notification({
        sender: req.user._id,
        receiver: id,
        type: 'follow',
      });
      await notification.save();

      // Populate sender profile info for immediate real-time rendering
      const populatedNotification = await notification.populate('sender', 'username fullName profilePic');

      // Socket emit if target user is online
      const targetSocketId = getReceiverSocketId(id);
      if (targetSocketId) {
        io.to(targetSocketId).emit('newNotification', populatedNotification);
      }

      res.status(200).json({ success: true, message: 'Followed successfully', isFollowing: true });
    }
  } catch (error) {
    console.error('Error in followUnfollowUser:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // Find users whom active user is not following, and exclude active user
    const suggested = await User.find({
      _id: { $nin: [...currentUser.following, req.user._id] },
    })
      .select('username fullName profilePic followers')
      .limit(10);

    res.status(200).json({ success: true, users: suggested });
  } catch (error) {
    console.error('Error in getSuggestedUsers:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const searchUsers = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ success: false, message: 'Query parameter is required' });
  }

  try {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
      ],
    }).select('username fullName profilePic followers');

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error in searchUsers:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getFollowers = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate('followers', 'username fullName profilePic followers');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, followers: user.followers });
  } catch (error) {
    console.error('Error in getFollowers:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getFollowing = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate('following', 'username fullName profilePic followers');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, following: user.following });
  } catch (error) {
    console.error('Error in getFollowing:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both fields are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
  }

  try {
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in changePassword:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
