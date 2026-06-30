import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiVolume2,
  FiVolumeX,
  FiPlay,
  FiX,
} from 'react-icons/fi';
import PostCard from '../components/PostCard';

const ReelCard = ({ reel, isMuted, onMuteToggle, onPostDeleted }) => {
  const { user: currentUser } = useAuth();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(reel.likes || []);
  const [isLiked, setIsLiked] = useState(reel.likes?.includes(currentUser?._id));
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  // Comments drawer trigger
  const [showComments, setShowComments] = useState(false);

  // Play / Pause video via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().then(() => {
              setIsPlaying(true);
            }).catch(() => {});
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Update volume when global mute changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Click on video toggles play / pause
  const handleVideoClick = () => {
    if (isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    } else {
      videoRef.current?.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  // Double tap to like
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      triggerLike(true);
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    }
    setLastTap(now);
  };

  const triggerLike = async (forceLike = false) => {
    if (isLiked && forceLike) return;
    try {
      const res = await api.post(`/posts/like/${reel._id}`);
      if (res.data.success) {
        setLikes(res.data.likes);
        setIsLiked(res.data.likes.includes(currentUser?._id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="snap-start snap-always w-full h-[95%] relative bg-neutral-950 flex items-center justify-center rounded-3xl overflow-hidden shadow-2xl border border-neutral-900 select-none">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={reel.media[0]?.url}
        loop
        playsInline
        onClick={handleVideoClick}
        onDoubleClick={handleDoubleTap}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Heart Pop Animation */}
      <AnimatePresence>
        {showHeartPop && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.25, 1], opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 pointer-events-none"
          >
            <FiHeart size={90} fill="#EF4444" className="text-red-500 drop-shadow-xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Status Icon Indicator Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/15 pointer-events-none z-10">
          <div className="p-3.5 bg-black/50 text-white rounded-full backdrop-blur-sm shadow-md">
            <FiPlay size={24} className="ml-0.5" />
          </div>
        </div>
      )}

      {/* Sound Controller Toggle Overlay */}
      <button
        onClick={onMuteToggle}
        className="absolute top-5 right-5 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-sm cursor-pointer transition z-20 active:scale-90"
      >
        {isMuted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
      </button>

      {/* Bottom Text Metadata Overlay */}
      <div className="absolute bottom-5 left-5 right-16 z-20 text-white text-left space-y-3.5 pointer-events-none">
        {/* Creator Info */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <Link to={`/profile/${reel.user?.username}`} className="flex items-center gap-2.5 hover:opacity-90 transition">
            <img
              src={
                reel.user?.profilePic ||
                'https://api.dicebear.com/7.x/initials/svg?seed=' + reel.user?.fullName
              }
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-white/25 shadow-sm"
            />
            <span className="text-xs font-black tracking-wide">{reel.user?.username}</span>
          </Link>
          <span className="text-[9px] uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full font-extrabold backdrop-blur-sm">Reels</span>
        </div>

        {/* Caption */}
        {reel.caption && (
          <p className="text-xs text-white/90 leading-relaxed font-medium pr-4 line-clamp-2 select-text">
            {reel.caption}
          </p>
        )}

        {/* Music Scrolling Animation effect */}
        <div className="flex items-center gap-2 text-[10px] text-white/60 font-semibold select-none">
          <span>🎵</span>
          <span className="truncate w-36">
            Original Audio • {reel.user?.username}
          </span>
        </div>
      </div>

      {/* Right Side Interactions Panel */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col items-center gap-5 text-white">
        {/* Like */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => triggerLike()}
            className={`p-3 bg-black/45 hover:bg-black/60 rounded-full transition backdrop-blur-sm cursor-pointer hover:scale-105 active:scale-95 ${
              isLiked ? 'text-red-500' : 'text-white'
            }`}
          >
            <FiHeart size={18} fill={isLiked ? '#EF4444' : 'none'} className={isLiked ? 'text-red-500' : ''} />
          </button>
          <span className="text-[10px] font-extrabold drop-shadow-md">{likes.length}</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => setShowComments(true)}
            className="p-3 bg-black/45 hover:bg-black/60 rounded-full transition backdrop-blur-sm cursor-pointer hover:scale-105 active:scale-95"
          >
            <FiMessageCircle size={18} />
          </button>
          <span className="text-[10px] font-extrabold drop-shadow-md">{reel.comments?.length || 0}</span>
        </div>

        {/* Share Link */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + `/profile/${reel.user?.username}`);
              toast.success('Link copied!');
            }}
            className="p-3 bg-black/45 hover:bg-black/60 rounded-full transition backdrop-blur-sm cursor-pointer hover:scale-105 active:scale-95"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>

      {/* Comment Drawer overlays */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm z-30 flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-t-3xl max-h-[75%] flex flex-col overflow-hidden text-neutral-800 dark:text-white"
            >
              <div className="relative w-full flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
                  <span className="font-extrabold text-[9px] uppercase tracking-wider text-neutral-450 dark:text-neutral-500">
                    Reel Comments
                  </span>
                  <button
                    onClick={() => setShowComments(false)}
                    className="text-xs font-extrabold text-primary hover:text-primary-hover cursor-pointer p-1 transition"
                  >
                    Close
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[450px] p-2 no-scrollbar">
                  <PostCard post={reel} onPostDeleted={onPostDeleted} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Reels = () => {
  const [reelsList, setReelsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const fetchReels = async () => {
    try {
      const res = await api.get('/posts/reels');
      if (res.data.success) {
        setReelsList(res.data.reels || []);
      }
    } catch (error) {
      toast.error('Failed to load Reels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handlePostDeleted = (deletedReelId) => {
    setReelsList((prev) => prev.filter((r) => r._id !== deletedReelId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[85vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-60px)] md:h-[calc(100vh-20px)] p-2 md:p-4 select-none">
      {reelsList.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-8 rounded-3xl max-w-sm">
          <p className="text-neutral-500 font-medium text-xs">No Reels have been shared yet.</p>
        </div>
      ) : (
        <div className="w-full max-w-[400px] h-full snap-y snap-mandatory overflow-y-scroll rounded-3xl border border-neutral-200 dark:border-neutral-850 no-scrollbar bg-black flex flex-col items-center">
          {reelsList.map((reel) => (
            <div key={reel._id} className="w-full h-full snap-start snap-always shrink-0 flex items-center justify-center p-1 md:p-2">
              <ReelCard
                reel={reel}
                isMuted={isMuted}
                onMuteToggle={() => setIsMuted(!isMuted)}
                onPostDeleted={handlePostDeleted}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reels;
