import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiLock } from 'react-icons/fi';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await forgotPassword(data.email);
      toast.success(res.message || 'OTP code sent! Check your email or logs.');
      navigate('/reset-password', { state: { email: data.email } });
    } catch (err) {
      toast.error(err.message || 'Error requesting code.');
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
        className="relative z-10 w-full max-w-[420px] bg-white/10 dark:bg-black/25 backdrop-blur-xl border border-white/20 rounded-[28px] p-8 md:p-10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] flex flex-col gap-6 text-white text-center"
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white/10 text-white mb-2 border border-white/10">
          <FiLock size={24} />
        </div>
        
        <div>
          <h2 className="text-xl font-bold tracking-tight">Trouble logging in?</h2>
          <p className="text-xs text-white/70 mt-2 leading-relaxed max-w-xs mx-auto">
            Enter your email and we'll send you an OTP to get back into your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-left">
          <div className="flex flex-col gap-1">
            <div className="floating-input-group relative w-full">
              <input
                type="email"
                placeholder=" "
                {...register('email', { required: 'Email is required' })}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white text-neutral-950 font-black text-sm rounded-2xl hover:bg-neutral-100 disabled:bg-white/60 disabled:text-neutral-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] transition-all duration-200 cursor-pointer flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send Login OTP'
            )}
          </button>
        </form>

        <div className="flex items-center my-2">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="px-3 text-[9px] text-white/45 font-bold uppercase tracking-wider">or</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <div>
          <Link
            to="/register"
            className="text-xs font-bold text-white hover:underline transition"
          >
            Create new account
          </Link>
        </div>

        <div className="pt-5 border-t border-white/10">
          <Link
            to="/login"
            className="text-xs text-white/80 hover:text-white font-semibold transition"
          >
            Back to Log In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
