const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  category: {
    type: String,
    enum: ['dsa', 'aptitude', 'cs-fundamentals', 'interview'],
    required: true
  },
  topic: {
    type: String,
    required: true,
    enum: [
      'arrays', 'strings', 'linked-list', 'stack', 'queue', 'trees',
      'graphs', 'dynamic-programming', 'greedy', 'backtracking', 'sorting',
      'searching', 'hashing', 'two-pointers', 'sliding-window', 'heap',
      'trie', 'segment-tree', 'bit-manipulation', 'math',
      // Aptitude topics
      'quantitative', 'logical-reasoning', 'verbal', 'data-interpretation',
      'profit-loss', 'time-distance', 'time-work', 'percentages',
      // CS Fundamentals
      'os', 'dbms', 'computer-networks', 'oops', 'system-design',
      // Interview
      'hr', 'behavioral', 'technical'
    ]
  },
  tags: [String],

  // For DSA problems
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [String],

  // Multiple choice questions (for aptitude/tests)
  type: {
    type: String,
    enum: ['coding', 'mcq', 'subjective'],
    default: 'coding'
  },
  options: [{
    label: { type: String, enum: ['A', 'B', 'C', 'D'] },
    text: String
  }],
  correctAnswer: String, // A/B/C/D for MCQ
  explanation: String,

  // Solutions
  solutions: [{
    language: String,
    code: String,
    approach: String,
    timeComplexity: String,
    spaceComplexity: String,
    isPrimary: Boolean
  }],

  hints: [String],

  // Stats
  stats: {
    totalAttempts: { type: Number, default: 0 },
    totalAccepted: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 }
  },

  // XP reward
  xpReward: { type: Number, default: 50 },

  // Companies that asked this
  companies: [String],

  // Linked test cases (for coding problems)
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }],

  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: true },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Auto-generate slug
problemSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  }
  // Update acceptance rate
  if (this.stats.totalAttempts > 0) {
    this.stats.acceptanceRate = Math.round(
      (this.stats.totalAccepted / this.stats.totalAttempts) * 100
    );
  }
  next();
});

problemSchema.index({ category: 1, difficulty: 1, topic: 1 });
problemSchema.index({ slug: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Problem', problemSchema);
