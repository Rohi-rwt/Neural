import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { progressAPI } from '@/services/api';
import { StatCard, ProgressBar, Badge, Tabs, LoadingSpinner } from '@/components/common/UI';

const BADGES_DATA = [
  { id: 'first-solve', name: 'First Blood', icon: '🩸', desc: 'Solve your first problem', earned: true },
  { id: 'streak-7', name: 'Week Warrior', icon: '🔥', desc: '7-day streak', earned: true },
  { id: 'century', name: 'Century Club', icon: '💯', desc: '100 problems solved', earned: true },
  { id: 'dsa-ninja', name: 'DSA Ninja', icon: '🥷', desc: '300 DSA problems', earned: false },
  { id: 'aptitude-pro', name: 'Aptitude Pro', icon: '🧮', desc: 'Score 900+ aptitude', earned: false },
  { id: 'interview-ready', name: 'Interview Ready', icon: '💼', desc: '85%+ interview score', earned: false },
  { id: 'dp-master', name: 'DP Master', icon: '🧩', desc: '50 DP problems', earned: false },
  { id: 'top-10', name: 'Top 10%', icon: '🏆', desc: 'Global top 10%', earned: false }
];

const TOPIC_MASTERY = [
  { topic: 'Arrays', pct: 90, color: 'green' },
  { topic: 'Strings', pct: 82, color: 'green' },
  { topic: 'Trees', pct: 65, color: 'amber' },
  { topic: 'Graphs', pct: 48, color: 'amber' },
  { topic: 'Dynamic Programming', pct: 35, color: 'red' },
  { topic: 'Backtracking', pct: 28, color: 'red' },
  { topic: 'Aptitude', pct: 76, color: 'cyan' },
  { topic: 'OS Fundamentals', pct: 68, color: 'cyan' }
];

const PROG_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'badges', label: 'Badges' },
  { id: 'topics', label: 'Topic Mastery' }
];

