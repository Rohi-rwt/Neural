import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { StatCard, LoadingSpinner, Tabs } from '@/components/common/UI';
import toast from 'react-hot-toast';

const ADMIN_TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'users', label: '👥 Users' },
  { id: 'questions', label: '❓ Questions' },
  { id: 'tests', label: '📝 Tests' }
];

function AddQuestionForm({ onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', difficulty: 'easy', category: 'dsa', topic: 'arrays', type: 'mcq', options: [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }], correctAnswer: 'A', explanation: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.description) { toast.error('Title and description are required'); return; }
    setSaving(true);
    try {
      await adminAPI.createProblem(form);
      toast.success('Question added successfully!');
      onSuccess?.();
      setForm(f => ({ ...f, title: '', description: '', explanation: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add question');
    } finally { setSaving(false); }
  };

  return (
    <div className="card space-y-4">
      <div className="text-sm font-semibold">➕ Add New Question</div>
      <input className="input" placeholder="Question title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      <textarea className="input resize-none h-24" placeholder="Question description / problem statement..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted mb-1 block">Difficulty</label>
          <select className="input" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
            <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Category</label>
          <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="dsa">DSA</option><option value="aptitude">Aptitude</option><option value="cs-fundamentals">CS Fundamentals</option><option value="interview">Interview</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Topic</label>
          <select className="input" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}>
            {['arrays','strings','trees','graphs','dynamic-programming','stack','heap','quantitative','logical-reasoning','os','dbms','hr'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Type</label>
          <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="mcq">MCQ</option><option value="coding">Coding</option><option value="subjective">Subjective</option>
          </select>
        </div>
      </div>
      {form.type === 'mcq' && (
        <div className="space-y-2">
          <label className="text-xs text-muted">Options</label>
          {form.options.map((opt, i) => (
            <div key={opt.label} className="flex gap-2 items-center">
              <span className="text-xs font-bold text-secondary w-4">{opt.label}.</span>
              <input className="input flex-1 h-8 text-xs" placeholder={`Option ${opt.label}`} value={opt.text} onChange={e => setForm(f => ({ ...f, options: f.options.map((o, j) => j === i ? { ...o, text: e.target.value } : o) }))} />
              <input type="radio" name="correct" value={opt.label} checked={form.correctAnswer === opt.label} onChange={() => setForm(f => ({ ...f, correctAnswer: opt.label }))} className="accent-accent" />
            </div>
          ))}
          <div className="text-xs text-muted">Select the correct answer (radio button)</div>
        </div>
      )}
      <textarea className="input resize-none h-16 text-xs" placeholder="Explanation for the answer..." value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} />
      <button onClick={handleSubmit} disabled={saving} className="btn-primary">
        {saving ? <LoadingSpinner size={14} /> : '+ Add Question'}
      </button>
    </div>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const qc = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminAPI.stats().then(r => r.data.stats)
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', userSearch],
    queryFn: () => adminAPI.users({ search: userSearch, limit: 20 }).then(r => r.data),
    enabled: tab === 'users'
  });

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">⚙️ Admin Panel</h1>
          <p className="text-sm text-secondary mt-0.5">Platform management and analytics</p>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-red-400 font-medium">Admin Mode</span>
        </div>
      </div>

      <Tabs tabs={ADMIN_TABS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              <div className="col-span-4 flex justify-center py-8"><LoadingSpinner size={24} /></div>
            ) : [
              { label: 'Total Users', value: (stats?.totalUsers || 8432).toLocaleString(), icon: '👥', color: 'accent' },
              { label: 'Active Today', value: (stats?.activeToday || 1240).toLocaleString(), icon: '✅', color: 'green' },
              { label: 'Questions DB', value: (stats?.totalProblems || 4820).toLocaleString(), icon: '📝', color: 'cyan' },
              { label: 'Tests Today', value: (stats?.testsToday || 324).toLocaleString(), icon: '📊', color: 'amber' }
            ].map(s => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card">
              <div className="text-sm font-semibold mb-4">📈 Weekly Signups</div>
              <div className="flex gap-1 items-end h-24 mb-3">
                {(stats?.weeklySignups?.length
                  ? stats.weeklySignups.map(w => ({ d: w._id, v: w.count }))
                  : [{ d: 'Mon', v: 45 }, { d: 'Tue', v: 62 }, { d: 'Wed', v: 38 }, { d: 'Thu', v: 75 }, { d: 'Fri', v: 58 }, { d: 'Sat', v: 30 }, { d: 'Sun', v: 22 }]
                ).map((w, i) => {
                  const max = 80;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-accent rounded-t-sm" style={{ height: `${(w.v / max) * 80}px` }} />
                      <span className="text-[9px] text-muted">{String(w.d).slice(-3)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[{ l: 'New Users', v: stats?.newUsersMonth || 234, c: 'text-emerald-400' }, { l: 'Tests Taken', v: '1,892', c: 'text-cyan-400' }, { l: 'AI Queries', v: '5,432', c: 'text-accent' }, { l: 'Revenue', v: '₹84K', c: 'text-amber-400' }].map(m => (
                  <div key={m.l} className="bg-surface3 rounded-lg p-2 text-center">
                    <div className={`text-sm font-bold ${m.c}`}>{m.v}</div>
                    <div className="text-[10px] text-muted">{m.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="text-sm font-semibold mb-4">🔧 Quick Actions</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: 'Add Question', icon: '➕', tab: 'questions' },
                  { l: 'Create Test', icon: '📝', tab: 'tests' },
                  { l: 'Manage Users', icon: '👥', tab: 'users' },
                  { l: 'View Reports', icon: '📊', tab: 'overview' }
                ].map(a => (
                  <button key={a.l} onClick={() => setTab(a.tab)} className="p-4 bg-surface3 hover:bg-surface3 border border-surface rounded-xl text-left transition-all">
                    <div className="text-2xl mb-1.5">{a.icon}</div>
                    <div className="text-sm font-medium">{a.l}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input className="input flex-1 max-w-sm" placeholder="🔍 Search users by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
          </div>
          <div className="card p-0 overflow-hidden">
            {usersLoading ? (
              <div className="flex justify-center py-12"><LoadingSpinner size={24} /></div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-surface3 border-b border-surface">
                    {['User', 'Level/XP', 'Plan', 'Problems', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(usersData?.users?.length ? usersData.users : SAMPLE_ADMIN_USERS).map((u, i) => (
                    <tr key={i} className="border-t border-surface hover:bg-surface3">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {u.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{u.name}</div>
                            <div className="text-xs text-muted">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">Lv.{u.level || 1}</div>
                        <div className="text-xs text-muted">{(u.xp || 0).toLocaleString()} XP</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.subscription?.plan === 'pro' ? 'bg-accent/20 text-accent border border-accent/30' :
                          u.subscription?.plan === 'enterprise' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-surface3 text-muted border border-surface'
                        }`}>{u.subscription?.plan || 'free'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary">{u.problemStats?.solved || 0}</td>
                      <td className="px-4 py-3 text-xs text-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="text-xs px-2 py-1 bg-surface3 rounded hover:bg-dark-border transition-colors">Edit</button>
                          <button className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors">Ban</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AddQuestionForm onSuccess={() => qc.invalidateQueries(['problems'])} />
          <div className="card">
            <div className="text-sm font-semibold mb-4">📋 Recent Questions</div>
            <div className="space-y-2">
              {[
                { t: 'Two Sum', d: 'easy', c: 'DSA' },
                { t: 'Time & Work Problem', d: 'medium', c: 'Aptitude' },
                { t: 'Explain Deadlocks in OS', d: 'medium', c: 'CS Fundamentals' },
                { t: 'LCA of Binary Tree', d: 'medium', c: 'DSA' },
                { t: 'SQL Join Types', d: 'easy', c: 'DBMS' }
              ].map((q, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-surface3 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{q.t}</div>
                    <div className="text-xs text-muted">{q.c}</div>
                  </div>
                  <span className={`tag-${q.d} text-[10px]`}>{q.d}</span>
                  <div className="flex gap-1">
                    <button className="text-[10px] px-2 py-1 bg-surface3 rounded text-secondary hover:text-primary">Edit</button>
                    <button className="text-[10px] px-2 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20">Del</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'tests' && (
        <div className="card">
          <div className="text-sm font-semibold mb-4">📝 Manage Tests</div>
          <div className="space-y-3">
            {[
              { t: 'DSA Sprint — Arrays', q: 20, dur: 45, pub: true },
              { t: 'Aptitude Challenge', q: 30, dur: 60, pub: true },
              { t: 'CS Fundamentals', q: 25, dur: 50, pub: false }
            ].map((test, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-surface3 rounded-xl">
                <div className="flex-1">
                  <div className="text-sm font-semibold">{test.t}</div>
                  <div className="text-xs text-muted mt-0.5">{test.q} questions · {test.dur} min</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${test.pub ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-muted'}`}>
                  {test.pub ? 'Published' : 'Draft'}
                </span>
                <div className="flex gap-1">
                  <button className="btn-outline text-xs py-1 px-2">Edit</button>
                  <button className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary mt-4 text-xs">+ Create New Test</button>
        </div>
      )}
    </div>
  );
}

const SAMPLE_ADMIN_USERS = [
  { name: 'Rahul Sharma', email: 'rahul@example.com', level: 18, xp: 12840, subscription: { plan: 'pro' }, problemStats: { solved: 450 } },
  { name: 'Priya Patel', email: 'priya@example.com', level: 16, xp: 11200, subscription: { plan: 'pro' }, problemStats: { solved: 380 } },
  { name: 'Arjun Kumar', email: 'arjun@example.com', level: 12, xp: 4820, subscription: { plan: 'free' }, problemStats: { solved: 312 } },
  { name: 'Sanya Gupta', email: 'sanya@example.com', level: 11, xp: 4600, subscription: { plan: 'free' }, problemStats: { solved: 287 } }
];
