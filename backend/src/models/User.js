const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  avatar: { type: String, default: '' },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  providerId: String,

  // Subscription
  subscription: {
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
    startDate: Date,
    endDate: Date,
    razorpaySubscriptionId: String,
    stripeSubscriptionId: String
  },

  // Gamification
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },

  badges: [{
    id: String,
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],

  // Scores
  scores: {
    dsa: { type: Number, default: 0 },
    aptitude: { type: Number, default: 0 },
    interview: { type: Number, default: 0 },
    overall: { type: Number, default: 0 }
  },

  // Learning target
  target: {
    type: String,
    enum: ['faang', 'startup', 'internship', 'general'],
    default: 'general'
  },

  // Problem solving stats
  problemStats: {
    solved: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
  },

  // Solved problems
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],

  // Weak topics (AI detected)
  weakTopics: [String],

  // AI usage
  aiUsage: {
    daily: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },

  // Settings
  settings: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    emailNotifications: { type: Boolean, default: true },
    dailyGoal: { type: Number, default: 5 }
  },

  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: level based on XP
userSchema.virtual('levelInfo').get(function () {
  const xpThresholds = [0, 500, 1200, 2500, 4500, 7500, 12000, 18000, 27000, 40000];
  let level = 1;
  for (let i = 0; i < xpThresholds.length; i++) {
    if (this.xp >= xpThresholds[i]) level = i + 1;
  }
  const levelNames = ['Beginner', 'Learner', 'Coder', 'Developer', 'Engineer',
    'Pro Coder', 'Expert', 'Master', 'Grandmaster', 'Legend'];
  return { level, name: levelNames[level - 1] || 'Legend', xp: this.xp };
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update streak on login
userSchema.pre('save', function (next) {
  if (!this.isModified('lastActiveDate')) return next();
  const today = new Date();
  const last = this.lastActiveDate ? new Date(this.lastActiveDate) : null;
  if (last) {
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) this.streak += 1;
    else if (diffDays > 1) this.streak = 1;
  }
  this.lastActiveDate = today;
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate refresh token
userSchema.methods.getRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });
};

// Add XP and level up
userSchema.methods.addXP = async function (amount) {
  this.xp += amount;
  const xpThresholds = [0, 500, 1200, 2500, 4500, 7500, 12000, 18000, 27000, 40000];
  let newLevel = 1;
  for (let i = 0; i < xpThresholds.length; i++) {
    if (this.xp >= xpThresholds[i]) newLevel = i + 1;
  }
  const leveledUp = newLevel > this.level;
  this.level = newLevel;
  await this.save();
  return { leveledUp, newLevel, totalXP: this.xp };
};

// Reset daily AI usage
userSchema.methods.checkAndResetAIUsage = async function () {
  const today = new Date();
  const lastReset = new Date(this.aiUsage.lastReset);
  if (today.toDateString() !== lastReset.toDateString()) {
    this.aiUsage.daily = 0;
    this.aiUsage.lastReset = today;
    await this.save();
  }
};

// Index for leaderboard queries
userSchema.index({ xp: -1 });
userSchema.index({ 'scores.dsa': -1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
