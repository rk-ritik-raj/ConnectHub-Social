import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { uploadMultipleToCloudinaryOrLocal } from '../utils/mediaUpload.js';
import { io } from '../server.js';
import { getReceiverSocketId } from '../sockets/socketHandler.js';
import { generateAICaption, generateAIHashtags, generateAICommentSuggestions } from '../utils/aiHelper.js';

export const createPost = async (req, res) => {
  const { caption, location, isReel } = req.body;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image or video' });
    }

    // Process multi-file uploads
    const mediaUrls = await uploadMultipleToCloudinaryOrLocal(req.files);
    
    // Structure media array with types
    const media = mediaUrls.map((url) => {
      const isVideo = url.match(/\.(mp4|mkv|mov)(\?|$)/i);
      return {
        url,
        type: isVideo ? 'video' : 'image',
      };
    });

    const post = new Post({
      user: req.user._id,
      media,
      caption,
      location,
      isReel: isReel === 'true' || isReel === true,
    });

    await post.save();
    
    const populatedPost = await post.populate('user', 'username fullName profilePic');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: populatedPost,
    });
  } catch (error) {
    console.error('Error in createPost:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getFeed = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  try {
    const currentUser = await User.findById(req.user._id);

    // Query posts by followed users and the user themselves
    const authorIds = [...currentUser.following, req.user._id];

    const posts = await Post.find({ user: { $in: authorIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username fullName profilePic isVerified')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 }, limit: 2 },
        populate: { path: 'user', select: 'username' },
      });

    const total = await Post.countDocuments({ user: { $in: authorIds } });

    // Track views (insights)
    await Post.updateMany(
      { _id: { $in: posts.map((p) => p._id) } },
      { $inc: { views: 1 } }
    );

    res.status(200).json({
      success: true,
      posts,
      currentPage: page,
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    console.error('Error in getFeed:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getExplore = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const skip = (page - 1) * limit;

  try {
    // Show posts excluding active user's own posts for discovery
    const posts = await Post.find({ user: { $ne: req.user._id } })
      .sort({ views: -1, createdAt: -1 }) // Sort by views/popularity
      .skip(skip)
      .limit(limit)
      .populate('user', 'username fullName profilePic isVerified');

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error('Error in getExplore:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getUserPosts = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ pinned: -1, createdAt: -1 }) // Pinned posts at top
      .populate('user', 'username fullName profilePic');

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error('Error in getUserPosts:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Verify ownership or check if Admin
    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    await Post.findByIdAndDelete(id);
    // Delete associated comments
    await Comment.deleteMany({ post: id });

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error in deletePost:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const likeUnlikePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike post
      post.likes = post.likes.filter((uid) => uid.toString() !== req.user._id.toString());
      await post.save();
      res.status(200).json({ success: true, message: 'Post unliked', likes: post.likes });
    } else {
      // Like post
      post.likes.push(req.user._id);
      await post.save();

      // Send Like Notification (if liking someone else's post)
      if (post.user.toString() !== req.user._id.toString()) {
        const notification = new Notification({
          sender: req.user._id,
          receiver: post.user,
          type: 'like',
          post: post._id,
        });
        await notification.save();

        const populatedNotification = await notification.populate('sender', 'username fullName profilePic');
        const receiverSocketId = getReceiverSocketId(post.user.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newNotification', populatedNotification);
        }
      }

      res.status(200).json({ success: true, message: 'Post liked', likes: post.likes });
    }
  } catch (error) {
    console.error('Error in likeUnlikePost:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const saveUnsavePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const user = await User.findById(req.user._id);
    const isSaved = user.savedPosts.includes(id);

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter((pid) => pid.toString() !== id);
      await user.save();
      res.status(200).json({ success: true, message: 'Post removed from saved list', isSaved: false });
    } else {
      user.savedPosts.push(id);
      await user.save();
      res.status(200).json({ success: true, message: 'Post saved successfully', isSaved: true });
    }
  } catch (error) {
    console.error('Error in saveUnsavePost:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: { path: 'user', select: 'username fullName profilePic' },
    });
    
    res.status(200).json({ success: true, posts: user.savedPosts });
  } catch (error) {
    console.error('Error in getSavedPosts:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const addComment = async (req, res) => {
  const { id } = req.params; // Post id
  const { text, parentCommentId } = req.body;

  try {
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = new Comment({
      post: id,
      user: req.user._id,
      text: text.trim(),
      parentComment: parentCommentId || null,
    });

    await comment.save();

    // Push into Post comments list
    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await comment.populate('user', 'username fullName profilePic');

    // Notify post creator
    if (post.user.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        sender: req.user._id,
        receiver: post.user,
        type: 'comment',
        post: post._id,
        comment: comment._id,
      });
      await notification.save();

      const populatedNotification = await notification.populate('sender', 'username fullName profilePic');
      const receiverSocketId = getReceiverSocketId(post.user.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newNotification', populatedNotification);
      }
    }

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (error) {
    console.error('Error in addComment:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getPostComments = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch top-level comments first
    const comments = await Comment.find({ post: id, parentComment: null })
      .sort({ createdAt: -1 })
      .populate('user', 'username fullName profilePic');

    // Fetch replies for each comment
    const populatedComments = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .sort({ createdAt: 1 })
          .populate('user', 'username fullName profilePic');
        return {
          ...comment.toObject(),
          replies,
        };
      })
    );

    res.status(200).json({ success: true, comments: populatedComments });
  } catch (error) {
    console.error('Error in getPostComments:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const togglePinPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only post creator can pin' });
    }

    post.pinned = !post.pinned;
    await post.save();

    res.status(200).json({
      success: true,
      message: post.pinned ? 'Post pinned successfully' : 'Post unpinned successfully',
      pinned: post.pinned,
    });
  } catch (error) {
    console.error('Error in togglePinPost:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getPostInsights = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.status(200).json({
      success: true,
      insights: {
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        views: post.views,
        shares: post.shares,
      },
    });
  } catch (error) {
    console.error('Error in getPostInsights:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// AI Controller Triggers
export const getAICaptionSuggestions = async (req, res) => {
  const { prompt } = req.query;
  if (!prompt) {
    return res.status(400).json({ success: false, message: 'Prompt description is required' });
  }
  try {
    const caption = await generateAICaption(prompt);
    res.status(200).json({ success: true, caption });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAIHashtagSuggestions = async (req, res) => {
  const { prompt } = req.query;
  if (!prompt) {
    return res.status(400).json({ success: false, message: 'Prompt is required' });
  }
  try {
    const hashtags = await generateAIHashtags(prompt);
    res.status(200).json({ success: true, hashtags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAICommentSuggestionsController = async (req, res) => {
  const { caption } = req.query;
  try {
    const suggestions = await generateAICommentSuggestions(caption || '');
    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReels = async (req, res) => {
  try {
    const reels = await Post.find({ isReel: true })
      .sort({ createdAt: -1 })
      .populate('user', 'username fullName profilePic isVerified');
    res.status(200).json({ success: true, reels });
  } catch (error) {
    console.error('Error in getReels:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
