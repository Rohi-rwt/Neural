import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { aiAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Tabs, LoadingSpinner, ProgressBar } from '@/components/common/UI';
import toast from 'react-hot-toast';

const RM_TABS = [
  { id: '7day', label: '7-Day Plan' },
  { id: '30day', label: '30-Day Plan' },
  { id: '90day', label: '90-Day FAANG' }
];

const DEFAULT_7DAY = [
  { day: 1, topic: 'Arrays Mastery', tasks: ['Two Pointers technique', 'Sliding Window', 'Prefix Sum'], done: true, today: false },
  { day: 2, topic: 'String Algorithms', tasks: ['KMP Pattern Matching', 'String DP basics', 'Anagram problems'], done: true, today: false },
  { day: 3, topic: 'Binary Trees', tasks: ['Tree traversals (BFS/DFS)', 'Height & Diameter', 'LCA problems'], done: false, today: true },
  { day: 4, topic: 'BST & Heaps', tasks: ['BST operations', 'Priority Queue', 'Top K problems'], done: false, today: false },
  { day: 5, topic: 'Graph Algorithms', tasks: ['BFS & DFS', 'Shortest path', 'Connected components'], done: false, today: false },
  { day: 6, topic: 'Mock Test Day', tasks: ['DSA Sprint (20 questions)', 'Review wrong answers', 'AI analysis'], done: false, today: false },
  { day: 7, topic: 'Weak Topics Review', tasks: ['AI-detected weak areas', 'Practice sessions', 'Consolidation'], done: false, today: false }
];

const DEFAULT_30DAY = [
  { week: 1, theme: 'Array & String Mastery', topics: ['Arrays', 'Strings', 'Hashing'], problems: 40 },
  { week: 2, theme: 'Tree & Graph Foundations', topics: ['Binary Trees', 'BST', 'Graphs'], problems: 35 },
  { week: 3, theme: 'Advanced Algorithms', topics: ['Dynamic Programming', 'Greedy', 'Backtracking'], problems: 30 },
  { week: 4, theme: 'Mock Tests & Review', topics: ['System Design basics', 'Mock interviews', 'Weak topics'], problems: 20 }
];

