import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiFileText,
  FiFilm,
  FiMessageSquare,
  FiActivity,
  FiTrash2,
  FiArrowLeft,
  FiShield,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      const [anRes, recRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/recent'),
      ]);

      if (anRes.data.success && recRes.data.success) {
        setAnalytics(anRes.data.analytics);
        setRecentUsers(recRes.data.users || []);
        setRecentPosts(recRes.data.posts || []);
      }
    } catch (error) {
      toast.error('Failed to load admin stats. Access denied.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Admin credentials required.');
      navigate('/');
      return;
    }
    loadAdminData();
  }, [user, navigate]);

  // Moderate Delete Post
  const handleModeratorDeletePost = async (postId) => {
    if (!window.confirm('Delete this post for violating guidelines?')) return;
    try {
      const res = await api.delete(`/admin/post/${postId}`);
      if (res.data.success) {
        toast.success(res.data.message);
        loadAdminData(); // Refresh metrics
      }
    } catch (err) {
      toast.error('Moderation action failed.');
    }
  };

  // Moderate Delete User
  const handleModeratorDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their content from the system?')) return;
    try {
      const res = await api.delete(`/admin/user/${userId}`);
      if (res.data.success) {
        toast.success(res.data.message);
        loadAdminData(); // Refresh metrics
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Moderation action failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 select-none text-left">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-850">
        <div className="flex items-center gap-3">
          <Link
            to="/settings"
            className="text-neutral-450 hover:text-neutral-700 dark:hover:text-neutral-200 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition duration-200"
          >
            <FiArrowLeft size={18} />
          </Link>
          <h2 className="text-lg font-extrabold text-neutral-800 dark:text-white flex items-center gap-2">
            <FiShield className="text-red-500" /> Admin Moderation Console
          </h2>
        </div>
      </div>

      {/* Analytics Metric Cards Grid */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {/* Card 1 */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-5 rounded-2xl shadow-sm text-left">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Users</span>
              <FiUsers className="text-blue-500" size={16} />
            </div>
            <p className="text-2xl font-black text-neutral-800 dark:text-white">{analytics.totalUsers}</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-5 rounded-2xl shadow-sm text-left">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Posts</span>
              <FiFileText className="text-green-500" size={16} />
            </div>
            <p className="text-2xl font-black text-neutral-800 dark:text-white">{analytics.totalPosts}</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-5 rounded-2xl shadow-sm text-left">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Reels</span>
              <FiFilm className="text-purple-500" size={16} />
            </div>
            <p className="text-2xl font-black text-neutral-800 dark:text-white">{analytics.totalReels}</p>
          </div>
          {/* Card 4 */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-5 rounded-2xl shadow-sm text-left">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Comments</span>
              <FiMessageSquare className="text-yellow-500" size={16} />
            </div>
            <p className="text-2xl font-black text-neutral-800 dark:text-white">{analytics.totalComments}</p>
          </div>
          {/* Card 5 */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-5 rounded-2xl shadow-sm text-left col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Stories</span>
              <FiActivity className="text-pink-500" size={16} />
            </div>
            <p className="text-2xl font-black text-neutral-800 dark:text-white">{analytics.totalStories}</p>
          </div>
        </div>
      )}

      {/* Moderation Columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Moderation Column */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-[10px] font-bold text-neutral-450 dark:text-neutral-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-850 pb-3 text-left">
            User Moderation
          </h3>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-850">
            {recentUsers.map((item) => (
              <div key={item._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <img
                    src={item.profilePic || 'https://api.dicebear.com/7.x/initials/svg?seed=' + item.fullName}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-800"
                  />
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-800 dark:text-white">{item.username}</span>
                      <span className="text-[9px] bg-neutral-100 dark:bg-neutral-850 px-1.5 py-0.5 rounded-full text-neutral-500 font-bold uppercase tracking-wider">
                        {item.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-450 dark:text-neutral-400 font-semibold">{item.email}</p>
                  </div>
                </div>

                {item.role !== 'admin' && (
                  <button
                    onClick={() => handleModeratorDeleteUser(item._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition cursor-pointer"
                    title="Delete user account"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Moderation Column */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-[10px] font-bold text-neutral-450 dark:text-neutral-400 uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-855 pb-3 text-left">
            Recent Posts Moderation
          </h3>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-850">
            {recentPosts.map((post) => (
              <div key={post._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 shadow-sm">
                    <img src={post.media[0]?.url} alt="post" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left max-w-[180px] sm:max-w-[280px]">
                    <span className="text-xs font-bold text-neutral-800 dark:text-white hover:text-primary transition block">
                      @{post.user?.username}
                    </span>
                    <p className="text-[10px] text-neutral-450 dark:text-neutral-400 truncate leading-normal font-semibold mt-0.5">
                      {post.caption || 'No description'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleModeratorDeletePost(post._id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition cursor-pointer"
                  title="Delete post"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
