import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { progressAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { StatCard, LoadingSpinner, DifficultyTag } from '@/components/common/UI';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => progressAPI.dashboard().then(r => r.data.dashboard)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 fade-in">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-accent/20 to-cyan-500/10 border border-accent/20 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
           <h1 className="text-lg md:text-xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-sm text-secondary">
            You're on a <span className="text-amber-400 font-semibold">{stats.streak || 0}-day streak</span>.
            {stats.streak >= 3 ? ' Keep it going! 🔥' : ' Start your streak today!'}
          </p>
        </div>
         <Link
  to="/ai-tutor"
  className="btn-primary w-full md:w-auto justify-center"
>
          🤖 Ask AI Tutor
        </Link>
      </motion.div>

      {/* Stat cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="DSA Score" value={stats.dsa || 0} icon="🌳" color="accent"
          change="↑ +23 this week" progress={(stats.dsa || 0) / 10} />
        <StatCard label="Problems Solved" value={stats.problemsSolved || 0} icon="✅" color="green"
          change="↑ +8 today" progress={Math.min(100, ((stats.problemsSolved || 0) / 500) * 100)} />
        <StatCard label="Aptitude Score" value={stats.aptitude || 0} icon="🧮" color="amber"
          change="↑ +15 this week" progress={(stats.aptitude || 0) / 10} />
        <StatCard label="Interview Score" value={`${stats.interview || 0}%`} icon="💼" color="cyan"
          change="↑ +5% this month" progress={stats.interview || 0} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily Challenge */}
         <div className="flex flex-col  gap-2">
          <div className="section-title text-base">🎯 Daily Challenge</div>
          <div className="bg-surface3 border border-surface rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Two Sum</span>
              <DifficultyTag difficulty="easy" />
            </div>
            <p className="text-xs text-secondary mb-3">Find two numbers in an array that add up to the target.</p>
            <div className="flex items-center justify-between">
              <span className="tag-accent text-[10px]">Arrays</span>
              <span className="text-xs text-amber-400">🏆 +150 XP</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/ai-tutor" className="btn-primary flex-1 justify-center text-xs">🤖 Solve with AI</Link>
            <Link to="/dsa/two-sum" className="btn-outline text-xs w-full sm:w-auto justify-center">View Problem</Link>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="card">
          <div className="section-title text-base">📈 Weekly Activity</div>
          <div className="flex gap-1 items-end h-20 mb-4">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => {
              const h = [60, 80, 45, 90, 70, 100, 55][i];
              const isToday = i === new Date().getDay() - 1;
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t transition-all ${isToday ? 'bg-accent' : 'bg-surface3'}`}
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[9px] text-muted">{d}</span>
                </div>
              );
            })}
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
            {[{l:'Problems',v:48,c:'text-accent'},{l:'Tests',v:3,c:'text-emerald-400'},{l:'Hours',v:'6.2h',c:'text-amber-400'}].map(s => (
              <div key={s.l} className="bg-surface3 rounded-lg p-2">
                <div className={`text-base font-bold ${s.c}`}>{s.v}</div>
                <div className="text-[10px] text-muted">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card">
          <div className="section-title text-base">🧠 AI Recommendations</div>
          <div className="space-y-2">
            {(data?.weakTopics?.length
              ? data.weakTopics.slice(0, 3).map(t => ({ t: t.replace(/-/g,' ').replace(/\b\w/g, l => l.toUpperCase()), s: 'Weak area detected', c: 'text-red-400' }))
              : [
                { t: 'Binary Trees — BFS/DFS', s: 'Weak area detected', c: 'text-red-400' },
                { t: 'Profit & Loss Problems', s: 'Below average', c: 'text-amber-400' },
                { t: 'Dynamic Programming', s: 'Ready to advance', c: 'text-emerald-400' }
              ]
            ).map((r, i) => (
              <Link to="/ai-tutor" key={i}
              className="flex items-start sm:items-center gap-3 p-3 bg-surface3 rounded-xl hover:border-accent/30 border border-transparent transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-sm flex-shrink-0">📌</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.t}</div>
                  <div className={`text-xs ${r.c}`}>{r.s}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Tests */}
        <div className="card">
          <div className="section-title text-base">📝 Recent Tests</div>
          <div className="space-y-2">
            {(data?.recentTests?.length
              ? data.recentTests.map(t => ({
                  n: t.test?.title || 'Test',
                  s: t.score?.percentage || 0,
                  d: new Date(t.createdAt).toLocaleDateString()
                }))
              : [
                { n: 'Arrays & Strings', s: 85, d: '2h ago' },
                { n: 'Aptitude — Quant', s: 72, d: 'Yesterday' },
                { n: 'OS Fundamentals', s: 61, d: '3 days ago' }
              ]
            ).map((t, i) => (
              <div key={i}  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-surface3 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{t.n}</div>
                  <div className="text-xs text-muted">{t.d}</div>
                </div>
                <div className={`text-lg font-bold self-end sm:self-auto ${t.s >= 80 ? 'text-emerald-400' : t.s >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {t.s}%
                </div>
              </div>
            ))}
          </div>
          <Link to="/tests"className="btn-outline w-full justify-center mt-3 text-xs">
            View All Tests →
          </Link>
        </div>
      </div>
    </div>
  );
}
