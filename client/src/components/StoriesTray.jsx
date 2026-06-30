import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

const StoriesTray = () => {
  const { user: currentUser } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Story Viewer Modal
  const [activeGroupIndex, setActiveGroupIndex] = useState(null); // Index in feed
  const [activeStoryIndex, setActiveStoryIndex] = useState(0); // Index in feed[group].stories
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const fetchStories = async () => {
    try {
      const res = await api.get('/stories/feed');
      if (res.data.success) {
        setFeed(res.data.feed || []);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Handle Story Upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size too large (max 15MB)');
      return;
    }

    const formData = new FormData();
    formData.append('media', file);

    setUploading(true);
    try {
      const res = await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        toast.success('Story shared successfully!');
        fetchStories();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload story.');
    } finally {
      setUploading(false);
    }
  };

  // Story Viewer Timer Logic
  useEffect(() => {
    if (activeGroupIndex === null) return;

    // Reset progress
    setProgress(0);

    // Track Viewer API call for the current story
    const currentStory = feed[activeGroupIndex]?.stories[activeStoryIndex];
    if (currentStory) {
      api.post(`/stories/view/${currentStory._id}`).catch((err) => {});
    }

    // Tick progress bar every 50ms
    const duration = 5000; // 5 seconds
    const intervalTime = 50;
    const increment = (intervalTime / duration) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeGroupIndex, activeStoryIndex]);

  const handleNext = () => {
    if (activeGroupIndex === null) return;

    const currentGroup = feed[activeGroupIndex];
    if (activeStoryIndex < currentGroup.stories.length - 1) {
      // Next story in current group
      setActiveStoryIndex((prev) => prev + 1);
    } else if (activeGroupIndex < feed.length - 1) {
      // Next user group
      setActiveGroupIndex((prev) => prev + 1);
      setActiveStoryIndex(0);
    } else {
      // End of stories
      closeViewer();
    }
  };

  const handlePrev = () => {
    if (activeGroupIndex === null) return;

    if (activeStoryIndex > 0) {
      // Previous story in current group
      setActiveStoryIndex((prev) => prev - 1);
    } else if (activeGroupIndex > 0) {
      // Previous user group
      const prevGroup = feed[activeGroupIndex - 1];
      setActiveGroupIndex((prev) => prev - 1);
      setActiveStoryIndex(prevGroup.stories.length - 1);
    } else {
      // Restart current story
      setProgress(0);
    }
  };

  const closeViewer = () => {
    setActiveGroupIndex(null);
    setActiveStoryIndex(0);
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const activeGroup = activeGroupIndex !== null ? feed[activeGroupIndex] : null;
  const activeStory = activeGroup ? activeGroup.stories[activeStoryIndex] : null;

  return (
    <div className="w-full select-none">
      {/* Tray List */}
      <div className="flex gap-4 overflow-x-auto glass-panel p-4 rounded-3xl no-scrollbar items-center shadow-lg border-white/40 dark:border-white/5">
        {/* Active User Add Story Circle */}
        <div className="flex flex-col items-center gap-2 shrink-0 relative">
          <label className="cursor-pointer relative group">
            <div className="w-14 h-14 rounded-full border border-neutral-200/50 dark:border-neutral-800/50 p-0.5 group-hover:scale-105 transition-all duration-300 shadow-sm bg-white dark:bg-neutral-900">
              <img
                src={
                  currentUser?.profilePic ||
                  'https://api.dicebear.com/7.x/initials/svg?seed=' + currentUser?.fullName
                }
                alt="Your avatar"
                className="w-full h-full rounded-full object-cover border border-neutral-200 dark:border-neutral-850"
              />
            </div>
            {uploading ? (
              <div className="absolute inset-0 bg-neutral-950/60 rounded-full flex items-center justify-center backdrop-blur-xs">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="absolute bottom-0 right-0 bg-primary hover:bg-primary-hover text-white p-1.5 rounded-full border-2 border-white dark:border-neutral-900 shadow-md flex items-center justify-center transition hover:scale-110 active:scale-90">
                <FiPlus size={10} className="stroke-[3]" />
              </div>
            )}
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-black uppercase tracking-wider">Your Story</span>
        </div>

        {/* Group circles for other users */}
        {loading ? (
          <div className="flex gap-4 animate-premium-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-14 h-14 bg-neutral-200/40 dark:bg-neutral-800/40 rounded-full shrink-0"></div>
            ))}
          </div>
        ) : (
          feed.map((group, idx) => {
            const isSelf = group.user._id === currentUser?._id;

            return (
              <div
                key={group.user._id}
                onClick={() => {
                  setActiveGroupIndex(idx);
                  setActiveStoryIndex(0);
                }}
                className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
              >
                <div className="w-[60px] h-[60px] rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 group-hover:scale-105 transition-all duration-300 shadow-md">
                  <img
                    src={
                      group.user.profilePic ||
                      'https://api.dicebear.com/7.x/initials/svg?seed=' + group.user.fullName
                    }
                    alt={group.user.username}
                    className="w-full h-full rounded-full object-cover border border-white dark:border-neutral-950 bg-neutral-50 dark:bg-neutral-900"
                  />
                </div>
                <span className="text-[10px] text-neutral-800 dark:text-neutral-300 font-bold truncate w-14 text-center">
                  {isSelf ? 'Your Story' : group.user.username}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Story Viewer Dialog Overlay */}
      <AnimatePresence>
        {activeGroup && activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-955/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-[420px] bg-neutral-900 rounded-[32px] h-[80vh] md:h-[680px] overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10"
            >
              {/* Header timelines */}
              <div className="absolute top-4 left-0 right-0 z-20 px-4">
                {/* Progress bars rows */}
                <div className="flex gap-1.5 mb-4">
                  {activeGroup.stories.map((story, i) => (
                    <div key={story._id} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-75"
                        style={{
                          width:
                            i < activeStoryIndex
                              ? '100%'
                              : i === activeStoryIndex
                              ? `${progress}%`
                              : '0%',
                        }}
                      ></div>
                    </div>
                  ))}
                </div>

                {/* Creator details */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        activeGroup.user.profilePic ||
                        'https://api.dicebear.com/7.x/initials/svg?seed=' + activeGroup.user.fullName
                      }
                      alt="creator"
                      className="w-9 h-9 rounded-xl object-cover border border-white/20 shadow-sm bg-neutral-800"
                    />
                    <div className="text-left">
                      <p className="text-xs font-black tracking-wide uppercase">{activeGroup.user.username}</p>
                      <p className="text-[10px] text-white/60 font-semibold mt-0.5">
                        {new Date(activeStory.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={closeViewer}
                    className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 cursor-pointer transition active:scale-90 border border-white/10"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>

              {/* Media Body container */}
              <div className="flex-1 flex items-center justify-center relative bg-black">
                {activeStory.mediaType === 'video' ? (
                  <video src={activeStory.mediaUrl} autoPlay className="w-full h-full object-contain" />
                ) : (
                  <img src={activeStory.mediaUrl} alt="Story" className="w-full h-full object-contain" />
                )}

                {/* Navigation overlays */}
                <div className="absolute inset-0 flex">
                  <div onClick={handlePrev} className="w-1/3 h-full cursor-pointer"></div>
                  <div className="w-1/3 h-full"></div>
                  <div onClick={handleNext} className="w-1/3 h-full cursor-pointer"></div>
                </div>

                {/* Slide buttons */}
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-sm transition cursor-pointer z-10 hover:scale-105 active:scale-95"
                >
                  <FiChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-sm transition cursor-pointer z-10 hover:scale-105 active:scale-95"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoriesTray;
