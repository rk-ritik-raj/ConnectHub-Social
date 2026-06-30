import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiBookmark, FiUser, FiCheck, FiHeart, FiMessageCircle, FiLayers, FiX, FiInfo } from 'react-icons/fi';
import PostCard from '../components/PostCard';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Selected post for Detail Modal
  const [selectedPost, setSelectedPost] = useState(null);

  // Followers / Following Modals
  const [modalOpen, setModalOpen] = useState(null); // 'followers' or 'following' or null
  const [listUsers, setListUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  // Load profile user details
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/profile/${username}`);
        if (res.data.success) {
          setProfileUser(res.data.user);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch profile.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // Reset state on profile switch
    setModalOpen(null);
    setSelectedPost(null);
  }, [username, navigate]);

  // Load posts based on active tab
  useEffect(() => {
    if (!profileUser) return;

    const loadPosts = async () => {
      setPostsLoading(true);
      try {
        if (activeTab === 'posts') {
          const res = await api.get(`/posts/user/${username}`);
          if (res.data.success) {
            setUserPosts(res.data.posts || []);
          }
        } else if (activeTab === 'saved' && isOwnProfile) {
          const res = await api.get('/posts/saved');
          if (res.data.success) {
            setSavedPosts(res.data.posts || []);
          }
        }
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setPostsLoading(false);
      }
    };

    loadPosts();
  }, [profileUser, activeTab, username, isOwnProfile]);

  // Handle Follow / Unfollow from profile head
  const handleFollowToggle = async () => {
    if (!profileUser) return;
    try {
      const res = await api.post(`/users/follow/${profileUser._id}`);
      if (res.data.success) {
        setProfileUser((prev) => {
          const updatedFollowers = res.data.isFollowing
            ? [...prev.followers, currentUser._id]
            : prev.followers.filter((id) => id.toString() !== currentUser._id.toString());
          return {
            ...prev,
            isFollowing: res.data.isFollowing,
            followers: updatedFollowers,
          };
        });
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  // Open modal and load followers/following lists
  const openFollowModal = async (type) => {
    if (!profileUser) return;
    setModalOpen(type);
    setListLoading(true);
    try {
      const res = await api.get(`/users/${type}/${profileUser._id}`);
      if (res.data.success) {
        setListUsers(res.data[type] || []);
      }
    } catch (err) {
      toast.error('Failed to load lists.');
      setModalOpen(null);
    } finally {
      setListLoading(false);
    }
  };

  // Handle inline list follows
  const handleListFollowToggle = async (targetId) => {
    try {
      const res = await api.post(`/users/follow/${targetId}`);
      if (res.data.success) {
        setListUsers((prev) =>
          prev.map((u) => {
            if (u._id === targetId) {
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
      toast.error('Failed to change follow status.');
    }
  };

  // Handle Post Deletion inside modal
  const handlePostDeleted = (postId) => {
    setUserPosts((prev) => prev.filter((p) => p._id !== postId));
    setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] relative z-10">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const postsToRender = activeTab === 'posts' ? userPosts : savedPosts;

  return (
    <div className="max-w-[1012px] mx-auto py-8 select-none text-left relative z-10 px-4 md:px-0">
      {/* Premium Ambient Banner Cover */}
      <div className="h-44 md:h-56 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-xs"></div>
        {/* Subtle glass bubble highlight */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 right-6 text-white/50 text-[10px] font-black uppercase tracking-widest bg-black/25 px-3 py-1.5 rounded-full backdrop-blur-md">
          {username}'s hub
        </div>
      </div>

      {/* Profile Head */}
      <div className="px-6 md:px-10 pb-8 mb-8 border-b border-neutral-200/40 dark:border-neutral-800/40">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mt-[-4rem] md:mt-[-5.5rem] mb-6">
          {/* Avatar Image container */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 md:w-38 md:h-38 rounded-[32px] p-[3px] bg-white dark:bg-neutral-950 border border-neutral-200/40 dark:border-neutral-800/45 shadow-xl">
              <img
                src={profileUser?.profilePic || 'https://api.dicebear.com/7.x/initials/svg?seed=' + profileUser?.fullName}
                alt="Profile Avatar"
                className="w-full h-full rounded-[28px] object-cover border border-neutral-100 dark:border-neutral-900 bg-neutral-50"
              />
            </div>
          </div>

          {/* User Meta Information */}
          <div className="flex-grow flex flex-col md:flex-row justify-between items-center md:items-end gap-4 pb-2 w-full">
            <div className="text-center md:text-left space-y-1.5">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h2 className="text-2xl font-black font-display tracking-tight text-neutral-800 dark:text-white uppercase">
                  {profileUser?.username}
                </h2>
              </div>
              <h1 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {profileUser?.fullName}
              </h1>
            </div>

            {/* Edit Profile / Follow Action Buttons */}
            <div className="flex items-center gap-2.5">
              {isOwnProfile ? (
                <Link
                  to="/profile/edit"
                  className="px-5 py-2.5 bg-white/70 dark:bg-neutral-900/70 border border-white/20 dark:border-white/5 text-neutral-800 dark:text-neutral-200 hover:scale-102 transition duration-200 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-sm"
                >
                  Edit Profile
                </Link>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition shadow-md active:scale-95 flex items-center gap-1.5 ${
                    profileUser?.isFollowing
                      ? 'bg-neutral-200/50 hover:bg-neutral-300 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                      : 'bg-primary hover:bg-primary-hover text-white'
                  }`}
                >
                  {profileUser?.isFollowing ? (
                    <>
                      <FiCheck size={14} className="stroke-[3]" /> Following
                    </>
                  ) : (
                    'Follow'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Stats & Bio */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-16 pt-4 border-t border-neutral-200/40 dark:border-neutral-800/40 justify-between items-start">
          {/* Bio section */}
          <div className="max-w-md space-y-2.5">
            {profileUser?.bio ? (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed font-semibold">
                {profileUser.bio}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">No biography added yet.</p>
            )}
            {profileUser?.website && (
              <a
                href={profileUser.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-black text-primary dark:text-indigo-400 hover:underline inline-block"
              >
                {profileUser.website.replace(/(^\w+:|^)\/\//, '')}
              </a>
            )}
          </div>

          {/* Counts Row */}
          <div className="flex gap-10 shrink-0 select-none">
            <div className="text-center md:text-left">
              <span className="block text-lg font-black text-neutral-805 dark:text-white leading-none">{userPosts.length}</span>
              <span className="text-[9px] uppercase tracking-widest font-black text-neutral-450 dark:text-neutral-500 mt-1 block">posts</span>
            </div>
            <button
              onClick={() => openFollowModal('followers')}
              className="text-center md:text-left hover:opacity-80 transition cursor-pointer"
            >
              <span className="block text-lg font-black text-neutral-805 dark:text-white leading-none">
                {profileUser?.followers?.length || 0}
              </span>
              <span className="text-[9px] uppercase tracking-widest font-black text-neutral-450 dark:text-neutral-500 mt-1 block">followers</span>
            </button>
            <button
              onClick={() => openFollowModal('following')}
              className="text-center md:text-left hover:opacity-80 transition cursor-pointer"
            >
              <span className="block text-lg font-black text-neutral-805 dark:text-white leading-none">
                {profileUser?.following?.length || 0}
              </span>
              <span className="text-[9px] uppercase tracking-widest font-black text-neutral-450 dark:text-neutral-500 mt-1 block">following</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Tabs */}
      <div>
        <div className="flex justify-center gap-10 uppercase tracking-widest text-[9px] font-black border-b border-neutral-200/40 dark:border-neutral-800/40 mb-6 relative">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 py-3.5 cursor-pointer relative transition-all duration-200 ${
              activeTab === 'posts'
                ? 'text-primary dark:text-white'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
            }`}
          >
            <FiGrid size={13} />
            <span>Posts</span>
            {activeTab === 'posts' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-white"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 py-3.5 cursor-pointer relative transition-all duration-200 ${
                activeTab === 'saved'
                  ? 'text-primary dark:text-white'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
            >
              <FiBookmark size={13} />
              <span>Saved</span>
              {activeTab === 'saved' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-white"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </button>
          )}
        </div>

        {/* Tab Contents: Grid view of posts */}
        <div className="mt-4">
          {postsLoading ? (
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="aspect-square bg-neutral-200/40 dark:bg-neutral-800/40 animate-pulse rounded-3xl"></div>
              ))}
            </div>
          ) : postsToRender.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center p-6 rounded-3xl border border-neutral-200/40 dark:border-neutral-800/40 shadow-xl bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-5 text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-800 shadow-inner">
                {activeTab === 'posts' ? <FiUser size={24} /> : <FiBookmark size={24} />}
              </div>
              <h3 className="text-xs font-black text-neutral-800 dark:text-neutral-200 mb-2 uppercase tracking-wider">
                {activeTab === 'posts' ? 'No Posts Shared Yet' : 'No Bookmarked Posts'}
              </h3>
              <p className="text-xs text-neutral-450 dark:text-neutral-500 font-semibold max-w-xs leading-relaxed">
                {activeTab === 'posts' ? 'Photos or video posts shared will display right here.' : 'Posts you bookmark will display right here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {postsToRender.map((post) => (
                <motion.div
                  key={post._id}
                  onClick={() => setSelectedPost(post)}
                  whileHover={{ scale: 1.015 }}
                  className="relative aspect-square rounded-[24px] overflow-hidden group cursor-pointer border border-white/20 dark:border-white/5 shadow-md hover:shadow-xl transition-all duration-300 bg-neutral-100 dark:bg-neutral-950"
                >
                  {/* Media Content */}
                  {post.media[0]?.type === 'video' ? (
                    <video src={post.media[0]?.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={post.media[0]?.url} alt="Media thumbnail" className="w-full h-full object-cover" />
                  )}

                  {post.media?.length > 1 && (
                    <div className="absolute top-3.5 right-3.5 text-white drop-shadow-md z-10">
                      <FiLayers size={15} />
                    </div>
                  )}

                  {/* Hover Overlay */}
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Post Dialog Modal */}
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

      {/* Followers / Following list overlay modals */}
      <AnimatePresence>
        {modalOpen && (
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
              className="bg-white dark:bg-neutral-900 border border-white/40 dark:border-neutral-800 w-full max-w-sm rounded-[32px] max-h-[80vh] flex flex-col shadow-2xl overflow-hidden text-left"
            >
              <div className="flex items-center justify-between px-6 py-4.5 border-b border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-50/50 dark:bg-neutral-950/50 select-none">
                <span className="font-black text-[10px] uppercase tracking-widest text-neutral-550 dark:text-neutral-400">
                  {modalOpen}
                </span>
                <button
                  onClick={() => setModalOpen(null)}
                  className="px-3.5 py-1.5 bg-neutral-200/50 dark:bg-neutral-800/50 hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition duration-200"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4.5 no-scrollbar">
                {listLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : listUsers.length === 0 ? (
                  <p className="text-xs text-center text-neutral-450 dark:text-neutral-500 py-10 font-bold uppercase tracking-wider">No accounts found.</p>
                ) : (
                  listUsers.map((item) => {
                    const isSelf = item._id === currentUser?._id;
                    const itemIsFollowing = item.followers?.includes(currentUser?._id);

                    return (
                      <div key={item._id} className="flex items-center justify-between">
                        <Link
                          to={`/profile/${item.username}`}
                          onClick={() => setModalOpen(null)}
                          className="flex items-center gap-3 hover:opacity-85 transition group"
                        >
                          <img
                            src={item.profilePic || 'https://api.dicebear.com/7.x/initials/svg?seed=' + item.fullName}
                            alt={item.username}
                            className="w-10 h-10 rounded-xl object-cover border border-white/20 bg-neutral-100 shadow-sm"
                          />
                          <div className="text-left">
                            <p className="text-xs font-black text-neutral-800 dark:text-neutral-100 uppercase tracking-wider">{item.username}</p>
                            <p className="text-[9px] text-neutral-450 dark:text-neutral-500 font-semibold">{item.fullName}</p>
                          </div>
                        </Link>

                        {!isSelf && (
                          <button
                            onClick={() => handleListFollowToggle(item._id)}
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
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
