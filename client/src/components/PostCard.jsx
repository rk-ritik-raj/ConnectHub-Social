import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart,
  FiMessageCircle,
  FiBookmark,
  FiSend,
  FiMoreHorizontal,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiCpu,
  FiTrash2,
  FiSmile,
  FiCheck,
} from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';

const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user: currentUser } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(currentUser?._id));
  const [isSaved, setIsSaved] = useState(currentUser?.savedPosts?.includes(post._id));
  const [isPinned, setIsPinned] = useState(post.pinned || false);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const [showHeartPop, setShowHeartPop] = useState(false);

  // Dropdown Menu
  const [showMenu, setShowMenu] = useState(false);
  
  // Comments Modal / Drawer
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  
  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiSuggestLoading, setAiSuggestLoading] = useState(false);

  // Emoji Picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    setIsLiked(likes.includes(currentUser?._id));
  }, [likes, currentUser]);

  useEffect(() => {
    setIsSaved(currentUser?.savedPosts?.includes(post._id));
  }, [currentUser, post._id]);

  // Double Tap to Like
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap < DOUBLE_PRESS_DELAY) {
      triggerLike(true); // force like
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    }
    setLastTap(now);
  };

  // Like / Unlike API call
  const triggerLike = async (forceLike = false) => {
    if (isLiked && forceLike) return; // already liked, do nothing
    
    try {
      const res = await api.post(`/posts/like/${post._id}`);
      if (res.data.success) {
        setLikes(res.data.likes);
      }
    } catch (err) {
      toast.error('Failed to update like status.');
    }
  };

  // Save / Unsave API call
  const handleSaveToggle = async () => {
    try {
      const res = await api.post(`/posts/save/${post._id}`);
      if (res.data.success) {
        setIsSaved(res.data.isSaved);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Action failed.');
    }
  };

  // Pin / Unpin Post
  const handlePinToggle = async () => {
    try {
      const res = await api.post(`/posts/pin/${post._id}`);
      if (res.data.success) {
        setIsPinned(res.data.pinned);
        toast.success(res.data.message);
        setShowMenu(false);
      }
    } catch (err) {
      toast.error('Failed to change pin status.');
    }
  };

  // Delete Post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await api.delete(`/posts/${post._id}`);
      if (res.data.success) {
        toast.success('Post deleted successfully');
        if (onPostDeleted) onPostDeleted(post._id);
      }
    } catch (err) {
      toast.error('Failed to delete post.');
    }
  };

  // Fetch comments
  const loadComments = async () => {
    setShowComments(true);
    setCommentsLoading(true);
    try {
      const res = await api.get(`/posts/${post._id}/comments`);
      if (res.data.success) {
        setCommentsList(res.data.comments || []);
      }
    } catch (error) {
      toast.error('Failed to load comments.');
    } finally {
      setCommentsLoading(false);
    }
  };

  // Add Comment
  const handleAddCommentSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`/posts/comment/${post._id}`, {
        text: newComment,
        parentCommentId: replyToId,
      });

      if (res.data.success) {
        if (!replyToId) {
          setCommentsList((prev) => [res.data.comment, ...prev]);
        } else {
          setCommentsList((prev) =>
            prev.map((c) => {
              if (c._id === replyToId) {
                return { ...c, replies: [...(c.replies || []), res.data.comment] };
              }
              return c;
            })
          );
        }
        setNewComment('');
        setReplyToId(null);
        setAiSuggestions([]);
        toast.success('Comment shared');
      }
    } catch (err) {
      toast.error('Failed to post comment.');
    }
  };

  // AI Comment suggestions
  const fetchAICommentSuggestions = async () => {
    setAiSuggestLoading(true);
    try {
      const res = await api.get(`/posts/ai/commentsuggest?caption=${encodeURIComponent(post.caption || '')}`);
      if (res.data.success) {
        setAiSuggestions(res.data.suggestions || []);
      }
    } catch (error) {
      toast.error('Could not get suggestions.');
    } finally {
      setAiSuggestLoading(false);
    }
  };

  // Extract hashtags
  const renderCaption = (text) => {
    if (!text) return '';
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <Link key={index} to={`/explore?search=${part.slice(1)}`} className="text-primary hover:underline font-semibold transition">
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <div className="glass-panel rounded-[32px] overflow-hidden shadow-xl max-w-[600px] w-full mx-auto select-none border-white/40 dark:border-white/5 hover:shadow-2xl transition-all duration-300">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4.5 border-b border-neutral-200/40 dark:border-neutral-800/40">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.user?.username}`} className="group shrink-0">
            <img
              src={post.user?.profilePic || 'https://api.dicebear.com/7.x/initials/svg?seed=' + post.user?.fullName}
              alt="Avatar"
              className="w-10 h-10 rounded-2xl object-cover border border-white/40 dark:border-white/5 shadow-sm group-hover:scale-102 transition duration-200 bg-neutral-100"
            />
          </Link>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${post.user?.username}`} className="text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-100 hover:text-primary transition duration-150">
                {post.user?.username}
              </Link>
              {isPinned && (
                <span className="text-[9px] bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                  Pinned
                </span>
              )}
            </div>
            {post.location && (
              <p className="text-[9px] text-neutral-450 dark:text-neutral-500 flex items-center gap-0.5 mt-0.5 font-bold uppercase tracking-wider">
                <FiMapPin size={9} /> {post.location}
              </p>
            )}
          </div>
        </div>

        {/* Action Button Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-2 cursor-pointer rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition"
          >
            <FiMoreHorizontal size={18} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-1.5 w-40 z-30 overflow-hidden"
              >
                {post.user?._id === currentUser?._id && (
                  <>
                    <button
                      onClick={handlePinToggle}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 flex items-center gap-2 cursor-pointer transition"
                    >
                      <FiBookmark size={14} />
                      {isPinned ? 'Unpin Post' : 'Pin Post'}
                    </button>
                    <button
                      onClick={handleDeletePost}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer transition"
                    >
                      <FiTrash2 size={14} />
                      Delete Post
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + `/profile/${post.user?.username}`);
                    toast.success('Profile link copied!');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 flex items-center gap-2 cursor-pointer transition"
                >
                  <FiSend size={14} />
                  Share Profile
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Post Media Area */}
      <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center overflow-hidden border-b border-neutral-200/40 dark:border-neutral-800/40">
        <div onClick={handleDoubleTap} className="w-full h-full cursor-pointer relative flex items-center justify-center">
          {post.media[activeMediaIndex]?.type === 'video' ? (
            <video src={post.media[activeMediaIndex]?.url} controls className="w-full h-full object-cover" />
          ) : (
            <img src={post.media[activeMediaIndex]?.url} alt="Media" className="w-full h-full object-cover" />
          )}

          {/* Heart Pop Overlay */}
          <AnimatePresence>
            {showHeartPop && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.25, 1], opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 pointer-events-none"
              >
                <FiHeart size={80} fill="#EF4444" className="text-red-500 drop-shadow-xl shadow-red-500/50" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Carousel Buttons */}
        {post.media?.length > 1 && (
          <>
            <button
              onClick={() => setActiveMediaIndex((prev) => (prev === 0 ? post.media.length - 1 : prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/55 text-neutral-850 dark:text-white p-2 rounded-full hover:bg-white dark:hover:bg-black transition backdrop-blur-md shadow-md cursor-pointer z-10 hover:scale-105 active:scale-95"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              onClick={() => setActiveMediaIndex((prev) => (prev === post.media.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/55 text-neutral-850 dark:text-white p-2 rounded-full hover:bg-white dark:hover:bg-black transition backdrop-blur-md shadow-md cursor-pointer z-10 hover:scale-105 active:scale-95"
            >
              <FiChevronRight size={16} />
            </button>
            {/* Carousel Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
              {post.media.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-350 ${
                    i === activeMediaIndex ? 'bg-primary scale-125 px-1.5' : 'bg-white/60'
                  }`}
                ></div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Interactions Panel */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4.5 text-neutral-600 dark:text-neutral-300">
            <button
              onClick={() => triggerLike()}
              className={`hover:opacity-75 hover:scale-110 transition cursor-pointer active:scale-90 ${isLiked ? 'text-red-500' : ''}`}
            >
              <FiHeart size={21} fill={isLiked ? '#EF4444' : 'none'} className={isLiked ? 'text-red-500' : ''} />
            </button>
            <button onClick={loadComments} className="hover:opacity-75 hover:scale-110 transition cursor-pointer active:scale-90">
              <FiMessageCircle size={21} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + `/profile/${post.user?.username}`);
                toast.success('Profile link copied!');
              }}
              className="hover:opacity-75 hover:scale-110 transition cursor-pointer active:scale-90"
            >
              <FiSend size={21} />
            </button>
          </div>
          <button
            onClick={handleSaveToggle}
            className={`hover:opacity-75 hover:scale-110 transition cursor-pointer active:scale-90 ${isSaved ? 'text-primary' : ''}`}
          >
            <FiBookmark size={21} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Likes Count */}
        <p className="text-xs font-black text-neutral-850 dark:text-neutral-100 text-left uppercase tracking-wider">
          {likes.length} {likes.length === 1 ? 'like' : 'likes'}
        </p>

        {/* Caption */}
        {post.caption && (
          <div className="text-xs text-neutral-805 dark:text-neutral-300 leading-relaxed text-left">
            <Link to={`/profile/${post.user?.username}`} className="font-black mr-2 text-neutral-900 dark:text-white hover:text-primary transition duration-150 uppercase tracking-wide">
              {post.user?.username}
            </Link>
            <span className="font-medium">{renderCaption(post.caption)}</span>
          </div>
        )}

        {/* View Comments count trigger */}
        {post.comments?.length > 0 && (
          <button onClick={loadComments} className="text-xs font-bold text-neutral-450 dark:text-neutral-500 hover:text-primary transition cursor-pointer block text-left">
            View all {post.comments.length} comments
          </button>
        )}
      </div>

      {/* Comments Drawer Modal Sheet */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-white/5 w-full max-w-lg rounded-[32px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4.5 border-b border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-50/50 dark:bg-neutral-950/50">
                <span className="font-black text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Comments Inbox ({commentsList.length})
                </span>
                <button
                  onClick={() => {
                    setShowComments(false);
                    setReplyToId(null);
                    setAiSuggestions([]);
                  }}
                  className="px-3.5 py-1.5 bg-neutral-200/50 dark:bg-neutral-800/50 hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition duration-200"
                >
                  Done
                </button>
              </div>

              {/* Comments Lists Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
                {commentsLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : commentsList.length === 0 ? (
                  <div className="text-center py-16">
                    <FiMessageCircle size={32} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
                    <p className="text-xs text-neutral-450 dark:text-neutral-500 font-semibold uppercase tracking-wider">No comments yet.</p>
                  </div>
                ) : (
                  commentsList.map((item) => (
                    <div key={item._id} className="space-y-4">
                      {/* Top Level Comment */}
                      <div className="flex items-start justify-between gap-3 text-left">
                        <div className="flex gap-3">
                          <img
                            src={item.user?.profilePic || 'https://api.dicebear.com/7.x/initials/svg?seed=' + item.user?.fullName}
                            alt="avatar"
                            className="w-8 h-8 rounded-xl object-cover border border-white/20 shadow-sm"
                          />
                          <div>
                            <p className="text-xs leading-relaxed text-neutral-800 dark:text-neutral-200">
                              <span className="font-black mr-1.5 text-neutral-900 dark:text-white hover:text-primary transition duration-150 uppercase tracking-wide">{item.user?.username}</span>
                              <span className="font-medium text-neutral-700 dark:text-neutral-300">{item.text}</span>
                            </p>
                            <div className="flex items-center gap-4.5 mt-1.5 text-[9px] text-neutral-400 dark:text-neutral-500 font-black uppercase tracking-wider">
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                              <button onClick={() => setReplyToId(item._id)} className="hover:text-primary cursor-pointer transition">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Comment replies lists */}
                      {item.replies?.length > 0 && (
                        <div className="pl-11 space-y-4 border-l border-neutral-200/40 dark:border-neutral-800/40 ml-4">
                          {item.replies.map((rep) => (
                            <div key={rep._id} className="flex gap-3 text-left">
                              <img
                                src={rep.user?.profilePic || 'https://api.dicebear.com/7.x/initials/svg?seed=' + rep.user?.fullName}
                                alt="avatar"
                                className="w-6 h-6 rounded-lg object-cover border border-white/20 bg-neutral-100"
                              />
                              <div>
                                <p className="text-xs leading-normal text-neutral-800 dark:text-neutral-200">
                                  <span className="font-black mr-1.5 text-neutral-900 dark:text-white hover:text-primary transition duration-150 uppercase tracking-wide">{rep.user?.username}</span>
                                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{rep.text}</span>
                                </p>
                                <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-1 font-semibold uppercase tracking-wider">
                                  {new Date(rep.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Suggested AI Quick Tags */}
              {aiSuggestions.length > 0 && (
                <div className="px-6 py-3.5 border-t border-neutral-200/40 dark:border-neutral-800/40 flex gap-2 overflow-x-auto bg-neutral-50/50 dark:bg-neutral-950/50 no-scrollbar select-none">
                  {aiSuggestions.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => { setNewComment(tag); setAiSuggestions([]); }}
                      className="px-3.5 py-2 bg-white dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/40 text-[9px] font-black uppercase tracking-wider rounded-full text-neutral-700 dark:text-neutral-300 cursor-pointer hover:border-primary hover:text-primary dark:hover:border-primary transition shrink-0 active:scale-95 shadow-sm"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Form Box */}
              <form onSubmit={handleAddCommentSubmit} className="p-4 border-t border-neutral-250/40 dark:border-neutral-800/40 bg-white/70 dark:bg-neutral-900/70 flex flex-col gap-2">
                {replyToId && (
                  <div className="flex items-center justify-between bg-neutral-100/50 dark:bg-neutral-950/50 px-3.5 py-2 rounded-xl border border-neutral-200/40 dark:border-neutral-800/40 text-[9px] font-black uppercase tracking-wider text-neutral-550 select-none">
                    <span>Replying to comment ...{replyToId.slice(-6)}</span>
                    <button type="button" onClick={() => setReplyToId(null)} className="text-red-500 font-bold hover:underline cursor-pointer">Cancel</button>
                  </div>
                )}
                
                <div className="flex items-center gap-3 relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-2 rounded-xl hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition"
                  >
                    <FiSmile size={19} />
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-14 left-0 z-40 shadow-2xl border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setNewComment((prev) => prev + emojiData.emoji);
                          setShowEmojiPicker(false);
                        }}
                      />
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder={replyToId ? "Add a reply..." : "Add a comment..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs bg-neutral-100/60 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-neutral-800 dark:text-neutral-100 font-semibold"
                  />

                  {/* AI suggestion trigger */}
                  <button
                    type="button"
                    onClick={fetchAICommentSuggestions}
                    disabled={aiSuggestLoading}
                    className="text-primary hover:text-primary-hover disabled:opacity-50 cursor-pointer p-2 rounded-xl hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition"
                    title="Generate AI suggested comments"
                  >
                    {aiSuggestLoading ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiCpu size={19} className="animate-pulse" />
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="text-primary hover:text-primary-hover font-black text-xs uppercase tracking-wider cursor-pointer disabled:opacity-40 px-3.5 py-2 transition"
                  >
                    Post
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostCard;
