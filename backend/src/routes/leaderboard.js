// leaderboard.js
const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const User = require('../models/User');
const { cache } = require('../config/redis');

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { type = 'xp', period = 'all', limit = 50 } = req.query;
    const cacheKey = `leaderboard:${type}:${period}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, ...cached });

    const sortField = type === 'dsa' ? 'scores.dsa'
      : type === 'aptitude' ? 'scores.aptitude'
      : type === 'streak' ? 'streak'
      : 'xp';

    const users = await User.find({ isActive: true })
      .select('name avatar xp level streak scores badges')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .lean();

    const result = {
      leaderboard: users.map((u, i) => ({
        rank: i + 1,
        _id: u._id,
        name: u.name,
        avatar: u.avatar,
        xp: u.xp,
        level: u.level,
        streak: u.streak,
        scores: u.scores,
        badgeCount: u.badges?.length || 0
      }))
    };

    await cache.set(cacheKey, result, 300); // 5 min cache
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
});

module.exports = router;
