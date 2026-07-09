// topics.js
const express = require('express');
const router = express.Router();

const TOPICS = {
  dsa: [
    { id: 'arrays', name: 'Arrays', icon: '📊', description: 'Indexing, sliding window, two pointers', problemCount: 80, difficulty: 'beginner' },
    { id: 'strings', name: 'Strings', icon: '🔤', description: 'Pattern matching, manipulation, KMP', problemCount: 65, difficulty: 'beginner' },
    { id: 'linked-list', name: 'Linked Lists', icon: '🔗', description: 'Traversal, reversal, cycle detection', problemCount: 45, difficulty: 'beginner' },
    { id: 'stack', name: 'Stack & Queue', icon: '📚', description: 'LIFO/FIFO, monotonic stack', problemCount: 40, difficulty: 'beginner' },
    { id: 'trees', name: 'Trees', icon: '🌳', description: 'Binary trees, BST, traversals, LCA', problemCount: 70, difficulty: 'intermediate' },
    { id: 'graphs', name: 'Graphs', icon: '🕸️', description: 'BFS, DFS, shortest path, topological sort', problemCount: 55, difficulty: 'intermediate' },
    { id: 'dynamic-programming', name: 'Dynamic Programming', icon: '🧩', description: 'Memoization, tabulation, classic patterns', problemCount: 60, difficulty: 'advanced' },
    { id: 'heap', name: 'Heaps & Priority Queue', icon: '⛰️', description: 'Min/Max heap, K-th largest', problemCount: 30, difficulty: 'intermediate' },
    { id: 'backtracking', name: 'Backtracking', icon: '↩️', description: 'Permutations, combinations, N-Queens', problemCount: 25, difficulty: 'advanced' },
    { id: 'trie', name: 'Trie', icon: '🌿', description: 'Prefix trees, word search', problemCount: 20, difficulty: 'advanced' }
  ],
  aptitude: [
    { id: 'quantitative', name: 'Quantitative Aptitude', icon: '📐', problemCount: 120 },
    { id: 'logical-reasoning', name: 'Logical Reasoning', icon: '🧩', problemCount: 90 },
    { id: 'verbal', name: 'Verbal Ability', icon: '📖', problemCount: 80 },
    { id: 'profit-loss', name: 'Profit & Loss', icon: '💰', problemCount: 50 },
    { id: 'time-work', name: 'Time & Work', icon: '⏱️', problemCount: 45 },
    { id: 'time-distance', name: 'Speed, Distance & Time', icon: '🚂', problemCount: 40 }
  ],
  'cs-fundamentals': [
    { id: 'os', name: 'Operating Systems', icon: '🖥️', problemCount: 60 },
    { id: 'dbms', name: 'Database Management', icon: '🗄️', problemCount: 55 },
    { id: 'computer-networks', name: 'Computer Networks', icon: '🌐', problemCount: 50 },
    { id: 'oops', name: 'OOP Concepts', icon: '🔷', problemCount: 45 },
    { id: 'system-design', name: 'System Design', icon: '🏗️', problemCount: 30 }
  ]
};

router.get('/', (req, res) => {
  res.json({ success: true, topics: TOPICS });
});

router.get('/:category', (req, res) => {
  const topics = TOPICS[req.params.category];
  if (!topics) return res.status(404).json({ success: false, message: 'Category not found.' });
  res.json({ success: true, topics });
});

module.exports = router;
