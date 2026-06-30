import React, { useState, useEffect } from 'react';
import SuggestionsSidebar from '../components/SuggestionsSidebar';
import StoriesTray from '../components/StoriesTray';
import PostCard from '../components/PostCard';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiCamera } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  const fetchFeed = async (pageNumber = 1, append = false) => {
    if (pageNumber === 1) setLoading(true);
    else setFetchingMore(true);

    try {
      const res = await api.get(`/posts/feed?page=${pageNumber}&limit=5`);
      if (res.data.success) {
        setPosts((prev) => (append ? [...prev, ...(res.data.posts || [])] : res.data.posts || []));
        setHasMore(res.data.hasMore || false);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
      toast.error('Failed to load feed posts.');
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchFeed(1, false);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage, true);
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  return (
    <div className="max-w-[1012px] mx-auto py-8 flex gap-8 relative z-10 px-4 md:px-0">
      {/* Center Feed Column */}
      <div className="flex-1 max-w-[620px] mx-auto space-y-6">
        {/* Stories Tray Section */}
        <StoriesTray />

        {/* Posts List / Skeleton Loading States */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="glass-panel rounded-3xl p-5 space-y-4 animate-premium-pulse select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-250/30 dark:bg-neutral-800/50 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-28 h-3 bg-neutral-250/30 dark:bg-neutral-800/50 rounded-md"></div>
                    <div className="w-20 h-2 bg-neutral-250/30 dark:bg-neutral-800/50 rounded-md"></div>
                  </div>
                </div>
                <div className="w-full aspect-square bg-neutral-250/30 dark:bg-neutral-800/50 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel py-20 px-8 text-center shadow-xl select-none flex flex-col items-center justify-center rounded-[32px] border-white/40 dark:border-white/5"
          >
            <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-6 text-neutral-500 shadow-inner">
              <FiCamera size={28} />
            </div>
            <h3 className="text-lg font-black font-display mb-2 text-neutral-800 dark:text-white">
              Welcome to ConnectHub
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed mb-6 font-medium">
              When creators you follow share photos and videos, they'll show up right here in your home feed. Follow suggested users to get started!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, idx) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05, ease: 'easeOut' }}
              >
                <PostCard post={post} onPostDeleted={handlePostDeleted} />
              </motion.div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={fetchingMore}
                  className="px-6 py-3 glass-panel glass-panel-hover text-neutral-800 dark:text-neutral-250 text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer hover:scale-102 active:scale-98 transition disabled:opacity-40"
                >
                  {fetchingMore ? 'Loading feed...' : 'Load More Posts'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggestions Sidebar Column - Desktop */}
      <div className="hidden lg:block w-[340px] shrink-0 sticky top-28 self-start">
        <SuggestionsSidebar />
      </div>
    </div>
  );
};

export default Home;
