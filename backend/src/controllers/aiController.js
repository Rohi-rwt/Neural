 const OpenAI = require("openai");
const { AIChat, DailyActivity } = require('../models/Progress');
const User = require('../models/User');
const Problem = require('../models/Problem');
const logger = require('../utils/logger');

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});
 
// System prompts for different AI modes
const SYSTEM_PROMPTS = {
  teacher: `You are NeuralPath AI Tutor — an expert, friendly coding and aptitude tutor.
Your goal is to help students learn effectively. Always:
- Explain concepts step by step with clear examples
- Mention time and space complexity for algorithms  
- Use code examples in JavaScript/Python when relevant
- Detect and address knowledge gaps
- Encourage with positive reinforcement
- Format responses with clear structure using markdown
- For DSA: explain the intuition before the algorithm
- For Aptitude: show shortcut tricks and formulas
- Keep responses concise but complete (under 400 words unless explaining complex topics)`,

  interviewer: `You are a strict FAANG technical interviewer conducting a mock interview.
Behavior:
- Ask one question at a time, then evaluate the response
- Score answers on: Technical Accuracy (1-10), Communication (1-10), Problem Solving (1-10)
- Point out mistakes bluntly but professionally
- Ask follow-up questions to probe deeper understanding
- Simulate real interview pressure without being rude
- After evaluation, give specific improvement suggestions
- Format: [Score: X/10] [Feedback] [Follow-up Question]`,

  hint: `You are a helpful coding assistant in Hint Mode.
Rules:
- NEVER give the complete solution directly
- Guide with progressive hints (Hint 1 → Hint 2 → Hint 3)
- Ask Socratic questions to lead the student to the answer
- If asked for the answer, say "I can't give the full answer in Hint Mode, but let me guide you..."
- Celebrate small progress with encouragement
- Help identify the approach/algorithm without solving it`,

  debug: `You are an expert code debugger and reviewer.
Focus on:
- Identifying bugs, edge cases, and logic errors
- Explaining WHY the bug exists (not just what it is)
- Suggesting optimizations and better practices
- Checking for time/space complexity improvements
- Code readability and clean code principles
- Always show corrected code snippet with explanation`
};

// AI limits per plan
const AI_LIMITS = {
  free: 30,
  pro: -1,
  enterprise: -1
};

// @desc    Chat with AI Tutor
// @route   POST /api/ai/chat
exports.chat = async (req, res, next) => {
  try {
    const { message, mode = 'teacher', sessionId, problemId, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const user = await User.findById(req.user.id);

    await user.checkAndResetAIUsage();
    const limit = AI_LIMITS[user.subscription.plan] || AI_LIMITS.free;

    if (limit !== -1 && user.aiUsage.daily >= limit) {
      return res.status(429).json({
        success: false,
        message: `Daily AI limit reached (${limit} queries). Upgrade to Pro for unlimited access.`,
        upgradeRequired: true
      });
    }

    let systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.teacher;

    if (problemId) {
      const problem = await Problem.findById(problemId).lean();
      if (problem) {
        systemPrompt += `\n\nCurrent Problem Context:\nTitle: ${problem.title}\nDifficulty: ${problem.difficulty}\nTopic: ${problem.topic}\nDescription: ${problem.description.substring(0, 500)}`;
      }
    }

    systemPrompt += `\n\nStudent Profile:\n- Level: ${user.level} (${user.xp} XP)\n- Weak topics: ${user.weakTopics.join(', ') || 'None detected yet'}\n- Target: ${user.target}`;

    const recentHistory = conversationHistory.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: message }
    ];

    const completion = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024
    });
console.log(JSON.stringify(completion, null, 2));
    const fullResponse = completion.choices[0].message.content;
 
    // Update AI usage
    user.aiUsage.daily += 1;
    user.aiUsage.total += 1;
    await user.save();

    // Detect and update weak topics
    const weakTopicsDetected = detectWeakTopics(message + ' ' + fullResponse);
    if (weakTopicsDetected.length > 0) {
      const newWeakTopics = weakTopicsDetected.filter(t => !user.weakTopics.includes(t));
      if (newWeakTopics.length > 0) {
        user.weakTopics = [...new Set([...user.weakTopics, ...newWeakTopics])].slice(0, 10);
        await user.save();
      }
    }

    // Save or update chat session
    if (sessionId) {
      await AIChat.findOneAndUpdate(
        { _id: sessionId, user: req.user.id },
        {
          $push: {
            messages: [
              { role: 'user', content: message },
              { role: 'assistant', content: fullResponse }
            ]
          }
        }
      );
    }

    // Update daily activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await DailyActivity.findOneAndUpdate(
      { user: req.user.id, date: today },
      { $inc: { aiQueriesUsed: 1 } },
      { upsert: true }
    );
console.log("Sending to frontend:");
console.log({
  success: true,
  response: fullResponse,
  sessionId
});
    return res.json({ success: true, response: fullResponse, sessionId });
  }  catch (error) {
    console.log("========== OPENROUTER ERROR ==========");

    console.log(error);

    if (error.status) {
        console.log("Status:", error.status);
    }

    if (error.message) {
        console.log("Message:", error.message);
    }

    if (error.response) {
        console.log(error.response.data);
    }

    console.log("======================================");

    return res.status(500).json({
        success: false,
        error: error.message
    });
}
};

