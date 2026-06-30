import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGoogle, FaApple, FaGithub } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await signup(data.username, data.email, data.password, data.fullName);
      toast.success(res.message || 'Signup successful! Welcome to ConnectHub.');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center min-h-screen w-full px-4 py-12 select-none overflow-hidden bg-neutral-950"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[4px] dark:bg-black/60 z-0"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] bg-white/10 dark:bg-black/25 backdrop-blur-xl border border-white/20 rounded-[28px] p-8 md:p-10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] flex flex-col gap-6.5 text-white text-center"
      >
        {/* Sign Up Section */}
        <div className="flex flex-col items-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
            Sign up
          </h1>
          <p className="text-xs text-white/70 mt-2 font-medium">
            Create an account to connect with surf buddies.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4.5">
          {/* Email Address */}
          <div className="flex flex-col gap-1 text-left">
            <div className="floating-input-group relative w-full">
              <input
                type="email"
                placeholder=" "
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="w-full px-4 py-3 bg-white/10 border border-white/15 focus:border-white focus:ring-1 focus:ring-white/20 rounded-2xl text-sm outline-none text-white transition-all duration-200 placeholder-transparent font-medium"
              />
              <label className="absolute left-4 select-none pointer-events-none transition-all duration-200 text-white/50">
                Email Address
              </label>
            </div>
            {errors.email && (
              <p className="text-[10px] text-red-400 font-bold px-1 mt-0.5">{errors.email.message}</p>
            )}
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1 text-left">
            <div className="floating-input-group relative w-full">
              <input
                type="text"
                placeholder=" "
                {...register('fullName', { required: 'Full name is required' })}
                className="w-full px-4 py-3 bg-white/10 border border-white/15 focus:border-white focus:ring-1 focus:ring-white/20 rounded-2xl text-sm outline-none text-white transition-all duration-200 placeholder-transparent font-medium"
              />
              <label className="absolute left-4 select-none pointer-events-none transition-all duration-200 text-white/50">
                Full Name
              </label>
            </div>
            {errors.fullName && (
              <p className="text-[10px] text-red-400 font-bold px-1 mt-0.5">{errors.fullName.message}</p>
            )}
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1 text-left">
            <div className="floating-input-group relative w-full">
              <input
                type="text"
                placeholder=" "
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' },
                  pattern: {
                    value: /^[a-zA-Z0-9_.]+$/,
                    message: 'Only letters, numbers, underscores, and dots allowed',
                  },
                })}
                className="w-full px-4 py-3 bg-white/10 border border-white/15 focus:border-white focus:ring-1 focus:ring-white/20 rounded-2xl text-sm outline-none text-white transition-all duration-200 placeholder-transparent font-medium"
              />
              <label className="absolute left-4 select-none pointer-events-none transition-all duration-200 text-white/50">
                Username
              </label>
            </div>
            {errors.username && (
              <p className="text-[10px] text-red-400 font-bold px-1 mt-0.5">{errors.username.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1 text-left relative">
            <div className="floating-input-group relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder=" "
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className="w-full px-4 py-3 pr-11 bg-white/10 border border-white/15 focus:border-white focus:ring-1 focus:ring-white/20 rounded-2xl text-sm outline-none text-white transition-all duration-200 placeholder-transparent font-medium"
              />
              <label className="absolute left-4 select-none pointer-events-none transition-all duration-200 text-white/50">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white cursor-pointer transition p-1"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[10px] text-red-400 font-bold px-1 mt-0.5">{errors.password.message}</p>
            )}
          </div>

          {/* Accept terms checkbox */}
          <div className="flex items-center text-xs text-white/80 select-none px-0.5 py-1">
            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition">
              <input 
                type="checkbox" 
                required 
                className="w-4 h-4 rounded border-white/20 bg-white/10 accent-primary text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" 
              />
              <span>I accept the policy and terms</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white text-neutral-950 font-black text-sm rounded-2xl hover:bg-neutral-100 disabled:bg-white/60 disabled:text-neutral-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Social Authentication Providers */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="text-[9px] text-white/45 font-bold uppercase tracking-widest">Sign up with</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button 
              type="button" 
              onClick={() => toast.success('Google Signup Integration')}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95 transition cursor-pointer text-white shadow-sm"
            >
              <FaGoogle size={16} />
            </button>
            <button 
              type="button" 
              onClick={() => toast.success('GitHub Signup Integration')}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95 transition cursor-pointer text-white shadow-sm"
            >
              <FaGithub size={18} />
            </button>
            <button 
              type="button" 
              onClick={() => toast.success('Apple Signup Integration')}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95 transition cursor-pointer text-white shadow-sm"
            >
              <FaApple size={18} />
            </button>
          </div>
        </div>

        {/* Redirect text */}
        <p className="text-xs text-white/70 font-semibold mt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-white hover:underline font-extrabold transition">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
