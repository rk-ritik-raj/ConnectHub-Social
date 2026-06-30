import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiHeart, FiMessageCircle, FiLayers, FiX } from 'react-icons/fi';
import PostCard from '../components/PostCard';

const Explore = () => {
  const { user: currentUser } = useAuth();
  const [explorePosts, setExplorePosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Selected post for Modal
  const [selectedPost, setSelectedPost] = useState(null);

  // Load explore popular posts
  useEffect(() => {
    const fetchExplore = async () => {
      setLoading(true);
      try {
        const res = await api.get('/posts/explore');
        if (res.data.success) {
          setExplorePosts(res.data.posts || []);
        }
      } catch (error) {
        toast.error('Failed to load explore feed.');
      } finally {
        setLoading(false);
      }
    };

    fetchExplore();
  }, []);

  // Handle Search Input Change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get(`/users/search?query=${encodeURIComponent(searchQuery)}`);
        if (res.data.success) {
          setSearchResults(res.data.users || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle follow toggle from search results
  const handleFollowToggle = async (userId) => {
    try {
      const res = await api.post(`/users/follow/${userId}`);
      if (res.data.success) {
        setSearchResults((prev) =>
          prev.map((u) => {
            if (u._id === userId) {
              const followersArr = res.data.isFollowing
                ? [...(u.followers || []), currentUser._id]
                : (u.followers || []).filter((id) => id !== currentUser._id);
              return { ...u, followers: followersArr };
            }
            return u;
          })
        );
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Follow action failed.');
    }
  };

  const handlePostDeleted = (postId) => {
    setExplorePosts((prev) => prev.filter((p) => p._id !== postId));
    setSelectedPost(null);
  };

  return (
    <div className="max-w-[1012px] mx-auto py-8 select-none text-left relative z-10 px-4 md:px-0">
      {/* Search Input Bar */}
      <div className="max-w-md mx-auto mb-10 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search creators, keywords..."
          className="w-full pl-11 pr-10 py-3.5 text-xs bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition shadow-md text-neutral-800 dark:text-neutral-100 font-semibold"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer p-0.5 rounded-lg transition"
            >
              <FiX size={15} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Render Search Results if query exists */}
      <AnimatePresence>
        {searchQuery.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-md mx-auto glass-panel p-5 rounded-[28px] shadow-2xl space-y-4 mb-10 text-left border-white/40 dark:border-white/5"
          >
            <h3 className="text-[10px] font-black text-neutral-450 dark:text-neutral-400 uppercase tracking-widest">
              Search Results
            </h3>
            {searchLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-xs text-neutral-450 dark:text-neutral-500 py-6 text-center font-semibold">No creators found.</p>
            ) : (
              <div className="space-y-4">
                {searchResults.map((item) => {
                  const isSelf = item._id === currentUser?._id;
                  const itemIsFollowing = item.followers?.includes(currentUser?._id);

                  return (
                    <div key={item._id} className="flex items-center justify-between">
                      <Link to={`/profile/${item.username}`} className="flex items-center gap-3 hover:opacity-85 transition">
                        <img
                          src={item.profilePic || 'https://api.dicebear.com/7.x/initials/svg?seed=' + item.fullName}
                          alt={item.username}
                          className="w-10 h-10 rounded-xl object-cover border border-white/20 bg-neutral-100 shadow-sm"
                        />
                        <div className="text-left">
                          <p className="text-xs font-black text-neutral-800 dark:text-neutral-100 uppercase tracking-wider">
                            {item.username}
                          </p>
                          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-semibold">{item.fullName}</p>
                        </div>
                      </Link>

                      {!isSelf && (
                        <button
                          onClick={() => handleFollowToggle(item._id)}
                          className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition shadow-sm active:scale-95 ${
                            itemIsFollowing
                              ? 'bg-neutral-200/50 hover:bg-neutral-300 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                              : 'bg-primary hover:bg-primary-hover text-white'
                          }`}
                        >
                          {itemIsFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explore popular posts Grid */}
      <h3 className="text-[10px] font-black text-neutral-550 dark:text-neutral-400 uppercase tracking-widest text-left mb-6">
        Explore Feed
      </h3>
      {loading ? (
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="aspect-square bg-neutral-200/40 dark:bg-neutral-800/40 rounded-3xl animate-premium-pulse"></div>
          ))}
        </div>
      ) : explorePosts.length === 0 ? (
        <div className="text-center py-20 glass-panel p-6 rounded-3xl">
          <p className="text-xs text-neutral-450 dark:text-neutral-500 font-semibold uppercase tracking-wider">No posts to display in explore feed.</p>
        </div>
      ) : (
        /* Pinterest-inspired masonry layout grid */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {explorePosts.map((post, index) => {
            // Apply uneven row spans to create a masonry card style
            const isTall = index % 5 === 1 || index % 5 === 3;
            return (
              <motion.div
                key={post._id}
                onClick={() => setSelectedPost(post)}
                whileHover={{ scale: 1.015 }}
                className={`relative rounded-3xl overflow-hidden group cursor-pointer border border-white/20 dark:border-white/5 shadow-md hover:shadow-xl bg-neutral-100 dark:bg-neutral-950 transition-all duration-300 ${
                  isTall ? 'aspect-[3/4] md:row-span-2 h-full' : 'aspect-square'
                }`}
              >
                {post.media[0]?.type === 'video' ? (
                  <video src={post.media[0]?.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={post.media[0]?.url} alt="Media thumbnail" className="w-full h-full object-cover" />
                )}

                {post.media?.length > 1 && (
                  <div className="absolute top-3.5 right-3.5 text-white drop-shadow-md z-10">
                    <FiLayers size={16} />
                  </div>
                )}

                {/* Hover Stats */}
                <div className="absolute inset-0 bg-neutral-955/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white font-bold transition duration-200 z-10">
                  <div className="flex items-center gap-1.5 hover:scale-105 transition-transform duration-150">
                    <FiHeart size={18} fill="white" />
                    <span className="text-xs font-black">{post.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:scale-105 transition-transform duration-150">
                    <FiMessageCircle size={18} fill="white" />
                    <span className="text-xs font-black">{post.comments?.length || 0}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-955/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-w-[600px] w-full bg-white dark:bg-neutral-900 border border-white/20 dark:border-white/5 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute -top-12 right-0 text-white hover:text-neutral-300 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer z-50 bg-black/40 px-4.5 py-2.5 rounded-full backdrop-blur-sm shadow-sm transition active:scale-95 border border-white/10"
              >
                <FiX size={15} /> Close
              </button>
              <PostCard post={selectedPost} onPostDeleted={handlePostDeleted} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Explore;
