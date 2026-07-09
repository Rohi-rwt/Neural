require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const { Test } = require('../models/Test');
const logger = require('./logger');

const sampleProblems = [
  // DSA - Arrays
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'easy', category: 'dsa', topic: 'arrays', type: 'mcq',
    options: [
      { label: 'A', text: 'O(n²) with nested loops' },
      { label: 'B', text: 'O(n) with hash map' },
      { label: 'C', text: 'O(n log n) with sorting' },
      { label: 'D', text: 'O(1) with pointer' }
    ],
    correctAnswer: 'B',
    explanation: 'Using a hash map, we store each number and its index. For each element, we check if the complement (target - num) exists in the map. This gives O(n) time and O(n) space.',
    tags: ['arrays', 'hash-table', 'faang'],
    companies: ['Google', 'Amazon', 'Meta'],
    xpReward: 100,
    hints: ['Think about using a hash map', 'For each element, what do you need to find?', 'Store the complement']
  },
  {
  title: 'Binary Search Basics',
  description: 'Which condition must be satisfied before applying Binary Search on an array?',
  difficulty: 'easy', category: 'dsa', topic: 'searching', type: 'mcq',
  options: [
    { label: 'A', text: 'Array must be sorted' },
    { label: 'B', text: 'Array must contain unique elements' },
    { label: 'C', text: 'Array size must be even' },
    { label: 'D', text: 'Array must contain positive numbers only' }
  ],
  correctAnswer: 'A',
  explanation: 'Binary Search only works correctly on sorted arrays because it repeatedly divides the search space into two halves.',
  tags: ['binary-search', 'arrays'],
  companies: ['Google', 'Microsoft', 'Amazon'],
  xpReward: 75
},

{
  title: 'Stack Applications',
  description: 'Which of the following is the most common application of a stack?',
  difficulty: 'easy', category: 'dsa', topic: 'stack', type: 'mcq',
  options: [
    { label: 'A', text: 'Breadth First Search' },
    { label: 'B', text: 'Function Call Management' },
    { label: 'C', text: 'Shortest Path Algorithm' },
    { label: 'D', text: 'Database Indexing' }
  ],
  correctAnswer: 'B',
  explanation: 'Programming languages use a stack to manage function calls and recursion.',
  tags: ['stack', 'recursion'],
  companies: ['Adobe', 'Amazon'],
  xpReward: 75
},
{
  title: 'Contains Duplicate',
  description: 'Given an integer array nums, return true if any value appears at least twice.',
  difficulty: 'easy',
  category: 'dsa',
  topic: 'arrays',
  type: 'mcq',
  options: [
    { label: 'A', text: 'Nested loops O(n²)' },
    { label: 'B', text: 'Sort then compare adjacent' },
    { label: 'C', text: 'Use a HashSet' },
    { label: 'D', text: 'Binary Search' }
  ],
  correctAnswer: 'C',
  explanation: 'A HashSet lets us detect duplicates in O(n) time.',
  tags: ['arrays','hashing'],
  companies: ['Amazon','Google'],
  xpReward: 100
},
{
  title: 'Queue Operations',
  description: 'Which data structure follows the FIFO principle?',
  difficulty: 'easy', category: 'dsa', topic: 'queue', type: 'mcq',
  options: [
    { label: 'A', text: 'Stack' },
    { label: 'B', text: 'Queue' },
    { label: 'C', text: 'Tree' },
    { label: 'D', text: 'Graph' }
  ],
  correctAnswer: 'B',
  explanation: 'Queue follows First In First Out (FIFO), where the first inserted element is removed first.',
  tags: ['queue', 'fifo'],
  companies: ['Infosys', 'TCS', 'Amazon'],
  xpReward: 75
},

{
  title: 'Hash Table Lookup',
  description: 'What is the average time complexity of searching an element in a Hash Table?',
  difficulty: 'easy', category: 'dsa', topic: 'hashing', type: 'mcq',
  options: [
    { label: 'A', text: 'O(1)' },
    { label: 'B', text: 'O(log n)' },
    { label: 'C', text: 'O(n)' },
    { label: 'D', text: 'O(n log n)' }
  ],
  correctAnswer: 'A',
  explanation: 'Hash tables provide average constant-time lookup because keys are mapped directly to buckets using a hash function.',
  tags: ['hash-table', 'hashing'],
  companies: ['Meta', 'Google', 'Amazon'],
  xpReward: 100
},

