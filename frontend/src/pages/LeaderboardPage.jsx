import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaderboardAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Tabs, LoadingSpinner } from '@/components/common/UI';

const LB_TABS = [
  { id: 'xp', label: '⚡ XP' },
  { id: 'dsa', label: '🌳 DSA' },
  { id: 'aptitude', label: '🧮 Aptitude' },
  { id: 'streak', label: '🔥 Streak' }
];

const SAMPLE_USERS = [
  { name: 'Rahul Sharma', xp: 12840, level: 18, streak: 45, scores: { dsa: 950, aptitude: 920 }, badges: 12 },
  { name: 'Priya Patel', xp: 11200, level: 16, streak: 38, scores: { dsa: 910, aptitude: 940 }, badges: 10 },
  { name: 'Arjun Kumar', xp: 4820, level: 12, streak: 12, scores: { dsa: 847, aptitude: 780 }, badges: 3, isMe: true },
  { name: 'Sanya Gupta', xp: 4600, level: 11, streak: 9, scores: { dsa: 820, aptitude: 760 }, badges: 5 },
  { name: 'Vikram Singh', xp: 3920, level: 10, streak: 21, scores: { dsa: 780, aptitude: 700 }, badges: 4 },
  { name: 'Aisha Khan', xp: 3750, level: 9, streak: 7, scores: { dsa: 750, aptitude: 810 }, badges: 6 },
  { name: 'Rohan Mehta', xp: 3200, level: 9, streak: 5, scores: { dsa: 720, aptitude: 680 }, badges: 3 },
  { name: 'Divya Nair', xp: 2980, level: 8, streak: 14, scores: { dsa: 690, aptitude: 720 }, badges: 4 },
  { name: 'Karan Joshi', xp: 2750, level: 8, streak: 3, scores: { dsa: 660, aptitude: 640 }, badges: 2 },
  { name: 'Meera Pillai', xp: 2400, level: 7, streak: 8, scores: { dsa: 610, aptitude: 680 }, badges: 3 }
];

