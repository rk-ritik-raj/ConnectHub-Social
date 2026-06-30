import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CreatePostModal from '../components/CreatePostModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiCompass,
  FiFilm,
  FiSend,
  FiHeart,
  FiPlusSquare,
  FiSettings,
  FiLogOut,
  FiSun,
  FiMoon,
  FiSearch,
} from 'react-icons/fi';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: FiHome },
    { name: 'Explore', path: '/explore', icon: FiCompass },
    { name: 'Reels', path: '/reels', icon: FiFilm },
    { name: 'Messages', path: '/messages', icon: FiSend },
    { name: 'Notifications', path: '/notifications', icon: FiHeart },
  ];

  return (
    <div className="relative min-h-screen w-full flex bg-gradient-to-br from-[#FAFAFC] via-[#FFF7F7] to-[#FFF0F0] dark:from-[#09090B] dark:via-[#140F0F] dark:to-[#0D0B0B] transition-colors duration-300 overflow-x-hidden">
      {/* Premium Ambient Background Mesh Gradients */}
      <div className="absolute top-[5%] left-[5%] w-[450px] h-[450px] bg-ambient-purple rounded-full blur-[100px] pointer-events-none opacity-80 z-0"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-ambient-red rounded-full blur-[120px] pointer-events-none opacity-70 z-0"></div>
      <div className="absolute top-[40%] left-[25%] w-[350px] h-[350px] bg-ambient-indigo rounded-full blur-[90px] pointer-events-none opacity-60 z-0"></div>

      {/* Desktop Sidebar Navigation Dock */}
      <aside className="hidden md:flex flex-col justify-between w-22 h-[calc(100vh-48px)] sticky top-6 ml-6 my-6 glass-panel py-8 px-2 rounded-3xl select-none z-30 shadow-2xl">
        <div className="flex flex-col items-center gap-9">
          {/* Logo */}
          <Link to="/" className="group flex items-center justify-center">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/25 group-hover:scale-105 active:scale-95 transition-all duration-200">
              <span className="font-display text-lg font-black">C</span>
            </div>
            {/* Tooltip */}
            <div className="absolute left-22 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-200 pointer-events-none shadow-lg z-50 uppercase tracking-widest border border-white/10">
              ConnectHub
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-4.5 w-full items-center">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `group relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 hover:scale-105 ${
                    isActive 
                      ? 'text-primary dark:text-white shadow-sm' 
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={20} className={`z-10 transition-transform duration-200 ${isActive ? 'scale-110 text-primary dark:text-white' : 'group-hover:scale-115'}`} />
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-neutral-900/5 dark:bg-white/10 rounded-2xl border border-neutral-950/5 dark:border-white/5 shadow-inner"
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      />
                    )}
                    {/* Tooltip */}
                    <div className="absolute left-22 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-200 pointer-events-none shadow-lg z-50 uppercase tracking-widest border border-white/10">
                      {item.name}
                    </div>
                  </>
                )}
              </NavLink>
            ))}

            {/* Quick Search Shortcut in Dock */}
            <button
              onClick={() => navigate('/explore')}
              className="group relative w-12 h-12 flex items-center justify-center rounded-2xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <FiSearch size={20} className="group-hover:scale-115 transition-transform" />
              <div className="absolute left-22 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-200 pointer-events-none shadow-lg z-50 uppercase tracking-widest border border-white/10">
                Search
              </div>
            </button>

            {/* Create Post Action Button */}
            <button
              onClick={() => setCreateOpen(true)}
              className="group relative w-12 h-12 flex items-center justify-center rounded-2xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <FiPlusSquare size={20} className="group-hover:scale-115 transition-transform" />
              <div className="absolute left-22 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-200 pointer-events-none shadow-lg z-50 uppercase tracking-widest border border-white/10">
                Create
              </div>
            </button>

            {/* Profile Avatar Link */}
            <NavLink
              to={`/profile/${user?.username}`}
              className={({ isActive }) =>
                `group relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 hover:scale-105 ${
                  isActive ? 'shadow-sm' : ''
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={user?.profilePic || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user?.fullName}
                    alt="Profile"
                    className={`w-7 h-7 rounded-full object-cover z-10 border-2 transition-all duration-200 ${
                      isActive ? 'border-primary dark:border-white scale-110' : 'border-transparent group-hover:border-neutral-350 dark:group-hover:border-neutral-700'
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-neutral-900/5 dark:bg-white/10 rounded-2xl border border-neutral-950/5 dark:border-white/5 shadow-inner"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )}
                  <div className="absolute left-22 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-200 pointer-events-none shadow-lg z-50 uppercase tracking-widest border border-white/10">
                    Profile
                  </div>
                </>
              )}
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Dock Bottom Settings Actions */}
        <div className="flex flex-col gap-4 w-full items-center">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="group relative w-12 h-12 flex items-center justify-center rounded-2xl text-neutral-500 dark:text-neutral-400 hover:scale-105 transition-all cursor-pointer"
          >
            {darkMode ? (
              <FiSun size={20} className="text-amber-500 group-hover:rotate-45 transition duration-300" />
            ) : (
              <FiMoon size={20} className="text-indigo-500 group-hover:-rotate-12 transition duration-300" />
            )}
            <div className="absolute left-22 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-200 pointer-events-none shadow-lg z-50 uppercase tracking-widest border border-white/10">
              {darkMode ? 'Light Theme' : 'Dark Theme'}
            </div>
          </button>

          {/* Settings Nav Link */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `group relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 hover:scale-105 ${
                isActive ? 'text-primary dark:text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <FiSettings size={20} className="group-hover:rotate-45 transition duration-300 z-10" />
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-neutral-900/5 dark:bg-white/10 rounded-2xl border border-neutral-950/5 dark:border-white/5 shadow-inner"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <div className="absolute left-22 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-200 pointer-events-none shadow-lg z-50 uppercase tracking-widest border border-white/10">
                  Settings
                </div>
              </>
            )}
          </NavLink>

          {/* Log Out Action */}
          <button
            onClick={handleLogout}
            className="group relative w-12 h-12 flex items-center justify-center rounded-2xl text-red-500 hover:bg-red-500/10 hover:scale-105 transition-all cursor-pointer"
          >
            <FiLogOut size={20} className="group-hover:translate-x-0.5 transition duration-200" />
            <div className="absolute left-22 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 bg-red-650 text-white text-[10px] font-black px-3.5 py-2 rounded-xl transition-all duration-200 pointer-events-none shadow-lg z-50 uppercase tracking-widest border border-red-500/10">
              Log out
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-grow flex flex-col min-w-0 relative z-10">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between border-b border-neutral-150/40 dark:border-neutral-850/40 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md px-5 py-4 sticky top-0 z-40 select-none shadow-sm">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-black shadow-md shadow-indigo-500/20">
              C
            </span>
            <h1 className="font-display text-md font-bold tracking-tight bg-gradient-to-r from-neutral-855 to-neutral-950 dark:from-white dark:to-neutral-200 bg-clip-text text-transparent">
              ConnectHub
            </h1>
          </Link>
          <div className="flex items-center gap-4 text-neutral-550 dark:text-neutral-300">
            <Link to="/notifications" className="hover:text-red-500 transition duration-150">
              <FiHeart size={20} />
            </Link>
            <Link to="/messages" className="hover:text-primary transition duration-150">
              <FiSend size={20} />
            </Link>
          </div>
        </header>

        {/* Global Desktop Header Search Panel */}
        <div className="hidden md:flex items-center justify-between px-10 py-5 sticky top-0 z-20 pointer-events-none select-none">
          <div className="w-full max-w-sm glass-panel py-2 px-3 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg border-white/40 dark:border-white/5 pointer-events-auto transition duration-200">
            <FiSearch size={14} className="text-neutral-400 dark:text-neutral-500 ml-1.5" />
            <input
              type="text"
              placeholder="Search ConnectHub..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                navigate(`/explore?search=${encodeURIComponent(e.target.value)}`);
              }}
              className="flex-grow bg-transparent border-none text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 outline-none placeholder-neutral-400 select-auto py-1"
            />
            {/* Shortcut hints */}
            <span className="text-[9px] bg-neutral-200/50 dark:bg-neutral-800 text-neutral-500 font-bold px-2 py-0.5 rounded-full select-none">
              ⌘ K
            </span>
          </div>

          {/* User profile dropdown indicator on right */}
          <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full shadow-sm border-white/40 dark:border-white/5 pointer-events-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-neutral-700 dark:text-neutral-200 uppercase tracking-widest">{user?.username}</span>
          </div>
        </div>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6 relative z-10 px-4 md:px-10">
          <Outlet />
        </main>

        {/* Bottom Navigation Bar - Mobile */}
        <nav className="md:hidden flex items-center justify-around border-t border-neutral-150/40 dark:border-neutral-850/40 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md py-3 w-[calc(100%-32px)] fixed bottom-4 left-4 rounded-3xl z-40 select-none shadow-[0_16px_32px_rgba(0,0,0,0.1)] border border-white/20">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-neutral-500 dark:text-neutral-400 p-2 rounded-xl transition duration-150 hover:scale-105 active:scale-95 ${
                isActive ? 'text-primary dark:text-white bg-neutral-100/50 dark:bg-neutral-800/50 shadow-inner' : ''
              }`
            }
          >
            <FiHome size={20} />
          </NavLink>
          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `text-neutral-500 dark:text-neutral-400 p-2 rounded-xl transition duration-150 hover:scale-105 active:scale-95 ${
                isActive ? 'text-primary dark:text-white bg-neutral-100/50 dark:bg-neutral-800/50 shadow-inner' : ''
              }`
            }
          >
            <FiCompass size={20} />
          </NavLink>
          <button
            onClick={() => setCreateOpen(true)}
            className="text-neutral-550 dark:text-neutral-300 p-2 rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25"
          >
            <FiPlusSquare size={20} />
          </button>
          <NavLink
            to="/reels"
            className={({ isActive }) =>
              `text-neutral-500 dark:text-neutral-400 p-2 rounded-xl transition duration-150 hover:scale-105 active:scale-95 ${
                isActive ? 'text-primary dark:text-white bg-neutral-100/50 dark:bg-neutral-800/50 shadow-inner' : ''
              }`
            }
          >
            <FiFilm size={20} />
          </NavLink>
          <NavLink
            to={`/profile/${user?.username}`}
            className={({ isActive }) =>
              `rounded-full transition duration-150 ${
                isActive ? 'ring-2 ring-primary scale-105' : ''
              }`
            }
          >
            <img
              src={user?.profilePic || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user?.fullName}
              alt="Profile"
              className="w-5.5 h-5.5 rounded-full object-cover"
            />
          </NavLink>
        </nav>
      </div>

      <CreatePostModal isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} onPostCreated={() => window.location.reload()} />
    </div>
  );
};

export default MainLayout;