function WeekStep({ step, isLast }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 ${
          step.done ? 'bg-accent border-accent text-white' :
          step.today ? 'border-amber-400 text-amber-400' :
          'border-surface text-muted'
        }`}>
          {step.done ? '✓' : step.day}
        </div>
        {!isLast && <div className={`w-0.5 h-12 mt-1 ${step.done ? 'bg-accent' : 'bg-dark-border'}`} />}
      </div>
      <div className="flex-1 pb-8">
        <div className={`text-xs font-semibold mb-0.5 ${step.today ? 'text-amber-400' : 'text-accent'}`}>
          Day {step.day}{step.today ? ' · TODAY 🎯' : ''}
        </div>
        <div className="text-sm font-semibold mb-1">{step.topic}</div>
        <div className="space-y-1">
          {step.tasks.map((t, i) => (
            <div key={i} className="flex gap-1.5 text-xs text-secondary">
              <span className="text-muted mt-0.5">•</span> {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const [tab, setTab] = useState('7day');
  const [target, setTarget] = useState('faang');
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);

  const { user } = useAuthStore();

  const generateMutation = useMutation({
    mutationFn: (data) => aiAPI.generateRoadmap(data).then(r => r.data.roadmap),
    onSuccess: (data) => {
      setGeneratedRoadmap(data);
      toast.success('Personalized roadmap generated! 🗺️');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not generate roadmap. Please try again.');
    }
  });

  const handleGenerate = () => {
    const duration = tab === '7day' ? 7 : tab === '30day' ? 30 : 90;
    generateMutation.mutate({ duration, target });
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">🗺️ Learning Roadmap</h1>
          <p className="text-sm text-secondary mt-0.5">AI-generated personalized study plans</p>
        </div>
      </div>

      <Tabs tabs={RM_TABS} active={tab} onChange={setTab} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Roadmap */}
        <div className="lg:col-span-2">
          {tab === '7day' && (
            <div className="card">
              <div className="text-sm font-semibold mb-4">📅 7-Day DSA Sprint</div>
              {DEFAULT_7DAY.map((step, i) => (
                <WeekStep key={i} step={step} isLast={i === DEFAULT_7DAY.length - 1} />
              ))}
            </div>
          )}

          {tab === '30day' && (
            <div className="space-y-3">
              {DEFAULT_30DAY.map((week, i) => (
                <div key={i} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs text-accent font-semibold">Week {week.week}</div>
                      <div className="text-sm font-bold">{week.theme}</div>
                    </div>
                    <div className="text-xs text-muted">{week.problems} problems</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {week.topics.map(t => <span key={t} className="tag-accent text-[10px]">{t}</span>)}
                  </div>
                  <ProgressBar value={i === 0 ? 100 : i === 1 ? 60 : 0} max={100} color={i === 0 ? 'green' : 'accent'} />
                  <div className="text-[10px] text-muted mt-1">{i === 0 ? 'Completed' : i === 1 ? '60% done' : 'Not started'}</div>
                </div>
              ))}
            </div>
          )}

          {tab === '90day' && (
            generatedRoadmap ? (
              <div className="card">
                <div className="text-sm font-semibold mb-4">🤖 AI-Generated FAANG Roadmap</div>
                <div className="text-xs text-secondary mb-4">{generatedRoadmap.overview}</div>
                <div className="space-y-4">
                  {generatedRoadmap.weeks?.slice(0, 4).map((week, i) => (
                    <div key={i} className="border border-surface rounded-xl p-4">
                      <div className="text-xs text-accent font-semibold mb-1">Week {week.week}</div>
                      <div className="text-sm font-bold mb-2">{week.theme}</div>
                      {week.days?.slice(0, 2).map((day, j) => (
                        <div key={j} className="text-xs text-secondary mb-1">
                          Day {day.day}: {day.topics?.join(', ')} — {day.estimatedHours}h
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <div className="text-5xl mb-4">🗺️</div>
                <div className="text-lg font-bold mb-2">90-Day FAANG Roadmap</div>
                <p className="text-sm text-secondary mb-6 max-w-sm mx-auto">
                  Get a personalized 90-day plan tailored to your current level and weak areas, powered by AI.
                </p>
                <button onClick={handleGenerate} disabled={generateMutation.isPending} className="btn-primary mx-auto">
                  {generateMutation.isPending ? <><LoadingSpinner size={14} /> Generating...</> : '🤖 Generate My Roadmap'}
                </button>
                <p className="text-xs text-muted mt-3">Requires Pro plan for full 90-day plan</p>
              </div>
            )
          )}
        </div>

        {/* Right: Controls */}
        <div className="space-y-4">
          {/* Target selector */}
          <div className="card">
            <div className="text-sm font-semibold mb-3">🎯 Your Goal</div>
            <div className="grid grid-cols-3 gap-2">
              {[{ id: 'faang', icon: '🔍', label: 'FAANG' }, { id: 'startup', icon: '🚀', label: 'Startup' }, { id: 'internship', icon: '🎓', label: 'Intern' }].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTarget(t.id)}
                  className={`p-3 rounded-xl text-center border transition-all ${target === t.id ? 'border-accent bg-accent/10' : 'border-surface hover:border-surface'}`}
                >
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <div className={`text-xs font-medium ${target === t.id ? 'text-accent' : 'text-secondary'}`}>{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* AI weak topics */}
          <div className="card">
            <div className="text-sm font-semibold mb-3">🤖 AI Detected Weak Areas</div>
            <div className="space-y-2">
              {(user?.weakTopics?.length ? user.weakTopics : ['Dynamic Programming', 'Graph Algorithms', 'Binary Search Trees']).slice(0, 3).map((t, i) => (
                <div key={i} className="p-3 bg-surface3 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium capitalize">{t.replace(/-/g, ' ')}</span>
                    <span className="text-red-400 text-xs">{[35, 48, 42][i]}%</span>
                  </div>
                  <ProgressBar value={[35, 48, 42][i]} max={100} color="red" />
                  <div className="text-[10px] text-muted mt-1.5">Needs attention — practice {[20, 15, 18][i]}+ problems</div>
                </div>
              ))}
            </div>
            <Link to="/ai-tutor" className="btn-primary w-full justify-center mt-3 text-xs">
              🤖 Practice with AI Tutor
            </Link>
          </div>

          {/* Stats */}
          <div className="card">
            <div className="text-sm font-semibold mb-3">📊 This Week's Progress</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: 'Problems', v: '28', c: 'text-accent' },
                { l: 'Study Hours', v: '14h', c: 'text-amber-400' },
                { l: 'AI Queries', v: '42', c: 'text-cyan-400' },
                { l: 'Tests', v: '2', c: 'text-emerald-400' }
              ].map(s => (
                <div key={s.l} className="bg-surface3 rounded-xl p-3 text-center">
                  <div className={`text-xl font-bold ${s.c}`}>{s.v}</div>
                  <div className="text-[10px] text-muted">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
