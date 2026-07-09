const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
// const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const { sendEmail } = require('../services/emailService');

// Helper: send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedToken();
  const refreshToken = user.getRefreshToken();

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  return res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        subscription: user.subscription,
        scores: user.scores,
        badges: user.badges,
        target: user.target
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      verificationToken
    });

    // Send verification email (non-blocking)
    sendEmail({
      to: email,
      subject: 'Welcome to NeuralPath! Verify your email',
      template: 'welcome',
      data: {
        name,
        verifyUrl: `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`
      }
    }).catch(err => logger.error('Email send error:', err));

    sendTokenResponse(user, 201, res);
  } catch (error) {
    logger.error('Register error:', error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.provider !== 'local') {
      return res.status(400).json({
        success: false,
        message: `Please login with ${user.provider}.`
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Update streak
    user.lastActiveDate = new Date();
    await user.save();

    // Cache user session
    // await cache.set(`user:${user._id}`, { id: user._id, role: user.role }, 3600);

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
exports.googleCallback = async (req, res) => {
  try {
    const token = req.user.getSignedToken();
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('solvedProblems', 'title difficulty topic')
      .select('-__v');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    const newToken = user.getSignedToken();
    res.json({ success: true, token: newToken });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  // if (req.user) {
  //   await cache.del(`user:${req.user.id}`);
  // }
  res.cookie('refreshToken', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully.' });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user with that email.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: 'NeuralPath Password Reset',
      template: 'resetPassword',
      data: {
        name: user.name,
        resetUrl: `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
      }
    });

    res.json({ success: true, message: 'Password reset email sent.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
