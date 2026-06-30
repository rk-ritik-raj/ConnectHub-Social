import User from '../models/User.js';
import { generateTokenAndSetCookie, clearTokenCookie } from '../utils/token.js';
import { validationResult } from 'express-validator';

// 6-digit OTP generator
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, email, password, fullName } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const user = new User({
      username,
      email,
      password,
      fullName,
      verificationToken: null,
      isEmailVerified: true,
    });

    await user.save();

    // Auto-login the user immediately on signup
    generateTokenAndSetCookie(res, user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to ConnectHub!',
      user: userObj,
    });
  } catch (error) {
    console.error('Error in signup controller:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and verification code are required' });
  }

  try {
    const user = await User.findOne({ email, verificationToken: code });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or verification code' });
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    await user.save();

    generateTokenAndSetCookie(res, user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: userObj,
    });
  } catch (error) {
    console.error('Error in verifyEmail controller:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { loginIdentifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: loginIdentifier.toLowerCase() }, { username: loginIdentifier.toLowerCase() }],
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid username/email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid username/email or password' });
    }

    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      user.verificationToken = null;
      await user.save();
    }

    generateTokenAndSetCookie(res, user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: userObj,
    });
  } catch (error) {
    console.error('Error in login controller:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const logout = async (req, res) => {
  try {
    clearTokenCookie(res);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout controller:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email' });
    }

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    console.log(`\n--- PASSWORD RESET OTP FOR ${email} ---`);
    console.log(`OTP: ${otp}`);
    console.log(`-----------------------------------------\n`);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP generated',
      otpCode: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('Error in forgotPassword controller:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields (email, otp, newPassword) are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  try {
    const user = await User.findOne({
      email,
      resetOtp: otp,
      resetOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Error in resetPassword controller:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getMe = async (req, res) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    console.error('Error in getMe controller:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
