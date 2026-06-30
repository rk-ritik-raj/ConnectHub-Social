import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiLock, FiSettings, FiSun, FiMoon, FiShield, FiUser, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Handle Password Update
  const handlePasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Password changed successfully!');
        reset();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Toggle Account Privacy
  const handlePrivacyToggle = async (e) => {
    const isPrivateVal = e.target.checked;
    setPrivacyLoading(true);
    try {
      const res = await api.put('/users/profile', { isPrivate: isPrivateVal });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success(`Account is now ${isPrivateVal ? 'Private' : 'Public'}`);
      }
    } catch (err) {
      toast.error('Failed to change privacy setting.');
    } finally {
      setPrivacyLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 select-none text-left relative z-10 px-4 md:px-0">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 md:p-8 shadow-2xl rounded-[32px] border-white/40 dark:border-white/5 space-y-8"
      >
        {/* Settings Header */}
        <div className="flex items-center gap-3 pb-4.5 border-b border-neutral-200/40 dark:border-neutral-800/40">
          <FiSettings className="text-primary animate-pulse-slow" size={20} />
          <h2 className="text-sm font-black text-neutral-800 dark:text-white uppercase tracking-widest">Settings</h2>
        </div>

        {/* Edit Profile Quick Shortcut */}
        <div className="flex items-center justify-between p-4.5 bg-neutral-50/50 dark:bg-neutral-950/40 border border-neutral-150/40 dark:border-neutral-850/40 rounded-[24px]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-xl text-neutral-500">
              <FiUser size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">Profile Details</h4>
              <p className="text-[9px] text-neutral-450 dark:text-neutral-450 font-semibold mt-1">Update username, website bio details and avatar image.</p>
            </div>
          </div>
          <Link
            to="/profile/edit"
            className="px-4 py-2 bg-neutral-950 hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition shadow-md active:scale-95 flex items-center gap-1 shrink-0"
          >
            Edit <FiArrowRight size={10} />
          </Link>
        </div>

        {/* Theme Settings block */}
        <div className="space-y-3.5">
          <h3 className="text-[10px] font-black text-neutral-450 dark:text-neutral-400 uppercase tracking-widest">Display Options</h3>
          <div className="flex items-center justify-between p-4.5 bg-neutral-50/50 dark:bg-neutral-950/40 border border-neutral-150/40 dark:border-neutral-850/40 rounded-[24px]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
                {darkMode ? <FiMoon className="text-indigo-500" size={18} /> : <FiSun className="text-amber-500" size={18} />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">Dark theme</h4>
                <p className="text-[9px] text-neutral-450 dark:text-neutral-450 font-semibold mt-1">Toggle between dark mode surface styles and clean bright modes.</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4.5 py-2.5 bg-white/70 dark:bg-neutral-900/70 border border-white/20 dark:border-white/5 text-neutral-800 dark:text-neutral-250 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition active:scale-95 shadow-sm"
            >
              Toggle
            </button>
          </div>
        </div>

        {/* Account Privacy Settings block */}
        <div className="space-y-3.5">
          <h3 className="text-[10px] font-black text-neutral-450 dark:text-neutral-400 uppercase tracking-widest">Security & Privacy</h3>
          <div className="flex items-center justify-between p-4.5 bg-neutral-50/50 dark:bg-neutral-950/40 border border-neutral-150/40 dark:border-neutral-850/40 rounded-[24px]">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-xl text-neutral-500 mt-0.5">
                <FiShield size={18} />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">Private Account</h4>
                <p className="text-[9px] text-neutral-450 dark:text-neutral-450 font-semibold leading-relaxed mt-1">
                  Only approved followers will see your pictures, videos, and stories.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={user?.isPrivate || false}
              onChange={handlePrivacyToggle}
              disabled={privacyLoading}
              className="w-4 h-4 accent-primary rounded cursor-pointer shrink-0 ml-4"
            />
          </div>
        </div>

        {/* Change Password Form block */}
        <div className="space-y-4 pt-6 border-t border-neutral-200/40 dark:border-neutral-800/40">
          <h3 className="text-[10px] font-black text-neutral-450 dark:text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
            <FiLock /> Change Account Password
          </h3>

          <form onSubmit={handleSubmit(handlePasswordSubmit)} className="space-y-5 max-w-md">
            <div className="space-y-1.5 text-left">
              <label className="block text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
                Current Password
              </label>
              <input
                type="password"
                {...register('currentPassword', { required: 'Current password is required' })}
                className="w-full px-4 py-2.5 text-xs bg-neutral-100/50 dark:bg-neutral-950/50 border border-neutral-200/50 dark:border-neutral-800/55 rounded-xl outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-neutral-808 dark:text-neutral-100 font-semibold"
              />
              {errors.currentPassword && (
                <p className="text-[10px] text-red-400 font-bold mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className="w-full px-4 py-2.5 text-xs bg-neutral-100/50 dark:bg-neutral-950/50 border border-neutral-200/50 dark:border-neutral-800/55 rounded-xl outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-neutral-808 dark:text-neutral-100 font-semibold"
              />
              {errors.newPassword && (
                <p className="text-[10px] text-red-400 font-bold mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                {...register('confirmPassword', { required: 'Please confirm new password' })}
                className="w-full px-4 py-2.5 text-xs bg-neutral-100/50 dark:bg-neutral-950/50 border border-neutral-200/50 dark:border-neutral-800/55 rounded-xl outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-neutral-808 dark:text-neutral-100 font-semibold"
              />
              {errors.confirmPassword && (
                <p className="text-[10px] text-red-400 font-bold mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer hover:scale-102 transition shadow-md disabled:opacity-50 min-w-[140px]"
            >
              {passwordLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>

        {/* Admin Section Link (Only for admin roles) */}
        {user?.role === 'admin' && (
          <div className="pt-6 border-t border-neutral-200/40 dark:border-neutral-800/40 space-y-4">
            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Administrative Actions</h3>
            <div className="flex items-center justify-between p-4.5 bg-red-500/5 dark:bg-red-950/10 border border-red-500/10 dark:border-red-500/5 rounded-[24px]">
              <div className="text-left pr-4">
                <h4 className="text-xs font-bold text-red-650 dark:text-red-400 uppercase tracking-wide">Admin Dashboard</h4>
                <p className="text-[9px] text-red-600 dark:text-red-500/80 mt-1 font-semibold leading-relaxed">
                  Access overall system metrics, moderate registration items, and remove reported posts.
                </p>
              </div>
              <Link
                to="/admin"
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md transition active:scale-95 shrink-0"
              >
                Open Panel
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Settings;
