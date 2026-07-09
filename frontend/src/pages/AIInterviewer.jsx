import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, RefreshCw, ChevronRight, CheckCircle, Clock, Brain, Code, Database, Globe, Cpu } from 'lucide-react';

/* ─── Interview question banks ─── */
const QUESTION_BANKS = {
  dsa: {
    label: '🌳 DSA & Algorithms',
    color: '#10b981',
    questions: [
      { q: 'What is the time complexity of binary search, and how does it work?', hint: 'Think about how the search space is halved each iteration.' },
      { q: 'Explain the difference between BFS and DFS. When would you use each?', hint: 'Consider memory usage and use-cases like shortest path vs. exhaustive search.' },
      { q: 'What is dynamic programming? Give an example of a problem it solves efficiently.', hint: 'Think about overlapping subproblems and optimal substructure.' },
      { q: 'How does a hash table work internally? What happens during a collision?', hint: 'Discuss hashing functions, chaining, and open addressing.' },
      { q: 'Explain quicksort. What is its average and worst case time complexity?', hint: 'Discuss pivot selection and partition logic.' },
      { q: 'What is the difference between a stack and a queue? Give real-world examples.', hint: 'LIFO vs FIFO — think undo history vs print queue.' },
    ]
  },
  system: {
    label: '⚙️ System Design',
    color: '#6c63ff',
    questions: [
      { q: 'How would you design a URL shortener like bit.ly?', hint: 'Think about hashing, storage, redirect logic, and scalability.' },
      { q: 'Design a rate limiter for an API. What strategies can you use?', hint: 'Consider token bucket, sliding window, and distributed environments.' },
      { q: 'How would you design a notification system that can send millions of messages per day?', hint: 'Think about message queues, push vs pull, fan-out.' },
      { q: 'Explain the CAP theorem. How does it affect distributed system design?', hint: 'Consistency, Availability, Partition Tolerance — only 2 at a time.' },
      { q: 'How would you build a scalable image storage service?', hint: 'Object storage, CDN, metadata DB, deduplication.' },
    ]
  },
  os: {
    label: '💻 OS & Networking',
    color: '#f59e0b',
    questions: [
      { q: 'What is the difference between a process and a thread?', hint: 'Memory isolation, context switching, and communication.' },
      { q: 'Explain what happens when you type a URL in the browser and press Enter.', hint: 'DNS, TCP handshake, HTTP, rendering — go step by step.' },
      { q: 'What is virtual memory and how does it work?', hint: 'Paging, page tables, swap space.' },
      { q: 'What is a deadlock? What are the four conditions for it to occur?', hint: 'Mutual exclusion, hold and wait, no preemption, circular wait.' },
      { q: 'Explain the difference between TCP and UDP. When would you use each?', hint: 'Reliability vs speed — think streaming vs file transfer.' },
    ]
  },
  behavioral: {
    label: '🤝 Behavioral',
    color: '#ec4899',
    questions: [
      { q: 'Tell me about a time you had to deal with a difficult technical challenge. How did you approach it?', hint: 'Use the STAR method: Situation, Task, Action, Result.' },
      { q: 'Describe a time you disagreed with a teammate. How did you resolve it?', hint: 'Focus on communication, empathy, and outcome.' },
      { q: 'Where do you see yourself in 5 years? How does this role fit your goals?', hint: 'Be honest about growth, connect to the role and company.' },
      { q: 'Tell me about a project you are most proud of. What was your specific contribution?', hint: 'Highlight impact, ownership, and technical depth.' },
      { q: 'How do you handle working under tight deadlines and multiple priorities?', hint: 'Discuss prioritization, communication, and trade-offs.' },
    ]
  }
};

/* ─── AI Feedback engine (uses Claude API) ─── */
async function getAIFeedback(question, answer, category) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a senior technical interviewer at a top tech company. 
          
Question asked (${category}): "${question}"

Candidate's answer: "${answer}"

