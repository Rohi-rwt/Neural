import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { problemAPI } from '@/services/api';
import { DifficultyTag, Tabs, LoadingSpinner, ProgressBar } from '@/components/common/UI';

const APT_TABS = [
  { id: 'topics', label: 'Topics' },
  { id: 'problems', label: 'Practice' },
  { id: 'solver', label: '🧮 AI Solver' }
];

const TOPICS = [
  { id: 'quantitative', name: 'Quantitative Aptitude', icon: '📐', desc: 'Number theory, Percentages, Time & Work', problems: 284, progress: 72 },
  { id: 'logical-reasoning', name: 'Logical Reasoning', icon: '🧩', desc: 'Puzzles, Syllogism, Blood Relations', problems: 196, progress: 65 },
  { id: 'verbal', name: 'Verbal Ability', icon: '📖', desc: 'RC, Grammar, Vocabulary', problems: 152, progress: 58 },
  { id: 'data-interpretation', name: 'Data Interpretation', icon: '📊', desc: 'Charts, Graphs, Caselet DI', problems: 120, progress: 70 },
  { id: 'profit-loss', name: 'Profit & Loss', icon: '💰', desc: 'Partnership, Discount, SI & CI', problems: 88, progress: 45 },
  { id: 'time-work', name: 'Time & Work', icon: '⏱️', desc: 'Pipes, Efficiency, Work Rate', problems: 76, progress: 62 },
  { id: 'time-distance', name: 'Speed, Time & Distance', icon: '🚂', desc: 'Trains, Boats, Races, Relative speed', problems: 68, progress: 55 },
  { id: 'percentages', name: 'Percentages', icon: '🔢', desc: 'Successive %, Population, Mixtures', problems: 60, progress: 80 }
];

const SAMPLE_PROBLEMS = [
  { title: 'Profit & Loss — Shopkeeper Problem', difficulty: 'easy', topic: 'profit-loss', correctAnswer: 'B', options: [{ label: 'A', text: '20%' }, { label: 'B', text: '25%' }, { label: 'C', text: '15%' }, { label: 'D', text: '30%' }], explanation: 'Profit% = (SP-CP)/CP × 100 = (1000-800)/800 × 100 = 25%' },
  { title: 'Time & Work — Two Workers', difficulty: 'medium', topic: 'time-work', correctAnswer: 'B', options: [{ label: 'A', text: '6 days' }, { label: 'B', text: '7.2 days' }, { label: 'C', text: '8 days' }, { label: 'D', text: '7.5 days' }], explanation: 'Combined rate = 1/12 + 1/18 = 5/36. Days = 36/5 = 7.2' },
  { title: 'Train Speed Calculation', difficulty: 'medium', topic: 'time-distance', correctAnswer: 'A', options: [{ label: 'A', text: '72 km/h' }, { label: 'B', text: '60 km/h' }, { label: 'C', text: '80 km/h' }, { label: 'D', text: '90 km/h' }], explanation: 'Speed = Distance/Time. Convert to km/h by × 18/5.' },
  { title: 'Percentage — Population Growth', difficulty: 'hard', topic: 'percentages', correctAnswer: 'C', options: [{ label: 'A', text: '12,100' }, { label: 'B', text: '12,000' }, { label: 'C', text: '12,100' }, { label: 'D', text: '11,000' }], explanation: 'Population after 2 years = P(1+r/100)^2 = 10000(1.1)^2 = 12100' }
];

