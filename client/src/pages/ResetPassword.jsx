import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  const emailFromState = location.state?.email || '';

  useEffect(() => {
    if (emailFromState) {
      setValue('email', emailFromState);
    }
  }, [emailFromState, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await resetPassword(data.email, data.otp, data.newPassword);
      toast.success(res.message || 'Password updated successfully! Log in now.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Reset failed. Check OTP and email.');
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
        <div className="flex flex-col items-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-xs text-white/70 mt-2 font-medium">
            Provide your verification OTP code and choose a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-left">
          {/* Email Address */}
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

          {/* OTP Code */}
          <div className="flex flex-col gap-1 text-center">
            <label className="text-[10px] font-bold tracking-wider uppercase text-white/60 text-left mb-1 px-1">
              6-Digit OTP Code
            </label>
            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              {...register('otp', { required: 'OTP code is required' })}
              className="w-full px-4 py-3 text-center text-lg tracking-[0.25em] font-mono bg-white/10 border border-white/15 focus:border-white focus:ring-1 focus:ring-white/20 rounded-2xl outline-none text-white transition-all duration-200 font-black"
            />
            {errors.otp && (
              <p className="text-[10px] text-red-400 font-bold mt-1 text-center">{errors.otp.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1">
            <div className="floating-input-group relative w-full">
              <input
                type="password"
                placeholder=" "
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className="w-full px-4 py-3 bg-white/10 border border-white/15 focus:border-white focus:ring-1 focus:ring-white/20 rounded-2xl text-sm outline-none text-white transition-all duration-200 placeholder-transparent font-medium"
              />
              <label className="absolute left-4 select-none pointer-events-none transition-all duration-200 text-white/50">
                New Password
              </label>
            </div>
            {errors.newPassword && (
              <p className="text-[10px] text-red-400 font-bold px-1 mt-0.5">{errors.newPassword.message}</p>
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
              'Reset Password'
            )}
          </button>
        </form>

        <div className="pt-5 border-t border-white/10">
          <Link
            to="/login"
            className="text-xs text-white/85 hover:text-white font-semibold transition"
          >
            Back to Log In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
