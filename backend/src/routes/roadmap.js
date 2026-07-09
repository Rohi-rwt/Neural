const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateRoadmap } = require('../controllers/aiController');

router.post('/generate', protect, generateRoadmap);

// GET default roadmap templates
router.get('/templates', (req, res) => {
  res.json({
    success: true,
    templates: [
      { id: 'faang-90', name: 'FAANG 90-Day Plan', duration: 90, target: 'faang', description: 'Intensive plan targeting Google, Amazon, Meta, Apple, Netflix' },
      { id: 'startup-30', name: 'Startup Ready in 30 Days', duration: 30, target: 'startup', description: 'Quick ramp-up for startup interviews' },
      { id: 'intern-7', name: '7-Day Internship Sprint', duration: 7, target: 'internship', description: 'Last-minute prep for internship drives' }
    ]
  });
});

module.exports = router;