function AISolver() {
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [solving, setSolving] = useState(false);

  const solve = async () => {
    if (!problem.trim()) return;
    setSolving(true);
    setSolution('');
    try {
      const token = JSON.parse(localStorage.getItem('neuralpath-auth') || '{}')?.state?.token;
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: `Solve this aptitude problem step by step with formula and shortcut tricks:\n\n${problem}`,
          mode: 'teacher'
        })
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'text') { full += data.content; setSolution(full); }
          } catch {}
        }
      }
    } catch {
      setSolution('**Step-by-step Solution:**\n\n1. **Identify** what is given and what is asked\n2. **Apply formula**: Use the relevant aptitude formula\n3. **Calculate**: Substitute values step by step\n4. **Verify**: Check the answer makes sense\n\n💡 **Shortcut Tip**: For most percentage problems, use the formula directly without converting to fractions.');
    } finally {
      setSolving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="card space-y-4">
        <div className="text-sm font-semibold flex items-center gap-2">🧮 AI Aptitude Solver</div>
        <textarea
          className="input resize-none h-32 text-sm"
          placeholder="Paste your aptitude problem here...&#10;&#10;Example: A can do a piece of work in 12 days and B can do it in 18 days. How many days will they take together?"
          value={problem}
          onChange={e => setProblem(e.target.value)}
        />
        <button onClick={solve} disabled={solving || !problem.trim()} className="btn-primary disabled:opacity-40">
          {solving ? <><LoadingSpinner size={14} /> Solving...</> : '🤖 Solve Step by Step'}
        </button>
        <div className="bg-surface3 rounded-xl p-3">
          <div className="text-xs font-semibold text-amber-400 mb-2">⚡ Quick Formulas</div>
          <div className="space-y-1.5 text-xs text-secondary">
            {[
              'Profit% = (SP-CP)/CP × 100',
              'Speed = Distance/Time',
              'Work = 1/Days; Combined = sum of rates',
              'SI = PRT/100; CI = P(1+R/100)^T - P',
              'Average = Sum/Count'
            ].map((f, i) => (
              <div key={i} className="flex gap-2"><span className="text-accent">•</span><code className="font-mono">{f}</code></div>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="text-sm font-semibold mb-3">📝 Solution</div>
        {solution ? (
          <div className="text-sm leading-relaxed text-secondary whitespace-pre-wrap">{solution}</div>
        ) : (
          <div className="text-muted text-sm flex items-center justify-center h-32">
            {solving ? <LoadingSpinner size={20} /> : 'Solution will appear here...'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AptitudePage() {
  const [tab, setTab] = useState('topics');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['problems', { category: 'aptitude' }],
    queryFn: () => problemAPI.getAll({ category: 'aptitude', limit: 20 }).then(r => r.data),
    enabled: tab === 'problems'
  });

  const problems = data?.problems?.length ? data.problems : SAMPLE_PROBLEMS;

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">🧮 Aptitude Practice</h1>
          <p className="text-sm text-secondary mt-0.5">Quantitative, Reasoning & Verbal</p>
        </div>
        <Link to="/ai-tutor" className="btn-primary text-xs">🤖 AI Tutor</Link>
      </div>

      <Tabs tabs={APT_TABS} active={tab} onChange={setTab} />

      {tab === 'topics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOPICS.map(t => (
            <div
              key={t.id}
              onClick={() => { setSelectedTopic(t.id); setTab('problems'); }}
              className="card-sm cursor-pointer hover:border-accent/40 hover:-translate-y-1 transition-all"
            >
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className="text-sm font-semibold mb-1">{t.name}</div>
              <div className="text-xs text-muted mb-3">{t.desc}</div>
              <ProgressBar value={t.progress} max={100} color="cyan" className="mb-1" />
              <div className="flex justify-between text-xs mt-1">
                <span className="text-muted">{t.problems} problems</span>
                <span className="text-cyan-400">{t.progress}% done</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'problems' && (
        <div className="space-y-4">
          {selectedTopic && (
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setSelectedTopic(null)} className="text-xs text-muted hover:text-secondary">← All Topics</button>
              <span className="text-muted">/</span>
              <span className="text-xs text-accent capitalize">{selectedTopic.replace(/-/g, ' ')}</span>
            </div>
          )}
          {(isLoading ? Array(4).fill(null) : problems).map((prob, i) => {
            if (!prob) return <div key={i} className="card-sm h-32 animate-pulse bg-surface3" />;
            const ans = answers[i];
            const isRevealed = revealed[i];
            return (
              <div key={i} className="card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted">Q{i + 1}</span>
                  <DifficultyTag difficulty={prob.difficulty} />
                  <span className="tag-accent text-[10px] ml-auto">{prob.topic?.replace(/-/g, ' ')}</span>
                </div>
                <div className="text-sm font-medium mb-4">{prob.title || prob.question}</div>
                <div className="space-y-2 mb-4">
                  {(prob.options || []).map(opt => {
                    let cls = 'border-surface text-secondary hover:border-accent/40';
                    if (isRevealed) {
                      if (opt.label === prob.correctAnswer) cls = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
                      else if (opt.label === ans) cls = 'border-red-500/50 bg-red-500/10 text-red-400';
                    } else if (opt.label === ans) {
                      cls = 'border-accent bg-accent/10 text-accent';
                    }
                    return (
                      <div
                        key={opt.label}
                        onClick={() => !isRevealed && setAnswers(a => ({ ...a, [i]: opt.label }))}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all text-sm ${cls}`}
                      >
                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">{opt.label}</span>
                        {opt.text}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  {ans && !isRevealed && (
                    <button onClick={() => setRevealed(r => ({ ...r, [i]: true }))} className="btn-primary text-xs">
                      Check Answer
                    </button>
                  )}
                  {isRevealed && (
                    <div className="flex-1 bg-surface3 rounded-xl p-3">
                      <div className="text-xs font-semibold text-emerald-400 mb-1">✅ Explanation</div>
                      <div className="text-xs text-secondary">{prob.explanation}</div>
                    </div>
                  )}
                  <Link to="/ai-tutor" className="btn-outline text-xs ml-auto">🤖 Ask AI</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'solver' && <AISolver />}
    </div>
  );
}
