const mongoose = require('mongoose');

// Daily activity log
const dailyActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  problemsSolved: { type: Number, default: 0 },
  testsTaken: { type: Number, default: 0 },
  aiQueriesUsed: { type: Number, default: 0 },
  studyMinutes: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
  topics: [String]
}, { timestamps: false });

dailyActivitySchema.index({ user: 1, date: -1 });

// Submission model
const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  status: {
    type: String,
    enum: ['accepted', 'wrong-answer', 'time-limit', 'runtime-error', 'compilation-error'],
    required: true
  },
  language: { type: String, default: 'javascript' },
  code: String,
  executionTime: Number, // ms
  memoryUsed: Number, // KB
  testsPassed: Number,
  totalTests: Number,
  aiHintsUsed: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 }
}, { timestamps: true });

submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ user: 1, createdAt: -1 });

// AI Chat History
const aiChatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: String,
  mode: {
    type: String,
    enum: ['teacher', 'interviewer', 'hint', 'debug'],
    default: 'teacher'
  },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    timestamp: { type: Date, default: Date.now },
    tokensUsed: Number
  }],
  topic: String,
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

aiChatSchema.index({ user: 1, createdAt: -1 });

const DailyActivity = mongoose.model('DailyActivity', dailyActivitySchema);
const Submission = mongoose.model('Submission', submissionSchema);
const AIChat = mongoose.model('AIChat', aiChatSchema);

module.exports = { DailyActivity, Submission, AIChat };