function RankBadge({ rank }) {
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-sm font-bold text-black">1</div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-sm font-bold text-white">2</div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-sm font-bold text-white">3</div>;
  return <div className="w-8 h-8 rounded-full bg-surface3 flex items-center justify-center text-xs font-bold text-secondary">{rank}</div>;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState('xp');
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', tab],
    queryFn: () => leaderboardAPI.get({ type: tab }).then(r => r.data),
    staleTime: 60000
  });

  const users = data?.leaderboard?.length ? data.leaderboard : SAMPLE_USERS;

  const getSortValue = (u) => {
    if (tab === 'dsa') return u.scores?.dsa || 0;
    if (tab === 'aptitude') return u.scores?.aptitude || 0;
    if (tab === 'streak') return u.streak || 0;
    return u.xp || 0;
  };

  const sorted = [...users].sort((a, b) => getSortValue(b) - getSortValue(a));

  return (
    <div className="p-6 fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold">🏆 Global Leaderboard</h1>
        <p className="text-sm text-secondary mt-0.5">Compete with learners worldwide</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs tabs={LB_TABS} active={tab} onChange={setTab} />

          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size={24} /></div>
          ) : (
            <div className="card p-0 overflow-hidden">
              {/* Top 3 podium */}
              <div className="bg-gradient-to-b from-accent/10 to-transparent p-4 flex items-end justify-center gap-3 border-b border-surface">
                {sorted[1] && (
                  <div className="text-center pb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-sm font-bold text-white mx-auto mb-1">
                      {sorted[1].name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="text-xs font-semibold">{sorted[1].name.split(' ')[0]}</div>
                    <div className="text-[10px] text-muted">{getSortValue(sorted[1]).toLocaleString()}</div>
                    <div className="text-lg mt-1">🥈</div>
                  </div>
                )}
                {sorted[0] && (
                  <div className="text-center pb-0 scale-110">
                    <div className="text-lg mb-1">👑</div>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-base font-bold text-black mx-auto mb-1">
                      {sorted[0].name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="text-sm font-bold">{sorted[0].name.split(' ')[0]}</div>
                    <div className="text-xs text-amber-400">{getSortValue(sorted[0]).toLocaleString()}</div>
                    <div className="text-lg mt-1">🥇</div>
                  </div>
                )}
                {sorted[2] && (
                  <div className="text-center pb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-sm font-bold text-white mx-auto mb-1">
                      {sorted[2].name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="text-xs font-semibold">{sorted[2].name.split(' ')[0]}</div>
                    <div className="text-[10px] text-muted">{getSortValue(sorted[2]).toLocaleString()}</div>
                    <div className="text-lg mt-1">🥉</div>
                  </div>
                )}
              </div>

              {/* Rest of leaderboard */}
              <div className="divide-y divide-dark-border">
                {sorted.slice(3).map((u, i) => {
                  const isMe = u.isMe || u._id === user?._id || u.name === user?.name;
                  return (
                    <div key={i} className={`flex items-center gap-3 px-4 py-3 transition-colors ${isMe ? 'bg-accent/5 border-l-2 border-accent' : 'hover:bg-surface3'}`}>
                      <RankBadge rank={i + 4} />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/60 to-cyan-500/60 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{u.name}{isMe ? ' (You)' : ''}</div>
                        <div className="text-xs text-muted">Lv.{u.level} · {u.badges || 0} badges</div>
                      </div>
                      <div className={`text-sm font-bold ${tab === 'streak' ? 'text-amber-400' : 'text-accent'}`}>
                        {tab === 'streak' ? `🔥 ${u.streak}d` : `⚡ ${getSortValue(u).toLocaleString()}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* My rank card */}
          <div className="card bg-gradient-to-br from-accent/15 to-transparent border-accent/20">
            <div className="text-sm font-semibold mb-3">📍 Your Position</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center text-base font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
              <div>
                <div className="font-semibold">{user?.name || 'You'}</div>
                <div className="text-xs text-accent">Level {user?.level || 12}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: 'Global Rank', v: '#3', c: 'text-amber-400' },
                { l: 'XP', v: `${(user?.xp || 4820).toLocaleString()}`, c: 'text-accent' },
                { l: 'DSA Score', v: user?.scores?.dsa || 847, c: 'text-emerald-400' },
                { l: 'Streak', v: `${user?.streak || 12}d`, c: 'text-orange-400' }
              ].map(s => (
                <div key={s.l} className="bg-surface3 rounded-lg p-2 text-center">
                  <div className={`text-base font-bold ${s.c}`}>{s.v}</div>
                  <div className="text-[10px] text-muted">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Category leaders */}
          <div className="card">
            <div className="text-sm font-semibold mb-3">🏅 Category Leaders</div>
            <div className="space-y-2">
              {[
                { cat: 'DSA Master', name: 'Rahul Sharma', score: 950, icon: '🌳' },
                { cat: 'Aptitude King', name: 'Priya Patel', score: 940, icon: '🧮' },
                { cat: 'Streak Champion', name: 'Vikram Singh', score: '45d', icon: '🔥' },
                { cat: 'Speed Coder', name: 'Aisha Khan', score: 900, icon: '⚡' }
              ].map(c => (
                <div key={c.cat} className="flex items-center gap-3 p-2.5 bg-surface3 rounded-xl">
                  <span className="text-xl">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-muted">{c.cat}</div>
                    <div className="text-sm font-medium truncate">{c.name}</div>
                  </div>
                  <div className="text-sm font-bold text-amber-400">{c.score}</div>
                </div>
              ))}
            </div>
          </div>

          {/* XP needed to advance */}
          <div className="card">
            <div className="text-sm font-semibold mb-3">🚀 Climb the Rankings</div>
            <div className="text-xs text-secondary mb-3">XP needed to overtake the person above you:</div>
            <div className="bg-surface3 rounded-xl p-3">
              <div className="text-xs text-muted">To reach #2 (Priya Patel)</div>
              <div className="text-lg font-bold text-accent mt-0.5">+6,380 XP needed</div>
              <div className="progress-bar mt-2">
                <div className="h-full bg-accent rounded-full" style={{ width: '30%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
