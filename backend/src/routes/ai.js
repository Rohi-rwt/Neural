const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  chat, createSession, generateTest,
  evaluateAnswer, generateRoadmap, getUsage
} = require('../controllers/aiController');

router.use(protect); // All AI routes require auth

router.post('/chat', chat);
router.post('/session', createSession);
router.post('/generate-test', generateTest);
router.post('/evaluate', evaluateAnswer);
router.post('/roadmap', generateRoadmap);
router.get('/usage', getUsage);

module.exports = router;
