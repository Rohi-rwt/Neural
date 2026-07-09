import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Bot } from 'lucide-react';
import { problemAPI } from '@/services/api';
import { DifficultyTag, Tabs, LoadingSpinner, EmptyState } from '@/components/common/UI';

const TOPICS = [
  { id: '', label: 'All Topics' },
  { id: 'arrays', label: '📊 Arrays' },
  { id: 'strings', label: '🔤 Strings' },
  { id: 'linked-list', label: '🔗 Linked List' },
  { id: 'stack', label: '📚 Stack/Queue' },
  { id: 'trees', label: '🌳 Trees' },
  { id: 'graphs', label: '🕸️ Graphs' },
  { id: 'dynamic-programming', label: '🧩 DP' },
  { id: 'heap', label: '⛰️ Heaps' }
];

const DSA_TABS = [
  { id: 'problems', label: 'Problems' },
  { id: 'topics', label: 'Topics' },
  { id: 'blind75', label: 'Blind 75' }
];

export default function DSAPractice() {
  const [tab, setTab] = useState('problems');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['problems', { category: 'dsa', search, difficulty, topic, page }],
    queryFn: () => problemAPI.getAll({ category: 'dsa', search, difficulty, topic, page, limit: 20 }).then(r => r.data),
    keepPreviousData: true
  });

  const problems = data?.problems || [];

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">🌳 DSA Practice</h1>
          <p className="text-sm text-secondary mt-0.5">Master data structures & algorithms</p>
        </div>
        <Link to="/ai-tutor" className="btn-primary text-xs">
          <Bot size={13} /> Ask AI Tutor
        </Link>
      </div>

      <Tabs tabs={DSA_TABS} active={tab} onChange={setTab} />

      {tab === 'problems' && (
        <>
          {/* Filters */}
          <div className="flex gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="input pl-8 h-9"
                placeholder="Search problems..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="input h-9 w-36"
              value={difficulty}
              onChange={e => { setDifficulty(e.target.value); setPage(1); }}
            >
              <option value="">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              className="input h-9 w-44"
              value={topic}
              onChange={e => { setTopic(e.target.value); setPage(1); }}
            >
              {TOPICS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>

          {/* Stats row */}
          <div className="flex gap-2 mb-4">
            {[
              { l: 'Solved', v: '312', c: 'text-emerald-400' },
              { l: 'Easy', v: '142', c: 'text-emerald-400' },
              { l: 'Medium', v: '128', c: 'text-amber-400' },
              { l: 'Hard', v: '42', c: 'text-red-400' }
            ].map(s => (
              <div key={s.l} className="bg-surface3 border border-surface rounded-lg px-3 py-1.5 text-sm">
                <span className={`font-bold ${s.c}`}>{s.v}</span>
                <span className="text-muted ml-1 text-xs">{s.l}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card p-0 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><LoadingSpinner size={24} /></div>
            ) : problems.length === 0 ? (
              <EmptyState icon="🔍" title="No problems found" description="Try adjusting your filters" />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-surface3 border-b border-surface">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted w-12">#</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted">Problem</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted">Difficulty</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted hidden md:table-cell">Topic</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted hidden lg:table-cell">Acceptance</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted w-16">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Show DB results if available, otherwise fallback data */}
                  {(problems.length > 0 ? problems : FALLBACK_PROBLEMS).map((p, i) => (
                    <tr
                      key={p._id || i}
                      className="border-t border-surface hover:bg-surface3 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-xs text-muted">{(page - 1) * 20 + i + 1}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/dsa/${p.slug || p._id}`}
                          className="text-sm font-medium hover:text-accent transition-colors"
                        >
                          {p.title}
                        </Link>
                        {p.companies?.length > 0 && (
                          <div className="text-[10px] text-muted mt-0.5">{p.companies.slice(0,2).join(', ')}</div>
                        )}
                      </td>
                      <td className="px-4 py-3"><DifficultyTag difficulty={p.difficulty} /></td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="tag-accent text-[10px]">{p.topic?.replace(/-/g, ' ')}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted hidden lg:table-cell">
                        {p.stats?.acceptanceRate || Math.floor(Math.random() * 40 + 50)}%
                      </td>
                      <td className="px-4 py-3 text-base">{p.isSolved ? '✅' : '⬜'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {data?.pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline text-xs py-1.5 disabled:opacity-40">← Prev</button>
              <span className="text-sm text-secondary self-center">Page {page} of {data.pagination.pages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.pagination.pages} className="btn-outline text-xs py-1.5 disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}

      {tab === 'topics' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {TOPICS.filter(t => t.id).map(t => (
            <div
              key={t.id}
              onClick={() => { setTab('problems'); setTopic(t.id); }}
              className="card-sm cursor-pointer hover:border-accent/40 transition-all hover:-translate-y-1"
            >
              <div className="text-2xl mb-2">{t.label.split(' ')[0]}</div>
              <div className="text-sm font-semibold">{t.label.split(' ').slice(1).join(' ')}</div>
              <div className="text-xs text-muted mt-1">{Math.floor(Math.random() * 60 + 20)} problems</div>
              <div className="progress-bar mt-3">
                <div className="h-full bg-gradient-to-r from-accent to-accent-3 rounded-full" style={{ width: `${Math.floor(Math.random() * 60 + 20)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const FALLBACK_PROBLEMS = [
  { title: 'Two Sum', slug: 'two-sum', difficulty: 'easy', topic: 'arrays', companies: ['Google', 'Amazon'], stats: { acceptanceRate: 87 }, isSolved: true },
  { title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring', difficulty: 'medium', topic: 'strings', companies: ['Microsoft'], stats: { acceptanceRate: 72 } },
  { title: 'Median of Two Sorted Arrays', slug: 'median-two-arrays', difficulty: 'hard', topic: 'arrays', companies: ['Google'], stats: { acceptanceRate: 38 } },
  { title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'easy', topic: 'stack', stats: { acceptanceRate: 91 }, isSolved: true },
  { title: 'Binary Tree Level Order Traversal', slug: 'bfs-tree', difficulty: 'medium', topic: 'trees', stats: { acceptanceRate: 65 } },
  { title: 'Coin Change', slug: 'coin-change', difficulty: 'medium', topic: 'dynamic-programming', stats: { acceptanceRate: 58 } },
  { title: 'Number of Islands', slug: 'number-islands', difficulty: 'medium', topic: 'graphs', stats: { acceptanceRate: 61 }, isSolved: true },
  { title: 'Merge K Sorted Lists', slug: 'merge-k-lists', difficulty: 'hard', topic: 'heap', stats: { acceptanceRate: 45 } }
];
