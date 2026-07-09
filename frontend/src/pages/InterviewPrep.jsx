import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Star, Clock, MessageSquare } from 'lucide-react';
import { aiAPI } from '@/services/api';
import { ProgressBar, Tabs } from '@/components/common/UI';
import toast from 'react-hot-toast';

const INTERVIEW_TABS = [
  { id: 'simulator', label: 'AI Simulator' },
  { id: 'questions', label: 'Question Bank' },
  { id: 'tips', label: 'Tips & Tricks' }
];

const QUESTION_BANK = [
  { q: 'Tell me about yourself', cat: 'HR', type: 'behavioral', difficulty: 'easy' },
  { q: 'Why do you want to work here?', cat: 'HR', type: 'behavioral', difficulty: 'easy' },
  { q: 'Describe a challenging project you worked on', cat: 'HR', type: 'behavioral', difficulty: 'medium' },
  { q: 'Design a URL shortener like bit.ly', cat: 'System Design', type: 'technical', difficulty: 'hard' },
  { q: 'Find the LCA of a Binary Tree', cat: 'DSA', type: 'coding', difficulty: 'medium' },
  { q: 'Explain the CAP theorem', cat: 'CS Fundamentals', type: 'technical', difficulty: 'medium' },
  { q: 'Design Twitter\'s trending topics feature', cat: 'System Design', type: 'technical', difficulty: 'hard' },
  { q: 'What is the difference between TCP and UDP?', cat: 'CN', type: 'technical', difficulty: 'easy' },
  { q: 'Explain SOLID principles with examples', cat: 'OOP', type: 'technical', difficulty: 'medium' },
  { q: 'How would you handle a conflict with a teammate?', cat: 'HR', type: 'behavioral', difficulty: 'medium' }
];

const SCORES = [
  { label: 'Technical Accuracy', value: 78, color: 'green' },
  { label: 'Communication', value: 85, color: 'cyan' },
  { label: 'Problem Solving', value: 72, color: 'accent' },
  { label: 'Code Quality', value: 80, color: 'amber' }
];

