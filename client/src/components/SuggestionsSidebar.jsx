import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const SuggestionsSidebar = () => {
  const { user: currentUser } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await api.get('/users/suggested');
        if (res.data.success) {
          setSuggestions(res.data.users || []);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchSuggestions();
    }
  }, [currentUser]);

  const handleFollowToggle = async (userId) => {
    try {
      const res = await api.post(`/users/follow/${userId}`);
      if (res.data.success) {
        toast.success(res.data.message);
        // Remove followed user from suggestion list
        setSuggestions((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      toast.error('Action failed.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-premium-pulse select-none glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-neutral-250/30 dark:bg-neutral-800/40 rounded-full"></div>
            <div className="space-y-2">
              <div className="w-24 h-3 bg-neutral-250/30 dark:bg-neutral-800/40 rounded-md"></div>
              <div className="w-16 h-2 bg-neutral-250/30 dark:bg-neutral-800/40 rounded-md"></div>
            </div>
          </div>
        </div>
        <div className="h-3 bg-neutral-250/30 dark:bg-neutral-800/40 rounded-md w-1/3 mt-6"></div>
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neutral-250/30 dark:bg-neutral-800/40 rounded-full"></div>
              <div className="space-y-1.5">
                <div className="w-20 h-2.5 bg-neutral-250/30 dark:bg-neutral-800/40 rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 select-none glass-panel p-6 rounded-[32px] shadow-xl text-left border-white/40 dark:border-white/5">
      {/* Current User Card */}
      {currentUser && (
        <div className="flex items-center justify-between mb-4 border-b border-neutral-200/40 dark:border-neutral-800/40 pb-4.5">
          <Link
            to={`/profile/${currentUser.username}`}
            className="flex items-center gap-3 hover:opacity-90 transition group"
          >
            <img
              src={
                currentUser.profilePic ||
                'https://api.dicebear.com/7.x/initials/svg?seed=' + currentUser.fullName
              }
              alt={currentUser.username}
              className="w-11 h-11 rounded-2xl object-cover border border-white/40 dark:border-white/5 shadow-sm group-hover:scale-102 transition duration-200"
            />
            <div className="text-left">
              <p className="text-xs font-black text-neutral-800 dark:text-neutral-100 uppercase tracking-wider">
                {currentUser.username}
              </p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">{currentUser.fullName}</p>
            </div>
          </Link>
          <Link
            to="/profile/edit"
            className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-indigo-400 hover:text-primary-hover transition"
          >
            Edit
          </Link>
        </div>
      )}

      {/* Recommendations Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-neutral-450 dark:text-neutral-400 uppercase tracking-widest">
          Suggested for you
        </span>
        <Link
          to="/explore"
          className="text-[10px] font-black text-primary dark:text-indigo-400 hover:underline uppercase tracking-widest transition"
        >
          See All
        </Link>
      </div>

      {/* Suggested items list */}
      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <p className="text-xs text-neutral-400 text-left py-2 font-medium">No suggestions at this moment.</p>
        ) : (
          suggestions.map((item) => (
            <div key={item._id} className="flex items-center justify-between group">
              <Link
                to={`/profile/${item.username}`}
                className="flex items-center gap-3 hover:opacity-90 transition"
              >
                <img
                  src={
                    item.profilePic ||
                    'https://api.dicebear.com/7.x/initials/svg?seed=' + item.fullName
                  }
                  alt={item.username}
                  className="w-9 h-9 rounded-xl object-cover border border-neutral-100 dark:border-neutral-850"
                />
                <div className="text-left">
                  <p className="text-xs font-black text-neutral-800 dark:text-neutral-200">
                    {item.username}
                  </p>
                  <p className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider">Popular</p>
                </div>
              </Link>
              <button
                onClick={() => handleFollowToggle(item._id)}
                className="px-3.5 py-1.5 bg-neutral-200/50 hover:bg-neutral-250 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-[9px] font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 rounded-xl cursor-pointer transition active:scale-95 shadow-sm"
              >
                Follow
              </button>
            </div>
          ))
        )}
      </div>

      {/* Meta Footer Details */}
      <div className="text-[9px] text-neutral-400 dark:text-neutral-500 text-left leading-relaxed pt-5 border-t border-neutral-200/40 dark:border-neutral-800/40">
        About • Help • Press • API • Jobs • Privacy • Terms • Locations • Language • Meta Verified
        <p className="mt-3 font-semibold uppercase text-neutral-450 dark:text-neutral-500">© 2026 ConnectHub from Meta</p>
      </div>
    </div>
  );
};

export default SuggestionsSidebar;
