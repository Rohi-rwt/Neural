import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Zap, Trophy, Bot, Mic, MicOff, Volume2, VolumeX, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { testAPI, aiAPI } from '@/services/api';
import { DifficultyTag, LoadingSpinner, Tabs } from '@/components/common/UI';
import toast from 'react-hot-toast';

const TEST_TABS = [
  { id: 'available', label: 'Available Tests' },
  { id: 'voice-test', label: '🎤 Voice Mock Test' },
  { id: 'ai-generate', label: '🤖 AI Generate' },
  { id: 'history', label: 'My History' }
];

const PRESET_TESTS = [
  { title: 'DSA Sprint', desc: '20 questions · 45 min', difficulty: 'medium', icon: '🌳', xp: 500, category: 'dsa' },
  { title: 'Aptitude Challenge', desc: '30 questions · 60 min', difficulty: 'mixed', icon: '🧮', xp: 400, category: 'aptitude' },
  { title: 'CS Fundamentals', desc: '25 questions · 50 min', difficulty: 'easy', icon: '💻', xp: 350, category: 'cs-fundamentals' },
  { title: 'Full Mock Interview', desc: '45 questions · 90 min', difficulty: 'hard', icon: '💼', xp: 800, category: 'mixed' },
  { title: 'Quick Practice', desc: '10 questions · 15 min', difficulty: 'easy', icon: '⚡', xp: 200, category: 'dsa' },
  { title: 'Company: Google', desc: '40 questions · 80 min', difficulty: 'hard', icon: '🔍', xp: 1000, category: 'company-specific' }
];

const SAMPLE_HISTORY = [
  { title: 'DSA Sprint', date: new Date(), score: 85, grade: 'A', correct: 17, total: 20, xp: 425 },
  { title: 'Aptitude Challenge', date: new Date(Date.now() - 86400000 * 2), score: 72, grade: 'B', correct: 22, total: 30, xp: 288 },
  { title: 'CS Fundamentals', date: new Date(Date.now() - 86400000 * 4), score: 61, grade: 'C', correct: 15, total: 25, xp: 213 }
];