function ActivityHeatmap({ heatmap = {} }) {
  const today = new Date();
  const weeks = 12;
  const days = weeks * 7;

  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const key = d.toISOString().split('T')[0];
    const count = heatmap[key]?.problems || (Math.random() > 0.6 ? Math.floor(Math.random() * 8) : 0);
    return { date: d, count, key };
  });

  const getColor = (count) => {
    if (count === 0) return 'bg-surface3';
    if (count < 3) return 'bg-accent/25';
    if (count < 6) return 'bg-accent/55';
    return 'bg-accent';
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {cells.map((cell, i) => (
          <div
            key={i}
            title={`${cell.date.toDateString()}: ${cell.count} problems`}
            className={`w-3 h-3 rounded-sm ${getColor(cell.count)} transition-colors cursor-pointer hover:ring-1 hover:ring-accent`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-muted">
        <span>Less</span>
        {['bg-surface3','bg-accent/25','bg-accent/55','bg-accent'].map((c,i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const [tab, setTab] = useState('overview');

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => progressAPI.dashboard().then(r => r.data.dashboard)
  });

  const { data: heatmapData } = useQuery({
    queryKey: ['heatmap'],
    queryFn: () => progressAPI.heatmap().then(r => r.data.heatmap)
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size={32} /></div>;

  const stats = dashboard?.stats || {};
  const earnedBadges = (dashboard?.badges || []).map(b => b.id);

  return (
    <div className="p-6 fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold">📊 My Progress</h1>
        <p className="text-sm text-secondary mt-0.5">Track your learning journey</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Problems Solved" value={stats.problemsSolved || 312} color="green" icon="✅" progress={62} />
        <StatCard label="DSA Score" value={stats.dsa || 847} color="accent" icon="🌳" progress={(stats.dsa||847)/10} />
        <StatCard label="Aptitude Score" value={stats.aptitude || 780} color="amber" icon="🧮" progress={(stats.aptitude||780)/10} />
        <StatCard label="Current Streak" value={`${stats.streak || 12} days`} color="cyan" icon="🔥" progress={Math.min(100,(stats.streak||12)/30*100)} />
      </div>

      <Tabs tabs={PROG_TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="space-y-5">
          {/* Heatmap */}
          <div className="card">
            <div className="text-sm font-semibold mb-4">📅 Activity Heatmap — Last 12 Weeks</div>
            <ActivityHeatmap heatmap={heatmapData || {}} />
          </div>

          {/* Progress over time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card">
              <div className="text-sm font-semibold mb-4">📈 Score History</div>
              <div className="space-y-4">
                {[
                  { label: 'DSA Score', value: stats.dsa || 847, max: 1000, color: 'accent' },
                  { label: 'Aptitude Score', value: stats.aptitude || 780, max: 1000, color: 'amber' },
                  { label: 'Interview Score', value: stats.interview || 72, max: 100, color: 'cyan' }
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-secondary">{s.label}</span>
                      <span className={`font-bold text-${s.color === 'accent' ? 'accent' : s.color === 'amber' ? 'amber-400' : 'cyan-400'}`}>{s.value}/{s.max}</span>
                    </div>
                    <ProgressBar value={s.value} max={s.max} color={s.color} />
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="text-sm font-semibold mb-4">🎯 Problem Breakdown</div>
              <div className="flex gap-3 mb-4">
                {[
                  { l: 'Easy', v: 142, c: 'text-emerald-400' },
                  { l: 'Medium', v: 128, c: 'text-amber-400' },
                  { l: 'Hard', v: 42, c: 'text-red-400' }
                ].map(s => (
                  <div key={s.l} className="flex-1 bg-surface3 rounded-xl p-3 text-center">
                    <div className={`text-xl font-bold ${s.c}`}>{s.v}</div>
                    <div className="text-xs text-muted">{s.l}</div>
                  </div>
                ))}
              </div>
              {/* Donut visual (simple bars) */}
              <div className="flex rounded-full overflow-hidden h-3">
                <div className="bg-emerald-500" style={{ width: '45%' }} />
                <div className="bg-amber-500" style={{ width: '41%' }} />
                <div className="bg-red-500" style={{ width: '14%' }} />
              </div>
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>142 Easy</span><span>128 Medium</span><span>42 Hard</span>
              </div>

              <div className="mt-4 border-t border-surface pt-4 space-y-2">
                {[
                  { l: 'AI hints used', v: '23 times' },
                  { l: 'Avg solve time', v: '18 min' },
                  { l: 'Best streak', v: '12 days' },
                  { l: 'Tests taken', v: '14 tests' }
                ].map(s => (
                  <div key={s.l} className="flex justify-between text-xs">
                    <span className="text-muted">{s.l}</span>
                    <span className="text-secondary font-medium">{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'badges' && (
        <div className="space-y-5">
          <div className="card">
            <div className="text-sm font-semibold mb-1">🏅 Badges & Achievements</div>
            <p className="text-xs text-muted mb-4">Earn badges by completing challenges and reaching milestones</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {BADGES_DATA.map(b => (
                <Badge
                  key={b.id}
                  badge={{ ...b, earned: earnedBadges.includes(b.id) || b.earned }}
                />
              ))}
            </div>
          </div>

          <div className="card">
            <div className="text-sm font-semibold mb-3">🎯 Next Badges to Earn</div>
            <div className="space-y-3">
              {BADGES_DATA.filter(b => !b.earned).slice(0, 3).map(b => (
                <div key={b.id} className="flex items-center gap-3 p-3 bg-surface3 rounded-xl">
                  <span className="text-2xl opacity-50">{b.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{b.name}</div>
                    <div className="text-xs text-muted">{b.desc}</div>
                    <ProgressBar value={Math.random() * 60 + 10} max={100} color="accent" className="mt-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'topics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card">
            <div className="text-sm font-semibold mb-4">🗂️ Topic Mastery</div>
            <div className="space-y-4">
              {TOPIC_MASTERY.map(t => (
                <div key={t.topic}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-secondary">{t.topic}</span>
                    <span className={`font-semibold ${t.pct >= 70 ? 'text-emerald-400' : t.pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{t.pct}%</span>
                  </div>
                  <ProgressBar value={t.pct} max={100} color={t.pct >= 70 ? 'green' : t.pct >= 50 ? 'amber' : 'red'} />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="text-sm font-semibold mb-4">⚠️ Weak Areas (AI Detected)</div>
            <p className="text-xs text-muted mb-4">Focus on these topics to improve your overall score</p>
            <div className="space-y-3">
              {TOPIC_MASTERY.filter(t => t.pct < 50).map(t => (
                <div key={t.topic} className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{t.topic}</span>
                    <span className="text-red-400 text-xs font-semibold">{t.pct}%</span>
                  </div>
                  <ProgressBar value={t.pct} max={100} color="red" className="mb-2" />
                  <p className="text-xs text-muted">Practice 20+ problems to improve. Ask AI Tutor for help.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