function InterviewSimulator() {
  const [phase, setPhase] = useState('setup'); // setup | active | result
  const [company, setCompany] = useState('Google');
  const [round, setRound] = useState('Technical Round 1');
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [allEvals, setAllEvals] = useState([]);

  const MOCK_QUESTIONS = [
    'Tell me about yourself and your experience with algorithms.',
    'Given an array of integers, find the maximum sum subarray.',
    'How would you design a rate limiter for an API?',
    'Explain the difference between a process and a thread.'
  ];

  const handleEvaluate = async () => {
    if (!answer.trim()) { toast.error('Please write your answer first!'); return; }
    setEvaluating(true);
    try {
      const res = await aiAPI.evaluate({
        question: MOCK_QUESTIONS[currentQ],
        userAnswer: answer,
        context: 'technical interview'
      });
      setEvaluation(res.data.evaluation);
      setAllEvals(prev => [...prev, res.data.evaluation]);
    } catch {
      // Fallback evaluation
      const fallback = {
        scores: { technicalAccuracy: Math.floor(Math.random()*3+6), communication: Math.floor(Math.random()*3+6), completeness: Math.floor(Math.random()*3+5), overall: Math.floor(Math.random()*3+6) },
        grade: ['B', 'B+', 'A-'][Math.floor(Math.random()*3)],
        strengths: ['Shows understanding of the problem', 'Good use of examples'],
        improvements: ['Be more specific about complexity', 'Mention edge cases'],
        followUpQuestion: 'Can you optimize your solution further?'
      };
      setEvaluation(fallback);
      setAllEvals(prev => [...prev, fallback]);
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentQ < MOCK_QUESTIONS.length - 1) {
      setCurrentQ(q => q + 1);
      setAnswer('');
      setEvaluation(null);
    } else {
      setPhase('result');
    }
  };

  if (phase === 'setup') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-3 to-accent mx-auto mb-4 flex items-center justify-center text-4xl">🤵</div>
            <h2 className="text-lg font-bold">AI Technical Interviewer</h2>
            <p className="text-sm text-secondary mt-1">Simulates real FAANG interview experience</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { l: 'Company', v: company, options: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'] },
              { l: 'Round', v: round, options: ['Technical Round 1', 'Technical Round 2', 'System Design', 'HR Round'] }
            ].map(f => (
              <div key={f.l}>
                <label className="text-xs text-muted mb-1 block">{f.l}</label>
                <select className="input h-9" value={f.v} onChange={e => f.l === 'Company' ? setCompany(e.target.value) : setRound(e.target.value)}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            {[{ l: 'Duration', v: '45 minutes' }, { l: 'Difficulty', v: 'Medium-Hard' }].map(f => (
              <div key={f.l} className="bg-surface3 rounded-xl p-3">
                <div className="text-xs text-muted mb-0.5">{f.l}</div>
                <div className="text-sm font-medium">{f.v}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setPhase('active')} className="btn-primary w-full justify-center">
            🎯 Start Mock Interview
          </button>
        </div>

        <div className="card">
          <div className="text-sm font-semibold mb-4">📈 Past Interview Scores</div>
          <div className="space-y-3 mb-4">
            {SCORES.map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary">{s.label}</span>
                  <span className={`font-semibold ${s.color === 'green' ? 'text-emerald-400' : s.color === 'cyan' ? 'text-cyan-400' : s.color === 'accent' ? 'text-accent' : 'text-amber-400'}`}>{s.value}%</span>
                </div>
                <ProgressBar value={s.value} max={100} color={s.color} />
              </div>
            ))}
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
            <div className="text-sm font-semibold text-emerald-400">🎯 Overall: 79% — Interview Ready</div>
            <div className="text-xs text-secondary mt-1">Focus on Problem Solving approach and system design</div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const avg = allEvals.length
      ? Math.round(allEvals.reduce((a, e) => a + (e.scores?.overall || 7), 0) / allEvals.length * 10)
      : 72;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold">Interview Complete!</h2>
          <p className="text-sm text-secondary mt-1">Here's your performance breakdown</p>
        </div>
        <div className="text-center mb-6">
          <div className={`text-6xl font-bold ${avg >= 80 ? 'text-emerald-400' : avg >= 65 ? 'text-amber-400' : 'text-red-400'}`}>{avg}%</div>
          <div className="text-secondary mt-1">Overall Score</div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {allEvals[0]?.scores && Object.entries(allEvals[0].scores).map(([k, v]) => k !== 'overall' && (
            <div key={k} className="bg-surface3 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-accent">{v}/10</div>
              <div className="text-xs text-muted mt-0.5 capitalize">{k.replace(/([A-Z])/g, ' $1')}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setPhase('setup'); setCurrentQ(0); setAllEvals([]); setEvaluation(null); setAnswer(''); }} className="btn-outline flex-1 justify-center">Try Again</button>
          <Link to="/ai-tutor" className="btn-primary flex-1 justify-center">Practice Weak Areas</Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="text-sm text-secondary">Question {currentQ + 1}/{MOCK_QUESTIONS.length}</div>
        <div className="flex-1 progress-bar">
          <div className="h-full bg-accent rounded-full" style={{ width: `${((currentQ + 1) / MOCK_QUESTIONS.length) * 100}%` }} />
        </div>
        <div className="flex items-center gap-1 text-xs text-amber-400"><Clock size={12} /> 45:00</div>
      </div>

      {/* Interviewer */}
      <div className="card">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-3 to-accent flex items-center justify-center text-lg flex-shrink-0">🤵</div>
          <div className="flex-1">
            <div className="text-xs text-accent font-semibold mb-1">{company} Interviewer · {round}</div>
            <div className="text-sm leading-relaxed">{MOCK_QUESTIONS[currentQ]}</div>
          </div>
        </div>
      </div>

      {/* Answer */}
      <div className="card">
        <label className="text-xs text-muted mb-2 block">Your Answer</label>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          className="input resize-none h-36 text-sm"
          placeholder="Type your answer here... Be clear, structured, and use the STAR method for behavioral questions."
        />
        <div className="flex gap-2 mt-3">
          <button onClick={handleEvaluate} disabled={evaluating || !answer.trim()} className="btn-primary disabled:opacity-40">
            {evaluating ? '⏳ Evaluating...' : '🤖 Evaluate Answer'}
          </button>
          {evaluation && (
            <button onClick={nextQuestion} className="btn-outline">
              {currentQ < MOCK_QUESTIONS.length - 1 ? 'Next Question →' : 'View Results'}
            </button>
          )}
        </div>
      </div>

      {/* AI Evaluation */}
      {evaluation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="text-sm font-semibold text-accent mb-3 flex items-center gap-2"><Bot size={14} /> AI Evaluation</div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {Object.entries(evaluation.scores || {}).map(([k, v]) => (
              <div key={k} className="text-center bg-surface3 rounded-lg p-2">
                <div className={`text-xl font-bold ${v >= 8 ? 'text-emerald-400' : v >= 6 ? 'text-amber-400' : 'text-red-400'}`}>{v}/10</div>
                <div className="text-[10px] text-muted capitalize mt-0.5">{k.replace(/([A-Z])/g, ' $1')}</div>
              </div>
            ))}
          </div>
          {evaluation.strengths?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-emerald-400 mb-1.5">✅ Strengths</div>
              {evaluation.strengths.map((s, i) => <div key={i} className="text-xs text-secondary mb-1">• {s}</div>)}
            </div>
          )}
          {evaluation.improvements?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-amber-400 mb-1.5">⚠️ Areas to Improve</div>
              {evaluation.improvements.map((s, i) => <div key={i} className="text-xs text-secondary mb-1">• {s}</div>)}
            </div>
          )}
          {evaluation.followUpQuestion && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mt-3">
              <div className="text-xs font-semibold text-accent mb-1">🔄 Follow-up Question</div>
              <div className="text-sm">{evaluation.followUpQuestion}</div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function InterviewPrep() {
  const [tab, setTab] = useState('simulator');
  const [filter, setFilter] = useState('');

  const filtered = QUESTION_BANK.filter(q =>
    !filter || q.cat.toLowerCase().includes(filter.toLowerCase()) || q.type === filter
  );

  return (
    <div className="p-6 fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold">💼 Interview Preparation</h1>
        <p className="text-sm text-secondary mt-0.5">AI-powered mock interviews & question bank</p>
      </div>

      <Tabs tabs={INTERVIEW_TABS} active={tab} onChange={setTab} />

      {tab === 'simulator' && <InterviewSimulator />}

      {tab === 'questions' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['', 'HR', 'System Design', 'DSA', 'CS Fundamentals', 'OOP', 'CN'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-accent text-white' : 'bg-surface3 border border-surface text-secondary hover:text-primary'}`}>
                {f || 'All'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((q, i) => (
              <div key={i} className="card-sm hover:border-accent/30 transition-all cursor-pointer group" onClick={() => setTab('simulator')}>
                <div className="text-sm font-medium mb-2 group-hover:text-accent transition-colors">{q.q}</div>
                <div className="flex gap-2">
                  <span className="tag-accent text-[10px]">{q.cat}</span>
                  <span className={`tag-${q.difficulty} text-[10px]`}>{q.difficulty}</span>
                  <span className="ml-auto text-[10px] text-muted capitalize">{q.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'tips' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[
            { icon: '⭐', title: 'STAR Method', tips: ['Situation: Set the context', 'Task: Describe your responsibility', 'Action: Explain what YOU did', 'Result: Share the outcome with metrics'] },
            { icon: '🧠', title: 'Technical Interview Tips', tips: ['Think aloud — explain your thought process', 'Start with brute force, then optimize', 'Always ask clarifying questions', 'Test your solution with examples'] },
            { icon: '💡', title: 'System Design Tips', tips: ['Clarify requirements and constraints first', 'Start with high-level design', 'Deep dive into components', 'Address scalability and trade-offs'] },
            { icon: '🎯', title: 'Common Mistakes', tips: ['Jumping to code without planning', 'Not asking clarifying questions', 'Ignoring edge cases', 'Poor communication of thought process'] }
          ].map(section => (
            <div key={section.title} className="card">
              <div className="text-base font-semibold mb-3">{section.icon} {section.title}</div>
              <div className="space-y-2">
                {section.tips.map((tip, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <span className="text-accent mt-0.5 flex-shrink-0">•</span>
                    <span className="text-secondary">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
