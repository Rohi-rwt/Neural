// users.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    res.json({ success: true, user });
  } catch (e) { next(e); }
});

router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, target, settings } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...(name && { name }), ...(target && { target }), ...(settings && { settings }) },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (e) { next(e); }
});

router.put('/password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated.' });
  } catch (e) { next(e); }
});

module.exports = router;
