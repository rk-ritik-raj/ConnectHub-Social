import Story from '../models/Story.js';
import User from '../models/User.js';
import { uploadToCloudinaryOrLocal } from '../utils/mediaUpload.js';

export const createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a photo or video for your story' });
    }

    const mediaUrl = await uploadToCloudinaryOrLocal(req.file);
    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    const story = new Story({
      user: req.user._id,
      mediaUrl,
      mediaType,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await story.save();
    const populatedStory = await story.populate('user', 'username fullName profilePic');

    res.status(201).json({
      success: true,
      message: 'Story uploaded successfully',
      story: populatedStory,
    });
  } catch (error) {
    console.error('Error in createStory:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getStoriesFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const followingIds = [...currentUser.following, req.user._id];

    // Find all active stories from followed users
    const activeStories = await Story.find({
      user: { $in: followingIds },
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: 1 })
      .populate('user', 'username fullName profilePic');

    // Group stories by creator user node
    const grouped = {};
    activeStories.forEach((story) => {
      const userId = story.user._id.toString();
      if (!grouped[userId]) {
        grouped[userId] = {
          user: story.user,
          stories: [],
        };
      }
      grouped[userId].stories.push(story);
    });

    res.status(200).json({ success: true, feed: Object.values(grouped) });
  } catch (error) {
    console.error('Error in getStoriesFeed:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const viewStory = async (req, res) => {
  const { id } = req.params;

  try {
    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found or expired' });
    }

    if (!story.viewers.includes(req.user._id)) {
      story.viewers.push(req.user._id);
      await story.save();
    }

    res.status(200).json({ success: true, message: 'Story marked as viewed' });
  } catch (error) {
    console.error('Error in viewStory:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
