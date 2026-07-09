const Problem = require('../models/Problem');
const { Submission, DailyActivity } = require('../models/Progress');
const User = require('../models/User');
const { cache } = require('../config/redis');

// @desc    Get all problems with filters
// @route   GET /api/problems
exports.getProblems = async (req, res, next) => {
  try {
    const {
      category, topic, difficulty, search, page = 1, limit = 20,
      sort = 'createdAt', order = 'asc', tags
    } = req.query;

    const query = { isPublished: true };
    if (category) query.category = category;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) query.$text = { $search: search };

    const cacheKey = `problems:${JSON.stringify(query)}:${page}:${limit}:${sort}`;
    // const cached = await cache.get(cacheKey);
    // if (cached) return res.json(cached);

    const skip = (page - 1) * limit;
    const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

    const [problems, total] = await Promise.all([
      Problem.find(query)
        .select('title slug difficulty category topic tags stats xpReward companies type')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Problem.countDocuments(query)
    ]);

    // Add solved status for authenticated user
    let solvedSet = new Set();
    if (req.user) {
      const user = await User.findById(req.user.id).select('solvedProblems').lean();
      solvedSet = new Set(user.solvedProblems.map(id => id.toString()));
    }

    const problemsWithStatus = problems.map(p => ({
      ...p,
      isSolved: solvedSet.has(p._id.toString())
    }));

    const result = {
      success: true,
      count: problems.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      problems: problemsWithStatus
    };

    // await cache.set(cacheKey, result, 600);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single problem
// @route   GET /api/problems/:slug
exports.getProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({
      $or: [{ slug: req.params.slug }, { _id: req.params.slug.length === 24 ? req.params.slug : null }],
      isPublished: true
    }).populate('createdBy', 'name');

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }

    let isSolved = false;
    let userSubmissions = [];

    if (req.user) {
      const user = await User.findById(req.user.id).select('solvedProblems').lean();
      isSolved = user.solvedProblems.some(id => id.toString() === problem._id.toString());

      userSubmissions = await Submission.find({
        user: req.user.id,
        problem: problem._id
      }).sort({ createdAt: -1 }).limit(5).lean();
    }

    res.json({
      success: true,
      problem: { ...problem.toObject(), isSolved },
      userSubmissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit solution
// @route   POST /api/problems/:id/submit
exports.submitSolution = async (req, res, next) => {
  try {
    const { code, language = 'javascript', selectedAnswer, aiHintsUsed = 0 } = req.body;
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }

    let status = 'accepted';
    let testsPassed = 0;
    let totalTests = problem.testCases?.length || 0;
    let marksObtained = 0;

    // MCQ evaluation
    if (problem.type === 'mcq') {
      const isCorrect = selectedAnswer === problem.correctAnswer;
      status = isCorrect ? 'accepted' : 'wrong-answer';
      testsPassed = isCorrect ? 1 : 0;
      totalTests = 1;
    }

    // For coding problems: basic validation (real execution would use judge service)
    if (problem.type === 'coding' && code) {
      // Simulate test run (in production, use Judge0 API)
      testsPassed = Math.floor(totalTests * 0.8); // Placeholder
      status = testsPassed === totalTests ? 'accepted' : 'wrong-answer';
    }

    const xpEarned = status === 'accepted'
      ? Math.max(0, problem.xpReward - aiHintsUsed * 10)
      : 0;

    // Save submission
    const submission = await Submission.create({
      user: req.user.id,
      problem: problem._id,
      status,
      language,
      code,
      testsPassed,
      totalTests,
      aiHintsUsed,
      xpEarned
    });

    // Update problem stats
    await Problem.findByIdAndUpdate(problem._id, {
      $inc: {
        'stats.totalAttempts': 1,
        ...(status === 'accepted' ? { 'stats.totalAccepted': 1 } : {})
      }
    });

    // If accepted, update user stats
    if (status === 'accepted') {
      const user = await User.findById(req.user.id);
      const alreadySolved = user.solvedProblems.some(id => id.toString() === problem._id.toString());

      if (!alreadySolved) {
        user.solvedProblems.push(problem._id);
        user.problemStats.solved += 1;
        user.problemStats[problem.difficulty] += 1;
        user.problemStats.attempted += 1;

        // Update scores
        if (problem.category === 'dsa') user.scores.dsa = Math.min(1000, user.scores.dsa + 2);
        if (problem.category === 'aptitude') user.scores.aptitude = Math.min(1000, user.scores.aptitude + 2);

        await user.save();
        await user.addXP(xpEarned);

        // Badge checks
        await checkAndAwardBadges(user);

        // Daily activity update
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await DailyActivity.findOneAndUpdate(
          { user: req.user.id, date: today },
          { $inc: { problemsSolved: 1, xpEarned }, $addToSet: { topics: problem.topic } },
          { upsert: true }
        );
      }
    }

    res.json({
      success: true,
      submission: {
        status,
        testsPassed,
        totalTests,
        xpEarned,
        explanation: status !== 'accepted' ? problem.explanation : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get similar problems
// @route   GET /api/problems/:id/similar
exports.getSimilarProblems = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id).lean();
    if (!problem) return res.status(404).json({ success: false, message: 'Not found.' });

    const similar = await Problem.find({
      _id: { $ne: problem._id },
      $or: [{ topic: problem.topic }, { difficulty: problem.difficulty }],
      isPublished: true
    })
      .select('title slug difficulty topic')
      .limit(5)
      .lean();

    res.json({ success: true, problems: similar });
  } catch (error) {
    next(error);
  }
};

// Badge awarding logic
async function checkAndAwardBadges(user) {
  const badges = [];

  if (user.problemStats.solved >= 1 && !user.badges.find(b => b.id === 'first-solve')) {
    badges.push({ id: 'first-solve', name: 'First Blood', icon: '🩸' });
  }
  if (user.problemStats.solved >= 100 && !user.badges.find(b => b.id === 'century')) {
    badges.push({ id: 'century', name: 'Century Club', icon: '💯' });
  }
  if (user.streak >= 7 && !user.badges.find(b => b.id === 'streak-7')) {
    badges.push({ id: 'streak-7', name: 'Week Warrior', icon: '🔥' });
  }
  if (user.xp >= 5000 && !user.badges.find(b => b.id === 'xp-5k')) {
    badges.push({ id: 'xp-5k', name: 'XP Legend', icon: '⚡' });
  }

  if (badges.length > 0) {
    user.badges.push(...badges);
    await user.save();
  }

  return badges;
}
