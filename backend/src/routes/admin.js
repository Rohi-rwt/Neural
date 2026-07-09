const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Problem = require('../models/Problem');
const { Test } = require('../models/Test');
const { TestAttempt } = require('../models/Test');
const { DailyActivity } = require('../models/Progress');

router.use(protect, authorize('admin', 'moderator'));

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);

    const [totalUsers, activeToday, totalProblems, totalTests, testsToday, newUsersMonth] = await Promise.all([
      User.countDocuments({ isActive: true }),
      DailyActivity.distinct('user', { date: today }),
      Problem.countDocuments({ isPublished: true }),
      Test.countDocuments({ isPublished: true }),
      TestAttempt.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: thisMonth } })
    ]);

    // Weekly signups
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklySignups = await User.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeToday: activeToday.length,
        totalProblems,
        totalTests,
        testsToday,
        newUsersMonth,
        weeklySignups
      }
    });
  } catch (error) { next(error); }
});

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, plan } = req.query;
    const query = {};
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (role) query.role = role;
    if (plan) query['subscription.plan'] = plan;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (error) { next(error); }
});

// POST /api/admin/problems — create problem
router.post('/problems', async (req, res, next) => {
  try {
    const problem = await Problem.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, problem });
  } catch (error) { next(error); }
});

// PUT /api/admin/problems/:id
router.put('/problems/:id', async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });
    res.json({ success: true, problem });
  } catch (error) { next(error); }
});

// DELETE /api/admin/problems/:id
router.delete('/problems/:id', async (req, res, next) => {
  try {
    await Problem.findByIdAndUpdate(req.params.id, { isPublished: false });
    res.json({ success: true, message: 'Problem removed.' });
  } catch (error) { next(error); }
});

// POST /api/admin/tests — create test
router.post('/tests', async (req, res, next) => {
  try {
    const test = await Test.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, test });
  } catch (error) { next(error); }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (error) { next(error); }
});

// PUT /api/admin/users/:id/ban
router.put('/users/:id/ban', authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    res.json({ success: true, message: 'User banned.', user });
  } catch (error) { next(error); }
});

module.exports = router;