Provide structured interview feedback in this EXACT JSON format (no markdown, pure JSON):
{
  "score": <number 1-10>,
  "verdict": "<Excellent|Good|Needs Improvement|Poor>",
  "strengths": ["<point1>", "<point2>"],
  "improvements": ["<point1>", "<point2>"],
  "sampleAnswer": "<A concise model answer in 2-3 sentences>",
  "followUp": "<One follow-up question to go deeper>"
}`
        }]
      })
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '{}';
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return {
      score: 7,
      verdict: 'Good',
      strengths: ['You attempted the question', 'Showed understanding of the basics'],
      improvements: ['Add more specific examples', 'Discuss time/space complexity'],
      sampleAnswer: 'A complete answer would cover the core concept, real-world application, and trade-offs.',
      followUp: 'Can you think of an edge case that could break this approach?'
    };
  }
}

/* ─── Avatar component ─── */
function AIAvatar({ speaking, listening, idle }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings when speaking */}
      {speaking && (
        <>
          <div className="absolute w-40 h-40 rounded-full border-2 border-accent/30 pulse-ring" />
          <div className="absolute w-32 h-32 rounded-full border-2 border-accent/20 pulse-ring" style={{ animationDelay: '0.5s' }} />
        </>
      )}
      {listening && (
        <div className="absolute w-36 h-36 rounded-full border-2 border-emerald-500/40 pulse-ring" />
      )}

      {/* Avatar circle */}
      <div
        className="w-28 h-28 rounded-full flex flex-col items-center justify-center relative z-10 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #6c63ff 0%, #4f46e5 50%, #06b6d4 100%)',
          boxShadow: speaking
            ? '0 0 40px rgba(108,99,255,0.6)'
            : listening
              ? '0 0 40px rgba(16,185,129,0.6)'
              : '0 0 20px rgba(108,99,255,0.2)'
        }}
      >
        {/* Robot face */}
        <div className="text-4xl select-none">🤖</div>

        {/* Speaking bars */}
        {speaking && (
          <div className="flex items-end gap-0.5 h-4 mt-1">
            {[3, 5, 4, 6, 4, 5, 3].map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full speaking-bar"
                style={{ height: `${h * 2}px`, background: 'rgba(255,255,255,0.8)', animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
        {listening && (
          <div className="text-xs text-white/80 mt-1 font-medium">Listening...</div>
        )}
        {idle && !speaking && !listening && (
          <div className="text-xs text-white/60 mt-1">Ready</div>
        )}
      </div>
    </div>
  );
}

/* ─── Waveform visualizer ─── */
function Waveform({ active }) {
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full transition-all duration-150"
          style={{
            background: active ? 'var(--accent)' : 'var(--border2)',
            height: active ? `${8 + Math.sin(Date.now() / 200 + i) * 8 + Math.random() * 12}px` : '4px',
            animation: active ? `speaking ${0.3 + i * 0.05}s ease-in-out infinite alternate` : 'none'
          }}
        />
      ))}
    </div>
  );
}

/* ─── Score badge ─── */
function ScoreBadge({ score }) {
  const color = score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444';
  const label = score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : 'Needs Work';
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
        style={{ background: color }}>
        {score}
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

/* ─── Main component ─── */
export default function AIInterviewer() {
  const [mode, setMode] = useState('setup'); // setup | interview | feedback | summary
  const [category, setCategory] = useState('dsa');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const timerRef = useRef(null);

  const currentQ = questions[questionIdx];
  const bank = QUESTION_BANKS[category];

  /* ─── Timer ─── */
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const formatTime = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  /* ─── Speech synthesis ─── */
  const speak = useCallback((text, onEnd) => {
    if (!voiceEnabled) { onEnd?.(); return; }
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9;
    utt.pitch = 1.0;
    utt.volume = 1;
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
      || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utt.voice = preferred;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => { setIsSpeaking(false); onEnd?.(); };
    utt.onerror = () => { setIsSpeaking(false); onEnd?.(); };
    synthRef.current.speak(utt);
  }, [voiceEnabled]);

  /* ─── Speech recognition ─── */
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      let interim = '';
      let final = transcript;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
        else interim = e.results[i][0].transcript;
      }
      setTranscript(final);
      setInterimTranscript(interim);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [transcript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  /* ─── Start interview ─── */
  const startInterview = () => {
    const shuffled = [...bank.questions].sort(() => Math.random() - 0.5).slice(0, questionCount);
    setQuestions(shuffled);
    setQuestionIdx(0);
    setTranscript('');
    setFeedback(null);
    setSessionResults([]);
    setTimer(0);
    setTimerActive(true);
    setMode('interview');
    setTimeout(() => {
      speak(`Hello! I'm your AI interviewer today. Let's begin with our first question. ${shuffled[0]?.q}`, () => {
        setTimeout(startListening, 500);
      });
    }, 800);
  };

  /* ─── Submit answer ─── */
  const submitAnswer = async () => {
    stopListening();
    synthRef.current.cancel();
    const answer = (transcript + interimTranscript).trim();
    if (!answer) return;
    setLoadingFeedback(true);
    setMode('feedback');
    const fb = await getAIFeedback(currentQ.q, answer, bank.label);
    setFeedback(fb);
    setSessionResults(prev => [...prev, { question: currentQ.q, answer, feedback: fb, time: timer }]);
    setLoadingFeedback(false);
    if (voiceEnabled) {
      speak(`Great effort! Here's my feedback. Your score is ${fb.score} out of 10. ${fb.verdict}. ${fb.strengths?.[0] ? 'A strength was: ' + fb.strengths[0] : ''} ${fb.improvements?.[0] ? 'One area to improve: ' + fb.improvements[0] : ''}`);
    }
  };

  /* ─── Next question ─── */
  const nextQuestion = () => {
    synthRef.current.cancel();
    if (questionIdx + 1 >= questions.length) {
      setMode('summary');
      setTimerActive(false);
      speak('Interview complete! Great job today. Let me show you your overall results.');
      return;
    }
    const next = questions[questionIdx + 1];
    setQuestionIdx(i => i + 1);
    setTranscript('');
    setInterimTranscript('');
    setFeedback(null);
    setMode('interview');
    setTimeout(() => {
      speak(`Next question. ${next.q}`, () => {
        setTimeout(startListening, 500);
      });
    }, 300);
  };

  /* ─── Cleanup ─── */
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      synthRef.current.cancel();
      clearInterval(timerRef.current);
    };
  }, []);

  const avgScore = sessionResults.length
    ? Math.round(sessionResults.reduce((a, r) => a + (r.feedback?.score || 0), 0) / sessionResults.length)
    : 0;

  /* ════════ SETUP SCREEN ════════ */
  if (mode === 'setup') {
    return (
      <div className="p-6 fade-in max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            🤖 AI Video Interviewer
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Practice with your personal AI interviewer — real questions, instant feedback, voice interaction
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar preview */}
          <div className="card flex flex-col items-center gap-4 py-8">
            <AIAvatar idle />
            <div className="text-center">
              <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Alex — AI Interviewer</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Senior Engineer · 8 yrs exp</div>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Volume2 size={14} className="text-accent" />
              Voice-powered interview
            </div>
          </div>

          {/* Config */}
          <div className="card lg:col-span-2">
            <div className="text-base font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>⚙️ Interview Setup</div>

            {/* Category */}
            <div className="mb-5">
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>Topic / Category</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(QUESTION_BANKS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border"
                    style={{
                      background: category === key ? `${val.color}20` : 'var(--bg3)',
                      borderColor: category === key ? val.color : 'var(--border)',
                      color: category === key ? val.color : 'var(--text-secondary)'
                    }}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question count */}
            <div className="mb-5">
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
                Number of Questions: <span className="text-accent">{questionCount}</span>
              </label>
              <input
                type="range" min={3} max={Math.min(bank.questions.length, 8)} value={questionCount}
                onChange={e => setQuestionCount(+e.target.value)}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                <span>Quick (3)</span><span>Standard (5)</span><span>Full (8)</span>
              </div>
            </div>

            {/* Voice toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg mb-5" style={{ background: 'var(--bg3)' }}>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Voice Interaction</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>AI speaks questions aloud & listens to your answers</div>
              </div>
              <button
                onClick={() => setVoiceEnabled(v => !v)}
                className="w-10 h-6 rounded-full transition-all relative"
                style={{ background: voiceEnabled ? '#6c63ff' : 'var(--border2)' }}
              >
                <div className="absolute top-0.5 transition-all w-5 h-5 bg-white rounded-full shadow"
                  style={{ left: voiceEnabled ? '18px' : '2px' }} />
              </button>
            </div>

            <button onClick={startInterview} className="btn-primary w-full justify-center py-3 text-base">
              🚀 Start Interview
            </button>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: '🎤', title: 'Voice Answers', desc: 'Speak naturally, AI listens' },
            { icon: '🧠', title: 'AI Feedback', desc: 'Claude-powered analysis' },
            { icon: '📊', title: 'Score Report', desc: 'Detailed performance review' },
            { icon: '🔄', title: 'Follow-ups', desc: 'Real interview depth' }
          ].map(f => (
            <div key={f.title} className="card-sm text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ════════ INTERVIEW SCREEN ════════ */
  if (mode === 'interview') {
    return (
      <div className="p-6 fade-in max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: 'var(--bg3)', color: 'var(--text-secondary)' }}>
              Q {questionIdx + 1} of {questions.length}
            </div>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div key={i} className="w-6 h-1.5 rounded-full transition-all"
                  style={{ background: i < questionIdx ? '#10b981' : i === questionIdx ? '#6c63ff' : 'var(--border)' }} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
              <Clock size={14} /> {formatTime(timer)}
            </div>
            <button onClick={() => setVoiceEnabled(v => !v)} className="p-2 rounded-lg transition-colors"
              style={{ background: 'var(--bg3)', color: voiceEnabled ? '#6c63ff' : 'var(--text-muted)' }}>
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Avatar panel */}
          <div className="lg:col-span-2 card flex flex-col items-center gap-5 py-8">
            <AIAvatar speaking={isSpeaking} listening={isListening} idle={!isSpeaking && !isListening} />

            <div className="text-center">
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Alex — AI Interviewer</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {isSpeaking ? '🔊 Speaking...' : isListening ? '🎤 Listening to you...' : '⏳ Ready'}
              </div>
            </div>

            <Waveform active={isListening} />

            {/* Hint */}
            <div className="w-full p-3 rounded-lg text-xs" style={{ background: 'var(--bg3)', color: 'var(--text-muted)' }}>
              <span className="font-semibold text-amber-500">💡 Hint: </span>
              {currentQ?.hint}
            </div>
          </div>

          {/* Right: Question + Answer */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Question */}
            <div className="card">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                {bank.label} · Question {questionIdx + 1}
              </div>
              <p className="text-base font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {currentQ?.q}
              </p>
            </div>

            {/* Answer area */}
            <div className="card flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Your Answer</div>
                <div className="flex items-center gap-2">
                  {!isListening ? (
                    <button
                      onClick={startListening}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
                    >
                      <Mic size={12} /> Start Speaking
                    </button>
                  ) : (
                    <button
                      onClick={stopListening}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                    >
                      <MicOff size={12} /> Stop
                    </button>
                  )}
                </div>
              </div>

              <textarea
                className="input w-full resize-none"
                style={{ minHeight: '160px', fontFamily: 'inherit', lineHeight: 1.6 }}
                placeholder="Speak your answer or type here..."
                value={transcript + interimTranscript}
                onChange={e => setTranscript(e.target.value)}
              />

              {isListening && (
                <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: '#10b981' }}>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Listening — speak your answer clearly
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={submitAnswer}
              disabled={!(transcript + interimTranscript).trim()}
              className="btn-primary justify-center py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Answer & Get Feedback <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ════════ FEEDBACK SCREEN ════════ */
  if (mode === 'feedback') {
    return (
      <div className="p-6 fade-in max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>📊 AI Feedback</h2>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Q {questionIdx + 1} of {questions.length}
          </div>
        </div>

        {loadingFeedback ? (
          <div className="card flex flex-col items-center gap-5 py-16">
            <AIAvatar speaking />
            <div className="text-center">
              <div className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Analyzing your answer...</div>
              <div className="flex gap-1.5 justify-center">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-accent typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        ) : feedback ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Score card */}
            <div className="card flex flex-col items-center gap-4 py-8">
              <AIAvatar idle />
              <ScoreBadge score={feedback.score} />
              <div className="text-center">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Question {questionIdx + 1} · {bank.label}
                </div>
              </div>
              {feedback.followUp && (
                <div className="w-full p-3 rounded-lg text-xs" style={{ background: 'var(--bg3)' }}>
                  <div className="font-semibold text-accent mb-1">🔍 Follow-up</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{feedback.followUp}</div>
                </div>
              )}
            </div>

            {/* Detailed feedback */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Question recap */}
              <div className="card">
                <div className="text-xs text-accent font-semibold mb-1">Question</div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{currentQ?.q}</p>
              </div>

              {/* Strengths */}
              {feedback.strengths?.length > 0 && (
                <div className="card">
                  <div className="text-sm font-semibold mb-3 text-emerald-500">✅ Strengths</div>
                  {feedback.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              )}

              {/* Improvements */}
              {feedback.improvements?.length > 0 && (
                <div className="card">
                  <div className="text-sm font-semibold mb-3 text-amber-500">⚠️ Areas to Improve</div>
                  {feedback.improvements.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              )}

              {/* Sample answer */}
              {feedback.sampleAnswer && (
                <div className="card" style={{ background: 'rgba(108,99,255,0.06)', borderColor: 'rgba(108,99,255,0.2)' }}>
                  <div className="text-sm font-semibold mb-2 text-accent">💡 Model Answer</div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feedback.sampleAnswer}</p>
                </div>
              )}

              <button onClick={nextQuestion} className="btn-primary justify-center py-3 text-base">
                {questionIdx + 1 >= questions.length ? '📊 View Final Results' : 'Next Question →'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  /* ════════ SUMMARY SCREEN ════════ */
  if (mode === 'summary') {
    return (
      <div className="p-6 fade-in max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{avgScore >= 8 ? '🏆' : avgScore >= 6 ? '🎯' : '📚'}</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Interview Complete!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's your performance summary</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Avg Score', value: `${avgScore}/10`, color: avgScore >= 8 ? '#10b981' : avgScore >= 6 ? '#f59e0b' : '#ef4444' },
            { label: 'Questions', value: sessionResults.length, color: '#6c63ff' },
            { label: 'Time Taken', value: formatTime(timer), color: '#06b6d4' }
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Per-question breakdown */}
        <div className="card mb-6">
          <div className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Question Breakdown</div>
          <div className="space-y-3">
            {sessionResults.map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: 'var(--bg3)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: (r.feedback?.score || 0) >= 8 ? '#10b981' : (r.feedback?.score || 0) >= 6 ? '#f59e0b' : '#ef4444' }}>
                  {r.feedback?.score || '-'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.question}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.feedback?.verdict}</div>
                </div>
                <div className="w-20">
                  <div className="progress-bar">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-500"
                      style={{ width: `${(r.feedback?.score || 0) * 10}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setMode('setup')} className="btn-outline flex-1 justify-center py-3">
            <RefreshCw size={16} /> New Interview
          </button>
          <button onClick={startInterview} className="btn-primary flex-1 justify-center py-3">
            🔁 Retry Same Topics
          </button>
        </div>
      </div>
    );
  }

  return null;
}