/* ─── Voice Mock Test Questions ─── */
const VOICE_QUESTIONS = [
  { q: 'What does the acronym CPU stand for?', a: 'central processing unit', options: ['Central Processing Unit', 'Computer Power Unit', 'Core Program Utility', 'Central Program Upload'] },
  { q: 'What is the time complexity of binary search?', a: 'o log n', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'] },
  { q: 'Which data structure uses LIFO order?', a: 'stack', options: ['Queue', 'Stack', 'Heap', 'Tree'] },
  { q: 'What does HTML stand for?', a: 'hypertext markup language', options: ['HyperText Markup Language', 'High-Tech Modern Language', 'HyperText Modern Links', 'Home Tool Markup Language'] },
  { q: 'Which sorting algorithm has the best average time complexity?', a: 'merge sort', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'] },
  { q: 'What is a primary key in a database?', a: 'unique identifier', options: ['A password field', 'A unique identifier for each record', 'The first column', 'An index file'] },
  { q: 'What does RAM stand for?', a: 'random access memory', options: ['Random Access Memory', 'Read And Modify', 'Runtime Application Memory', 'Rapid Access Module'] },
  { q: 'In object-oriented programming, what is encapsulation?', a: 'hiding internal details', options: ['Combining data and methods', 'Hiding internal implementation details', 'Inheriting from a parent class', 'Creating multiple instances'] }
];

/* ─── Voice Test Component ─── */
function VoiceTestMode() {
  const [phase, setPhase] = useState('intro'); // intro | test | result
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [heard, setHeard] = useState('');
  const [answerResult, setAnswerResult] = useState(null); // 'correct' | 'wrong' | null
  const [timer, setTimer] = useState(15);
  const [totalTime, setTotalTime] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const timerRef = useRef(null);
  const totalTimerRef = useRef(null);

  const currentQ = VOICE_QUESTIONS[qIdx];

  const speak = useCallback((text, onEnd) => {
    if (!voiceOn) { onEnd?.(); return; }
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
      || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utt.voice = preferred;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => { setIsSpeaking(false); onEnd?.(); };
    utt.onerror = () => { setIsSpeaking(false); onEnd?.(); };
    synthRef.current.speak(utt);
  }, [voiceOn]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      const result = e.results[0][0].transcript.toLowerCase();
      setHeard(result);
      handleVoiceAnswer(result);
    };
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, []);

  const handleAnswer = useCallback((option, voiceInput) => {
    clearInterval(timerRef.current);
    recognitionRef.current?.stop();
    setIsListening(false);
    const q = VOICE_QUESTIONS[qIdx];
    const correct = option === q.options.find(o => o.toLowerCase().includes(q.a.toLowerCase().split(' ')[0]))
      || (voiceInput && q.a.split(' ').some(w => voiceInput.includes(w)));
    setSelectedOption(option);
    setAnswerResult(correct ? 'correct' : 'wrong');
    setAnswers(prev => [...prev, { q: q.q, selected: option || voiceInput, correct, expected: q.options.find(o => o.toLowerCase().includes(q.a.split(' ')[0])) }]);
    if (correct) setScore(s => s + 1);
    if (correct) speak('Correct!');
    else speak('Not quite. Moving on.');
    setTimeout(() => nextQ(), 2000);
  }, [qIdx, speak]);

  const handleVoiceAnswer = useCallback((voiceInput) => {
    const q = VOICE_QUESTIONS[qIdx];
    const matched = q.options.find(o => q.a.split(' ').some(w => voiceInput.includes(w)));
    handleAnswer(matched || null, voiceInput);
  }, [qIdx, handleAnswer]);

  const nextQ = useCallback(() => {
    setAnswerResult(null);
    setSelectedOption(null);
    setHeard('');
    if (qIdx + 1 >= VOICE_QUESTIONS.length) {
      clearInterval(totalTimerRef.current);
      setPhase('result');
      return;
    }
    const next = qIdx + 1;
    setQIdx(next);
    setTimer(15);
  }, [qIdx]);

  // Question timer
  useEffect(() => {
    if (phase !== 'test' || answerResult) return;
    setTimer(15);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null, '');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIdx, phase, answerResult]);

  // Total time
  useEffect(() => {
    if (phase === 'test') {
      totalTimerRef.current = setInterval(() => setTotalTime(t => t + 1), 1000);
    }
    return () => clearInterval(totalTimerRef.current);
  }, [phase]);

  // Speak question when it changes
  useEffect(() => {
    if (phase !== 'test') return;
    speak(`Question ${qIdx + 1}. ${currentQ.q}`, () => {
      setTimeout(startListening, 500);
    });
  }, [qIdx, phase]);

  const startTest = () => {
    setPhase('test');
    setQIdx(0);
    setScore(0);
    setAnswers([]);
    setTotalTime(0);
    speak(`Voice Mock Test starting. Answer each question by speaking or clicking. You have 15 seconds per question. Question 1. ${VOICE_QUESTIONS[0].q}`, () => {
      setTimeout(startListening, 500);
    });
  };

  const pct = Math.round((score / VOICE_QUESTIONS.length) * 100);

  if (phase === 'intro') return (
    <div className="card max-w-2xl mx-auto mt-4 text-center py-10">
      <div className="text-5xl mb-4">🎤</div>
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Voice Mock Test</h2>
      <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Answer {VOICE_QUESTIONS.length} questions by speaking or clicking. 15 seconds per question.
      </p>
      <div className="flex items-center justify-center gap-3 mb-6">
        <button onClick={() => setVoiceOn(v => !v)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          style={{ background: voiceOn ? 'rgba(108,99,255,0.15)' : 'var(--bg3)', color: voiceOn ? '#6c63ff' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
          {voiceOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {voiceOn ? 'Voice On' : 'Voice Off'}
        </button>
      </div>
      <button onClick={startTest} className="btn-primary px-8 py-3 text-base mx-auto">🚀 Start Voice Test</button>
    </div>
  );

  if (phase === 'test') return (
    <div className="max-w-2xl mx-auto mt-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Q {qIdx + 1}/{VOICE_QUESTIONS.length}</div>
        <div className="flex-1 mx-4">
          <div className="progress-bar">
            <div className="h-full bg-gradient-to-r from-accent to-cyan-500 rounded-full transition-all"
              style={{ width: `${((qIdx) / VOICE_QUESTIONS.length) * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: timer <= 5 ? '#ef4444' : 'var(--text-secondary)' }}>
          <Clock size={14} /> {timer}s
        </div>
      </div>

      <div className="card">
        {/* Question */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all ${isSpeaking ? 'bg-accent scale-110' : isListening ? 'bg-emerald-500 scale-110' : 'bg-gradient-to-br from-accent to-cyan-500'}`}>
              {isSpeaking ? '🔊' : isListening ? '🎤' : '🤖'}
            </div>
            <button onClick={() => setVoiceOn(v => !v)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)', background: 'var(--bg3)' }}>
              {voiceOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
          <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{currentQ?.q}</p>
          {heard && <div className="text-xs mt-2 italic" style={{ color: 'var(--text-muted)' }}>Heard: "{heard}"</div>}
        </div>

        {/* Timer bar */}
        <div className="progress-bar mb-5">
          <div className="h-full rounded-full transition-all"
            style={{
              width: `${(timer / 15) * 100}%`,
              background: timer <= 5 ? '#ef4444' : timer <= 10 ? '#f59e0b' : '#10b981'
            }} />
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {currentQ?.options.map((opt, i) => {
            let bg = 'var(--bg3)';
            let border = 'var(--border)';
            let color = 'var(--text-primary)';
            if (answerResult) {
              const isCorrectOpt = currentQ.options.indexOf(opt) === currentQ.options.findIndex(o => o.toLowerCase().includes(currentQ.a.split(' ')[0]));
              if (isCorrectOpt) { bg = 'rgba(16,185,129,0.15)'; border = '#10b981'; color = '#10b981'; }
              else if (opt === selectedOption && !isCorrectOpt) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#ef4444'; }
            } else if (opt === selectedOption) {
              bg = 'rgba(108,99,255,0.15)'; border = '#6c63ff';
            }
            return (
              <button
                key={i}
                onClick={() => !answerResult && handleAnswer(opt)}
                disabled={!!answerResult}
                className="p-3 rounded-xl text-sm font-medium text-left transition-all disabled:cursor-default"
                style={{ background: bg, border: `1px solid ${border}`, color }}
              >
                <span className="text-xs opacity-60 mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {answerResult && (
          <div className={`mt-4 flex items-center gap-2 text-sm font-semibold justify-center ${answerResult === 'correct' ? 'text-emerald-500' : 'text-red-400'}`}>
            {answerResult === 'correct' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {answerResult === 'correct' ? 'Correct! 🎉' : 'Not quite — moving on...'}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {isListening ? '🎤 Listening — say your answer' : isSpeaking ? '🔊 AI speaking...' : 'Click an option or speak'}
        </div>
        <button onClick={() => handleAnswer(null, '')} className="text-xs underline" style={{ color: 'var(--text-muted)' }}>
          Skip →
        </button>
      </div>
    </div>
  );

  if (phase === 'result') return (
    <div className="card max-w-2xl mx-auto mt-4 text-center">
      <div className="text-4xl mb-3">{pct >= 80 ? '🏆' : pct >= 60 ? '🎯' : '📚'}</div>
      <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Voice Test Complete!</h2>
      <div className="text-4xl font-bold my-4" style={{ color: pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444' }}>
        {score}/{VOICE_QUESTIONS.length}
        <span className="text-base font-normal ml-2" style={{ color: 'var(--text-muted)' }}>({pct}%)</span>
      </div>

      <div className="space-y-2 mb-6 text-left">
        {answers.map((a, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg text-sm" style={{ background: 'var(--bg3)' }}>
            {a.correct
              ? <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              : <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />}
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{a.q}</div>
              {!a.correct && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Correct: {a.expected}</div>}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => { setPhase('intro'); setQIdx(0); setScore(0); setAnswers([]); }} className="btn-primary mx-auto">
        🔁 Try Again
      </button>
    </div>
  );
}

export default function MockTests() {
  const [tab, setTab] = useState('available');
  const [genForm, setGenForm] = useState({ topic: 'Arrays & Strings', difficulty: 'mixed', count: 10, category: 'dsa' });
  const [generating, setGenerating] = useState(false);

  const { data: tests, isLoading } = useQuery({
    queryKey: ['tests'],
    queryFn: () => testAPI.getAll().then(r => r.data)
  });

  const { data: history } = useQuery({
    queryKey: ['test-history'],
    queryFn: () => testAPI.history().then(r => r.data),
    enabled: tab === 'history'
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await aiAPI.generateTest(genForm);
      toast.success(`Generated ${res.data.questions.length} questions!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Generation failed';
      if (msg.includes('Pro')) toast.error('AI test generation requires Pro plan 🔒');
      else toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>📝 Mock Tests</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>AI-powered adaptive testing engine</p>
        </div>
        <Link to="/ai-interviewer" className="btn-primary text-xs py-1.5 px-3 hidden sm:flex">
          🤖 AI Interviewer
        </Link>
      </div>

      <Tabs tabs={TEST_TABS} active={tab} onChange={setTab} />

      {tab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(tests?.tests?.length ? tests.tests : PRESET_TESTS).map((t, i) => (
            <div key={i} className="card-sm hover:border-accent/30 transition-all cursor-pointer group hover:-translate-y-1">
              <div className="text-3xl mb-3">{t.icon || '📝'}</div>
              <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t.title}</div>
              <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{t.desc || `${t.questions?.length || 20} questions · ${t.duration || 45} min`}</div>
              <div className="flex items-center justify-between mb-4">
                <DifficultyTag difficulty={t.difficulty} />
                <span className="text-xs text-amber-500">🏆 +{t.xpReward || t.xp || 500} XP</span>
              </div>
              <Link
                to={t._id ? `/tests/${t._id}/take` : `/tests?preset=${encodeURIComponent(t.title)}`}
                className="btn-primary w-full justify-center text-xs group-hover:bg-accent-2"
              >
                Start Test →
              </Link>
            </div>
          ))}
        </div>
      )}

      {tab === 'voice-test' && <VoiceTestMode />}

      {tab === 'ai-generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card">
            <div className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Bot size={16} className="text-accent" /> AI Test Generator
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Topic</label>
                <select className="input" value={genForm.topic} onChange={e => setGenForm(f => ({ ...f, topic: e.target.value }))}>
                  {['Arrays & Strings', 'Trees & Graphs', 'Dynamic Programming', 'Aptitude - Quantitative', 'OS Fundamentals', 'SQL & DBMS', 'System Design'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Questions</label>
                  <select className="input" value={genForm.count} onChange={e => setGenForm(f => ({ ...f, count: +e.target.value }))}>
                    {[5, 10, 15, 20, 25, 30].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Difficulty</label>
                  <select className="input" value={genForm.difficulty} onChange={e => setGenForm(f => ({ ...f, difficulty: e.target.value }))}>
                    {['mixed', 'easy', 'medium', 'hard'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleGenerate} disabled={generating} className="btn-primary w-full justify-center">
                {generating ? <LoadingSpinner size={14} /> : '🤖 Generate & Start Test'}
              </button>
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>AI test generation requires Pro plan</p>
            </div>
          </div>
          <div className="card">
            <div className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>⚡ What AI generates</div>
            {[
              { icon: '🎯', t: 'Adaptive Questions', d: 'Tailored to your weak areas' },
              { icon: '📊', t: 'Mixed Difficulty', d: 'Progressive challenge curve' },
              { icon: '💡', t: 'Detailed Explanations', d: 'Learn from every answer' },
              { icon: '🧠', t: 'Pattern Recognition', d: 'Common interview patterns' }
            ].map(f => (
              <div key={f.t} className="flex gap-3 p-3 rounded-xl mb-2" style={{ background: 'var(--bg3)' }}>
                <span className="text-xl">{f.icon}</span>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{f.t}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                {['Test', 'Date', 'Score', 'Grade', 'Correct', 'XP'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(history?.attempts?.length ? history.attempts : SAMPLE_HISTORY).map((a, i) => (
                <tr key={i} className="border-t transition-colors" style={{ borderColor: 'var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.test?.title || a.title}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(a.createdAt || a.date).toLocaleDateString()}</td>
                  <td className={`px-4 py-3 font-bold ${(a.score?.percentage || a.score) >= 80 ? 'text-emerald-500' : (a.score?.percentage || a.score) >= 60 ? 'text-amber-500' : 'text-red-400'}`}>
                    {a.score?.percentage || a.score}%
                  </td>
                  <td className="px-4 py-3"><span className="tag-accent">{a.score?.grade || a.grade}</span></td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{a.analysis?.correct || a.correct}/{a.analysis?.correct + a.analysis?.wrong || a.total} correct</td>
                  <td className="px-4 py-3 text-xs text-amber-500">+{a.xpEarned || a.xp} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
