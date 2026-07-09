const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { cache } = require('../config/redis');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // // Check Redis cache first
    // const cached = await cache.get(`user:${decoded.id}`);
    // if (cached) {
    //   req.user = cached;
    //   return next();
    // }

    const user = await User.findById(decoded.id).select('_id role isActive subscription');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
    }

    req.user = { id: user._id.toString(), role: user.role, subscription: user.subscription };
    // await cache.set(`user:${user._id}`, req.user, 3600);

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    next(error);
  }
};

exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id, role: decoded.role };
    }
    next();
  } catch {
    next(); // Continue without user
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Role '${req.user.role}' is not authorized for this action.`
    });
  }
  next();
};

exports.requirePro = (req, res, next) => {
  const plan = req.user.subscription?.plan;
  if (plan !== 'pro' && plan !== 'enterprise') {
    return res.status(403).json({
      success: false,
      message: 'This feature requires a Pro subscription.',
      upgradeRequired: true
    });
  }
  next();
};