{
  title: 'Sliding Window Technique',
  description: 'Sliding Window technique is mainly used to optimize which type of problems?',
  difficulty: 'medium', category: 'dsa', topic: 'sliding-window', type: 'mcq',
  options: [
    { label: 'A', text: 'Tree Traversal' },
    { label: 'B', text: 'Subarray and Substring Problems' },
    { label: 'C', text: 'Graph Coloring' },
    { label: 'D', text: 'Sorting Algorithms' }
  ],
  correctAnswer: 'B',
  explanation: 'Sliding Window avoids recomputing values for overlapping ranges, making subarray and substring problems much more efficient.',
  tags: ['sliding-window', 'arrays', 'strings'],
  companies: ['Google', 'Amazon', 'Uber'],
  xpReward: 125
},
  {
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    description: 'Given an integer array nums, find the subarray with the largest sum and return its sum.',
    difficulty: 'medium', category: 'dsa', topic: 'dynamic-programming', type: 'mcq',
    options: [
      { label: 'A', text: 'O(n²) brute force' },
      { label: 'B', text: 'O(n log n) divide and conquer' },
      { label: 'C', text: 'O(n) Kadane\'s algorithm' },
      { label: 'D', text: 'O(log n) binary search' }
    ],
    correctAnswer: 'C',
    explanation: 'Kadane\'s algorithm: maintain currentMax and globalMax. At each step, currentMax = max(num, currentMax + num). If currentMax > globalMax, update globalMax.',
    tags: ['arrays', 'dynamic-programming', 'kadanes'],
    companies: ['Amazon', 'Microsoft', 'Apple'],
    xpReward: 150,
    hints: ['Think about extending or starting fresh at each position']
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    difficulty: 'easy', category: 'dsa', topic: 'stack', type: 'mcq',
    options: [
      { label: 'A', text: 'Use a counter for each bracket type' },
      { label: 'B', text: 'Use a stack to track opening brackets' },
      { label: 'C', text: 'Sort the string first' },
      { label: 'D', text: 'Use recursion' }
    ],
    correctAnswer: 'B',
    explanation: 'Push opening brackets onto stack. For closing brackets, check if top of stack matches. If not, invalid. At end, stack should be empty.',
    tags: ['stack', 'strings'],
    companies: ['Google', 'Facebook', 'Bloomberg'],
    xpReward: 100
  },
  // Aptitude
  {
    title: 'Percentage Profit Calculation',
    description: 'A shopkeeper buys an article for ₹800 and sells it for ₹1000. What is the profit percentage?',
    difficulty: 'easy', category: 'aptitude', topic: 'profit-loss', type: 'mcq',
    options: [
      { label: 'A', text: '20%' },
      { label: 'B', text: '25%' },
      { label: 'C', text: '15%' },
      { label: 'D', text: '30%' }
    ],
    correctAnswer: 'B',
    explanation: 'Profit = SP - CP = 1000 - 800 = 200. Profit% = (Profit/CP) × 100 = (200/800) × 100 = 25%',
    tags: ['profit-loss', 'basics'],
    xpReward: 75
  },
  {
    title: 'Time and Work — Two Workers',
    description: 'A can complete a work in 12 days and B can complete the same work in 18 days. In how many days can they together complete the work?',
    difficulty: 'medium', category: 'aptitude', topic: 'time-work', type: 'mcq',
    options: [
      { label: 'A', text: '6 days' },
      { label: 'B', text: '7.2 days' },
      { label: 'C', text: '8 days' },
      { label: 'D', text: '7.5 days' }
    ],
    correctAnswer: 'B',
    explanation: 'A\'s 1-day work = 1/12, B\'s 1-day work = 1/18. Together = 1/12 + 1/18 = 3/36 + 2/36 = 5/36. Days = 36/5 = 7.2 days.',
    tags: ['time-work', 'fractions'],
    xpReward: 100
  },
  // CS Fundamentals
  {
    title: 'Process vs Thread',
    description: 'Which of the following best describes the difference between a process and a thread?',
    difficulty: 'medium', category: 'cs-fundamentals', topic: 'os', type: 'mcq',
    options: [
      { label: 'A', text: 'Processes share memory; threads do not' },
      { label: 'B', text: 'Threads share memory within a process; processes have separate memory' },
      { label: 'C', text: 'There is no difference' },
      { label: 'D', text: 'Threads are heavier than processes' }
    ],
    correctAnswer: 'B',
    explanation: 'Threads within the same process share the process\'s memory (heap, code segment) but have their own stack. Processes have completely separate memory spaces.',
    tags: ['os', 'processes', 'threads'],
    xpReward: 100
  },
  {
    title: 'SQL Joins — INNER vs LEFT',
    description: 'What is the difference between INNER JOIN and LEFT JOIN in SQL?',
    difficulty: 'easy', category: 'cs-fundamentals', topic: 'dbms', type: 'mcq',
    options: [
      { label: 'A', text: 'INNER JOIN returns all rows from both tables' },
      { label: 'B', text: 'LEFT JOIN returns all rows from left table and matched from right; unmatched are NULL' },
      { label: 'C', text: 'They are identical' },
      { label: 'D', text: 'LEFT JOIN is faster than INNER JOIN always' }
    ],
    correctAnswer: 'B',
    explanation: 'INNER JOIN returns only matching rows. LEFT JOIN returns all rows from the left table; for unmatched rows from the right table, NULL is returned.',
    tags: ['dbms', 'sql', 'joins'],
    xpReward: 75
  },
  // Interview
  {
    title: 'Tell Me About Yourself',
    description: 'How should you structure your "Tell me about yourself" answer in a technical interview?',
    difficulty: 'easy', category: 'interview', topic: 'hr', type: 'mcq',
    options: [
      { label: 'A', text: 'Read your entire resume chronologically' },
      { label: 'B', text: 'Talk about your personal life first' },
      { label: 'C', text: 'Present → Past → Future: current role, relevant experience, why this position' },
      { label: 'D', text: 'Only mention educational qualifications' }
    ],
    correctAnswer: 'C',
    explanation: 'The best structure is Present-Past-Future: Start with your current situation, connect it to relevant past experience, then explain why you\'re excited about this specific role. Keep it under 2 minutes.',
    tags: ['hr', 'communication', 'basics'],
    xpReward: 50
  }
];

