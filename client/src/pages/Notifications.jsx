import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiHeart, FiUserPlus, FiMessageCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        // Reset unread counters by marking read on the backend
        await api.put('/notifications/read');
      }
    } catch (err) {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] relative z-10">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 select-none text-left relative z-10 px-4 md:px-0">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 md:p-8 shadow-2xl rounded-[32px] border-white/40 dark:border-white/5"
      >
        <h2 className="text-sm font-black mb-6 text-neutral-800 dark:text-white pb-4 border-b border-neutral-200/40 dark:border-neutral-800/40 uppercase tracking-widest">
          Notifications
        </h2>

        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-5 text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-800 shadow-inner">
              <FiHeart size={24} />
            </div>
            <p className="text-xs text-neutral-450 dark:text-neutral-500 font-semibold uppercase tracking-wider">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200/40 dark:divide-neutral-800/40">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className="flex items-center justify-between gap-4 py-4.5 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3.5">
                  <Link to={`/profile/${notif.sender?.username}`} className="shrink-0 hover:opacity-85 transition group">
                    <div className="relative">
                      <img
                        src={
                          notif.sender?.profilePic ||
                          'https://api.dicebear.com/7.x/initials/svg?seed=' + notif.sender?.fullName
                        }
                        alt="Sender"
                        className="w-10 h-10 rounded-xl object-cover border border-white/40 dark:border-white/5 shadow-sm group-hover:scale-102 transition duration-200"
                      />
                      {/* Icon overlay badge */}
                      <span className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white dark:border-neutral-900 shadow-md text-white flex items-center justify-center ${
                        notif.type === 'follow' ? 'bg-indigo-500' : notif.type === 'like' ? 'bg-red-500' : 'bg-green-500'
                      }`}>
                        {notif.type === 'follow' && <FiUserPlus size={8} className="stroke-[3]" />}
                        {notif.type === 'like' && <FiHeart size={8} fill="white" className="stroke-[3]" />}
                        {notif.type === 'comment' && <FiMessageCircle size={8} className="stroke-[3]" />}
                      </span>
                    </div>
                  </Link>
                  <div className="text-xs text-left">
                    <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed font-semibold">
                      <Link
                        to={`/profile/${notif.sender?.username}`}
                        className="font-black mr-1 text-neutral-900 dark:text-white hover:text-primary transition duration-150 uppercase tracking-wide"
                      >
                        {notif.sender?.username}
                      </Link>
                      <span className="text-neutral-600 dark:text-neutral-400 font-medium normal-case">
                        {notif.type === 'follow' && 'started following you.'}
                        {notif.type === 'like' && 'liked your post.'}
                        {notif.type === 'comment' && 'commented on your post.'}
                      </span>
                    </p>
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-black mt-1 block uppercase tracking-wider">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Render thumbnail of post for post-triggered events */}
                {notif.post && notif.post.media?.[0] && (
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/20 dark:border-white/5 shadow-inner bg-neutral-100 dark:bg-neutral-950">
                    <img
                      src={notif.post.media[0].url}
                      alt="attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Notifications;
