const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  getProblems, getProblem, submitSolution, getSimilarProblems
} = require('../controllers/problemController');

router.get('/', optionalAuth, getProblems);
router.get('/:slug', optionalAuth, getProblem);
router.post('/:id/submit', protect, submitSolution);
router.get('/:id/similar', getSimilarProblems);

module.exports = router;
