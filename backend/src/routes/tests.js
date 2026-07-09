const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Test, TestAttempt } = require('../models/Test');
const User = require('../models/User');
const { DailyActivity } = require('../models/Progress');
const { cache } = require('../config/redis');

// GET /api/tests — list available tests
router.get('/', protect, async (req, res, next) => {
  try {
    const { category, difficulty, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const tests = await Test.find(query)
      .select('-questions')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Test.countDocuments(query);
    res.json({ success: true, tests, total });
  } catch (error) { next(error); }
});

// GET /api/tests/:id — get single test
router.get('/:id', protect, async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('questions.problem', 'title description options type difficulty topic examples constraints hints');

    if (!test) return res.status(404).json({ success: false, message: 'Test not found.' });
    res.json({ success: true, test });
  } catch (error) { next(error); }
});

// POST /api/tests/:id/start — start a test attempt
router.post('/:id/start', protect, async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found.' });

    // Check if already in progress
    const existing = await TestAttempt.findOne({
      user: req.user.id,
      test: test._id,
      status: 'in-progress'
    });
    if (existing) return res.json({ success: true, attemptId: existing._id, resuming: true });

    const attempt = await TestAttempt.create({
      user: req.user.id,
      test: test._id,
      status: 'in-progress'
    });

    res.json({ success: true, attemptId: attempt._id });
  } catch (error) { next(error); }
});

// POST /api/tests/:id/submit — submit a test
router.post('/:id/submit', protect, async (req, res, next) => {
  try {
    const { attemptId, answers, timeTaken } = req.body;

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      user: req.user.id,
      test: req.params.id
    });
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });

    const test = await Test.findById(req.params.id)
      .populate('questions.problem', 'correctAnswer explanation topic difficulty');

    let totalMarks = 0;
    let obtained = 0;
    let correct = 0, wrong = 0, skipped = 0;
    const processedAnswers = [];
    const topicScores = {};

    for (const q of test.questions) {
      const prob = q.problem;
      const userAns = answers.find(a => a.problemId === prob._id.toString());
      totalMarks += q.marks;

      const topic = prob.topic;
      if (!topicScores[topic]) topicScores[topic] = { correct: 0, total: 0 };
      topicScores[topic].total++;

      if (!userAns || !userAns.selectedAnswer) {
        skipped++;
        processedAnswers.push({ problem: prob._id, isCorrect: false, marksObtained: 0 });
      } else {
        const isCorrect = userAns.selectedAnswer === prob.correctAnswer;
        const marks = isCorrect ? q.marks : -q.negativeMarks;
        obtained += marks;
        if (isCorrect) { correct++; topicScores[topic].correct++; }
        else wrong++;

        processedAnswers.push({
          problem: prob._id,
          selectedAnswer: userAns.selectedAnswer,
          isCorrect,
          marksObtained: marks,
          timeTaken: userAns.timeTaken || 0
        });
      }
    }

    const percentage = totalMarks > 0 ? Math.round((obtained / totalMarks) * 100) : 0;

    // Calculate weak/strong topics
    const weakTopics = Object.entries(topicScores)
      .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.5)
      .map(([t]) => t);
    const strongTopics = Object.entries(topicScores)
      .filter(([, s]) => s.total > 0 && s.correct / s.total >= 0.7)
      .map(([t]) => t);

    // XP earned based on score
    const xpEarned = Math.round((percentage / 100) * (test.xpReward || 500));

    // Update attempt
    attempt.status = 'completed';
    attempt.endTime = new Date();
    attempt.duration = timeTaken;
    attempt.answers = processedAnswers;
    attempt.score = {
      obtained: Math.max(0, obtained),
      total: totalMarks,
      percentage,
      grade: attempt.calculateGrade()
    };
    attempt.analysis = {
      correct, wrong, skipped,
      accuracy: correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0,
      averageTimePerQuestion: timeTaken > 0 ? Math.round(timeTaken / test.questions.length) : 0,
      topicWiseScore: topicScores,
      weakTopics,
      strongTopics
    };
    attempt.xpEarned = xpEarned;
    await attempt.save();

    // Update user
    const user = await User.findById(req.user.id);
    user.weakTopics = [...new Set([...user.weakTopics, ...weakTopics])].slice(0, 10);
    await user.save();
    await user.addXP(xpEarned);

    // Daily activity
    const today = new Date(); today.setHours(0, 0, 0, 0);
    await DailyActivity.findOneAndUpdate(
      { user: req.user.id, date: today },
      { $inc: { testsTaken: 1, xpEarned } },
      { upsert: true }
    );

    res.json({
      success: true,
      result: {
        score: attempt.score,
        analysis: attempt.analysis,
        xpEarned,
        attemptId: attempt._id
      }
    });
  } catch (error) { next(error); }
});

// GET /api/tests/attempts/history — user test history
router.get('/attempts/history', protect, async (req, res, next) => {
  try {
    const attempts = await TestAttempt.find({
      user: req.user.id,
      status: 'completed'
    })
      .populate('test', 'title category difficulty')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, attempts });
  } catch (error) { next(error); }
});

module.exports = router;
