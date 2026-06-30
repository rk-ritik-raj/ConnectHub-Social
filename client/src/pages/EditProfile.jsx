import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiUpload, FiLock } from 'react-icons/fi';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      bio: '',
      website: '',
      isPrivate: false,
    },
  });

  // Pre-fill form values on mount
  useEffect(() => {
    if (user) {
      setValue('fullName', user.fullName || '');
      setValue('bio', user.bio || '');
      setValue('website', user.website || '');
      setValue('isPrivate', user.isPrivate || false);
    }
  }, [user, setValue]);

  // Handle Avatar Change
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large (max 10MB)');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    try {
      const res = await api.put('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile picture updated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaveLoading(true);
    try {
      const res = await api.put('/users/profile', data);
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile updated successfully!');
        navigate(`/profile/${user.username}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 select-none text-left relative z-10 px-4 md:px-0">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 md:p-8 shadow-2xl rounded-[32px] border-white/40 dark:border-white/5"
      >
        <h2 className="text-sm font-black mb-6 text-neutral-800 dark:text-white border-b border-neutral-200/40 dark:border-neutral-800/40 pb-4 uppercase tracking-widest">
          Edit Profile
        </h2>

        {/* Profile Picture Upload Area */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 bg-neutral-50/50 dark:bg-neutral-950/40 p-5 rounded-[24px] border border-neutral-150/40 dark:border-neutral-850/40">
          <div className="relative group shrink-0">
            <img
              src={user?.profilePic || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user?.fullName}
              alt="Profile"
              className="w-20 h-20 rounded-3xl object-cover border border-white/40 dark:border-white/5 shadow-md bg-neutral-100"
            />
            {avatarLoading && (
              <div className="absolute inset-0 bg-neutral-950/60 rounded-3xl flex items-center justify-center backdrop-blur-xs">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="text-center sm:text-left space-y-1.5">
            <h3 className="text-sm font-black text-neutral-805 dark:text-neutral-100 uppercase tracking-wide">{user?.username}</h3>
            <p className="text-[10px] text-neutral-450 dark:text-neutral-500 font-semibold mb-2.5">{user?.fullName}</p>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition hover:scale-102 active:scale-98">
              <FiUpload size={13} className="stroke-[3]" />
              Change Avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={avatarLoading}
              />
            </label>
          </div>
        </div>

        {/* Profile Information Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5 text-left">
            <label className="block text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              {...register('fullName', { required: 'Name is required' })}
              className="w-full px-4 py-2.5 text-xs bg-neutral-100/50 dark:bg-neutral-955/50 border border-neutral-200/50 dark:border-neutral-800/55 rounded-xl outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-neutral-808 dark:text-neutral-100 font-semibold"
            />
            {errors.fullName && (
              <p className="text-[10px] text-red-400 font-bold mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
              Website Link
            </label>
            <input
              type="url"
              {...register('website')}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 text-xs bg-neutral-100/50 dark:bg-neutral-955/50 border border-neutral-200/50 dark:border-neutral-800/55 rounded-xl outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-neutral-808 dark:text-neutral-100 font-semibold"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
              Bio Summary
            </label>
            <textarea
              {...register('bio', { maxLength: { value: 150, message: 'Bio cannot exceed 150 characters' } })}
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-2.5 text-xs bg-neutral-100/50 dark:bg-neutral-955/50 border border-neutral-200/50 dark:border-neutral-800/55 rounded-xl outline-none focus:ring-1 focus:ring-primary focus:border-primary transition text-neutral-808 dark:text-neutral-100 resize-none font-semibold"
            ></textarea>
            {errors.bio && (
              <p className="text-[10px] text-red-400 font-bold mt-1">{errors.bio.message}</p>
            )}
          </div>

          {/* Privacy Toggle Card */}
          <div className="flex items-center justify-between p-4.5 bg-neutral-50/50 dark:bg-neutral-950/40 border border-neutral-150/40 dark:border-neutral-850/40 rounded-[24px]">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-neutral-500">
                <FiLock size={18} />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">Private Account</h4>
                <p className="text-[9px] text-neutral-450 dark:text-neutral-450 font-semibold leading-relaxed mt-1">
                  Only approved followers will be able to see your posts and stories.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              {...register('isPrivate')}
              className="w-4 h-4 accent-primary rounded cursor-pointer shrink-0 ml-4"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-200/40 dark:border-neutral-800/40">
            <button
              type="button"
              onClick={() => navigate(`/profile/${user?.username}`)}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-955 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer hover:scale-102 transition shadow-md disabled:opacity-50 min-w-[140px]"
            >
              {saveLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfile;
