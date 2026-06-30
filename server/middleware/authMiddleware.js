import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
    }

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in protectRoute middleware:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied - Admin role required' });
  }
};
