import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Story from '../models/Story.js';

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments({ isReel: false });
    const totalReels = await Post.countDocuments({ isReel: true });
    const totalComments = await Comment.countDocuments();
    const totalStories = await Story.countDocuments();

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalPosts,
        totalReels,
        totalComments,
        totalStories,
      },
    });
  } catch (error) {
    console.error('Error in getAnalytics:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getRecentContent = async (req, res) => {
  try {
    // 5 latest users
    const users = await User.find().sort({ createdAt: -1 }).limit(5).select('username fullName email role profilePic');
    // 5 latest posts
    const posts = await Post.find().sort({ createdAt: -1 }).limit(5).populate('user', 'username profilePic');

    res.status(200).json({ success: true, users, posts });
  } catch (error) {
    console.error('Error in getRecentContent:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(id);
    
    // Clear out user contributions
    await Post.deleteMany({ user: id });
    await Comment.deleteMany({ user: id });
    await Story.deleteMany({ user: id });

    res.status(200).json({ success: true, message: 'User and all associated content deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUserByAdmin:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const deletePostByAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    await Post.findByIdAndDelete(id);
    await Comment.deleteMany({ post: id });

    res.status(200).json({ success: true, message: 'Post deleted successfully by Administrator' });
  } catch (error) {
    console.error('Error in deletePostByAdmin:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
