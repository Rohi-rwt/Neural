const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['dsa', 'aptitude', 'cs-fundamentals', 'interview', 'mixed', 'company-specific'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  duration: { type: Number, required: true }, // minutes
  questions: [{
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    marks: { type: Number, default: 4 },
    negativeMarks: { type: Number, default: 1 },
    order: Number
  }],
  totalMarks: Number,
  passingMarks: Number,
  xpReward: { type: Number, default: 500 },
  isAIGenerated: { type: Boolean, default: false },
  company: String, // for company-specific tests
  targetAudience: {
    type: String,
    enum: ['faang', 'startup', 'internship', 'all'],
    default: 'all'
  },
  isPublished: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Attempt schema (each test attempt by a user)
const testAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  duration: Number, // actual time taken in seconds
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  answers: [{
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    selectedAnswer: String, // A/B/C/D
    isCorrect: Boolean,
    marksObtained: Number,
    timeTaken: Number // seconds
  }],
  score: {
    obtained: { type: Number, default: 0 },
    total: Number,
    percentage: Number,
    grade: String
  },
  analysis: {
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    accuracy: Number,
    averageTimePerQuestion: Number,
    topicWiseScore: mongoose.Schema.Types.Mixed,
    weakTopics: [String],
    strongTopics: [String]
  },
  aiReview: String, // AI-generated review of the attempt
  xpEarned: { type: Number, default: 0 }
}, { timestamps: true });

// Calculate grade
testAttemptSchema.methods.calculateGrade = function () {
  const pct = this.score.percentage;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
};

testAttemptSchema.index({ user: 1, createdAt: -1 });
testAttemptSchema.index({ test: 1 });

const Test = mongoose.model('Test', testSchema);
const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);

module.exports = { Test, TestAttempt };
