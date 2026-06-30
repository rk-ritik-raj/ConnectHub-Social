import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '15d',
  });

  res.cookie('token', token, {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // true in production
    sameSite: 'strict', // Prevents CSRF attacks
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  });

  return token;
};

export const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
};