// @desc    Start new AI chat session
// @route   POST /api/ai/session
exports.createSession = async (req, res, next) => {
  try {
    const { mode = 'teacher', problemId, topic } = req.body;

    const session = await AIChat.create({
      user: req.user.id,
      mode,
      problem: problemId,
      topic,
      messages: []
    });

    return res.json({ success: true, sessionId: session._id });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI mock test
// @route   POST /api/ai/generate-test
exports.generateTest = async (req, res, next) => {
  try {
    const { topic, difficulty, count = 10, category = 'dsa' } = req.body;

    const user = await User.findById(req.user.id);
    if (user.subscription.plan === 'free') {
      return res.status(403).json({
        success: false,
        message: 'AI test generation is a Pro feature. Please upgrade.',
        upgradeRequired: true
      });
    }

    const prompt = `Generate ${count} ${difficulty} ${category} MCQ questions on the topic: ${topic}.

Return ONLY a valid JSON array with this exact structure:
[{
  "question": "question text",
  "options": [{"label":"A","text":"..."},{"label":"B","text":"..."},{"label":"C","text":"..."},{"label":"D","text":"..."}],
  "correctAnswer": "A",
  "explanation": "why this is correct",
  "difficulty": "${difficulty}",
  "topic": "${topic}"
}]

Make questions progressively harder. Include edge cases. Ensure explanations teach the concept.`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1024
    });

    const text = completion.choices[0].message.content;

    let questions;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      questions = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Failed to parse AI response. Please retry.' });
    }

    return res.json({ success: true, questions, metadata: { topic, difficulty, count, category } });
  } catch (error) {
    logger.error('AI generateTest error:', error);
    return res.status(500).json({ success: false, message: 'AI service unavailable' });
  }
};

// @desc    AI-powered answer evaluation
// @route   POST /api/ai/evaluate
exports.evaluateAnswer = async (req, res, next) => {
  try {
    const { question, userAnswer, context = 'interview' } = req.body;

    const prompt = `You are evaluating a student's answer in a ${context} context.

Question: ${question}
Student's Answer: ${userAnswer}

Evaluate and respond with JSON:
{
  "scores": {
    "technicalAccuracy": 8,
    "communication": 7,
    "completeness": 6,
    "overall": 7
  },
  "grade": "B+",
  "strengths": ["point 1", "point 2"],
  "improvements": ["point 1", "point 2"],
  "idealAnswer": "brief ideal answer summary",
  "followUpQuestion": "a follow-up question to test deeper"
}`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1024
    });

    const text = completion.choices[0].message.content;

    let evaluation;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      evaluation = { scores: { overall: 5 }, feedback: text };
    }

    return res.json({ success: true, evaluation });
  } catch (error) {
    logger.error('AI evaluateAnswer error:', error);
    return res.status(500).json({ success: false, message: 'AI service unavailable' });
  }
};

// @desc    Generate personalized roadmap
// @route   POST /api/ai/roadmap
exports.generateRoadmap = async (req, res, next) => {
  try {
    const { duration = 30, target = 'faang' } = req.body;
    const user = await User.findById(req.user.id);

    const prompt = `Create a ${duration}-day personalized coding roadmap for a student targeting ${target} companies.

Student Profile:
- Current Level: ${user.level}
- DSA Score: ${user.scores.dsa}/1000
- Weak Topics: ${user.weakTopics.join(', ') || 'None'}
- Problems Solved: ${user.problemStats.solved}

Return JSON:
{
  "title": "roadmap title",
  "target": "${target}",
  "duration": ${duration},
  "overview": "brief overview",
  "weeks": [{
    "week": 1,
    "theme": "Week theme",
    "days": [{
      "day": 1,
      "topics": ["topic1", "topic2"],
      "tasks": ["Task description 1", "Task 2"],
      "practiceProblems": 5,
      "estimatedHours": 3,
      "milestone": "What student will achieve"
    }]
  }]
}`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1024
    });

    const text = completion.choices[0].message.content;

    let roadmap;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      roadmap = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Could not generate roadmap. Please retry.' });
    }

    return res.json({ success: true, roadmap });
  } catch (error) {
    logger.error('AI generateRoadmap error:', error);
    return res.status(500).json({ success: false, message: 'AI service unavailable' });
  }
};

// @desc    Get AI usage stats
// @route   GET /api/ai/usage
exports.getUsage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    await user.checkAndResetAIUsage();

    const limit = AI_LIMITS[user.subscription.plan] || AI_LIMITS.free;

    return res.json({
      success: true,
      usage: {
        daily: user.aiUsage.daily,
        total: user.aiUsage.total,
        limit,
        remaining: limit === -1 ? 'unlimited' : Math.max(0, limit - user.aiUsage.daily),
        plan: user.subscription.plan
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper: detect weak topics from conversation
function detectWeakTopics(text) {
  const topicKeywords = {
    'dynamic-programming': ['dp', 'dynamic programming', 'memoization', 'tabulation'],
    'graphs': ['graph', 'bfs', 'dfs', 'dijkstra', 'shortest path'],
    'trees': ['tree', 'binary tree', 'bst', 'avl', 'traversal'],
    'backtracking': ['backtrack', 'n-queens', 'sudoku'],
    'heaps': ['heap', 'priority queue', 'heapify'],
    'time-distance': ['speed', 'distance', 'train', 'boat'],
    'profit-loss': ['profit', 'loss', 'discount', 'cost price']
  };

  const lowerText = text.toLowerCase();
  const confused = ["confused", "don't understand", "help me", "struggling", "not sure", "wrong"];
  const isStruggling = confused.some(w => lowerText.includes(w));

  if (!isStruggling) return [];

  return Object.entries(topicKeywords)
    .filter(([, keywords]) => keywords.some(k => lowerText.includes(k)))
    .map(([topic]) => topic);
}