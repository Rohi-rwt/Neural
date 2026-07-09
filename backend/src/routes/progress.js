const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { DailyActivity, Submission } = require('../models/Progress');
const { TestAttempt } = require('../models/Test');

// GET /api/progress/dashboard — full dashboard data
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [user, recentTests, recentSubmissions, activityLog] = await Promise.all([
      User.findById(userId).select('-password').lean(),
      TestAttempt.find({ user: userId, status: 'completed' })
        .populate('test', 'title category')
        .sort({ createdAt: -1 }).limit(5).lean(),
      Submission.find({ user: userId, status: 'accepted' })
        .populate('problem', 'title difficulty topic')
        .sort({ createdAt: -1 }).limit(5).lean(),
      DailyActivity.find({ user: userId })
        .sort({ date: -1 }).limit(84).lean() // 12 weeks
    ]);

    // Build heatmap data
    const heatmap = activityLog.reduce((acc, day) => {
      acc[day.date.toISOString().split('T')[0]] = day.problemsSolved;
      return acc;
    }, {});

    res.json({
      success: true,
      dashboard: {
        user: {
          ...user,
          levelInfo: {
            level: user.level,
            xp: user.xp,
            nextLevelXP: [500, 1200, 2500, 4500, 7500, 12000, 18000, 27000, 40000][user.level] || 99999
          }
        },
        stats: {
          dsa: user.scores.dsa,
          aptitude: user.scores.aptitude,
          interview: user.scores.interview,
          problemsSolved: user.problemStats.solved,
          streak: user.streak,
          xp: user.xp,
          level: user.level
        },
        recentTests,
        recentSubmissions,
        heatmap,
        badges: user.badges,
        weakTopics: user.weakTopics
      }
    });
  } catch (error) { next(error); }
});

// GET /api/progress/heatmap — activity heatmap for last year
router.get('/heatmap', protect, async (req, res, next) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const activities = await DailyActivity.find({
      user: req.user.id,
      date: { $gte: oneYearAgo }
    }).sort({ date: 1 }).lean();

    const heatmap = activities.reduce((acc, a) => {
      acc[a.date.toISOString().split('T')[0]] = {
        problems: a.problemsSolved,
        xp: a.xpEarned,
        tests: a.testsTaken
      };
      return acc;
    }, {});

    res.json({ success: true, heatmap });
  } catch (error) { next(error); }
});

// GET /api/progress/topic-mastery — skill breakdown
router.get('/topic-mastery', protect, async (req, res, next) => {
  try {
    const submissions = await Submission.find({
      user: req.user.id,
      status: 'accepted'
    }).populate('problem', 'topic difficulty').lean();

    const topicMap = {};
    for (const sub of submissions) {
      const topic = sub.problem?.topic;
      if (!topic) continue;
      if (!topicMap[topic]) topicMap[topic] = { solved: 0, easy: 0, medium: 0, hard: 0 };
      topicMap[topic].solved++;
      topicMap[topic][sub.problem.difficulty]++;
    }

    res.json({ success: true, topicMastery: topicMap });
  } catch (error) { next(error); }
});

module.exports = router;