const sampleTests = [
  {
    title: 'DSA Sprint — Arrays & Strings',
    description: 'Test your knowledge of fundamental array and string algorithms',
    category: 'dsa',
    difficulty: 'medium',
    duration: 45,
    xpReward: 500,
    targetAudience: 'all',
    isPublished: true
  },
  {
    title: 'Aptitude Challenge — Quantitative',
    description: 'Practice quantitative aptitude for placement exams',
    category: 'aptitude',
    difficulty: 'mixed',
    duration: 60,
    xpReward: 400,
    isPublished: true
  },
  {
    title: 'CS Fundamentals Quick Test',
    description: 'OS, DBMS, CN basics for technical interviews',
    category: 'cs-fundamentals',
    difficulty: 'easy',
    duration: 30,
    xpReward: 300,
    isPublished: true
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB for seeding');

    // Clear existing
    await Problem.deleteMany({});
    await Test.deleteMany({});
    logger.info('Cleared existing data');

    // Insert problems
    // Insert problems
 
const problemsToInsert = sampleProblems.map(problem => ({
  ...problem,
  isPublished: true,
  slug: problem.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}));
const problems = await Problem.insertMany(problemsToInsert);
    logger.info(`✅ Inserted ${problems.length} problems`);

    // Create tests with problem references
    for (const testData of sampleTests) {
      const randomProblems = problems
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .map((p, i) => ({ problem: p._id, marks: 4, negativeMarks: 1, order: i + 1 }));

      await Test.create({
        ...testData,
        questions: randomProblems,
        totalMarks: randomProblems.length * 4,
        passingMarks: randomProblems.length * 2
      });
    }

    logger.info(`✅ Inserted ${sampleTests.length} tests`);
    logger.info('🌱 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
