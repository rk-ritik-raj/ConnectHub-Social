import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyEmail from '../pages/VerifyEmail';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Profile from '../pages/Profile';
import EditProfile from '../pages/EditProfile';
import Explore from '../pages/Explore';
import Messages from '../pages/Messages';
import Notifications from '../pages/Notifications';
import Saved from '../pages/Saved';
import Settings from '../pages/Settings';
import Reels from '../pages/Reels';
import NotFound from '../pages/NotFound';
import AdminDashboard from '../pages/AdminDashboard';

// Layout
import MainLayout from '../layouts/MainLayout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="w-8 h-8 border-4 border-neutral-300 border-t-[#0095f6] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="w-8 h-8 border-4 border-neutral-300 border-t-[#0095f6] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/verify-email"
        element={<Navigate to="/" replace />}
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* Main Connected System Layout & Sub-sections */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="reels" element={<Reels />} />
        <Route path="messages" element={<Messages />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile/:username" element={<Profile />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="saved" element={<Saved />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin" element={<AdminDashboard />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
