import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { problemAPI } from '@/services/api';
import { DifficultyTag, LoadingSpinner, CodeBlock } from '@/components/common/UI';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function ProblemDetail() {
  const refreshUser = useAuthStore(state => state.refreshUser);
  const { slug } = useParams();
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['problem', slug],
    queryFn: () => problemAPI.getOne(slug).then(r => r.data)
  });

  const problem = data?.problem;

  const handleSubmit = async () => {
    if (!selectedAnswer) { toast.error('Please select an answer'); return; }
    setSubmitting(true);
    try {
  await problemAPI.submit(problem._id, { selectedAnswer });

  await refreshUser();

  setRevealed(true);
} catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size={32} /></div>;
  if (!problem) return <div className="p-6 text-secondary">Problem not found.</div>;

  return (
    <div className="p-6 fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4 text-xs text-muted">
        <Link to="/dsa" className="hover:text-accent">DSA</Link>
        <span>/</span>
        <span className="capitalize">{problem.topic?.replace(/-/g,' ')}</span>
        <span>/</span>
        <span className="text-secondary">{problem.title}</span>
      </div>

      <div className="card mb-4">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold flex-1">{problem.title}</h1>
          <DifficultyTag difficulty={problem.difficulty} />
          {problem.isSolved && <span className="text-emerald-400 text-sm">✅ Solved</span>}
        </div>
        <div className="text-sm text-secondary leading-relaxed mb-4">{problem.description}</div>

        {problem.examples?.map((ex, i) => (
          <div key={i} className="bg-surface3 rounded-xl p-3 mb-3">
            <div className="text-xs font-semibold text-muted mb-2">Example {i + 1}</div>
            <div className="font-mono text-xs space-y-1">
              <div><span className="text-muted">Input:</span> <span className="text-primary">{ex.input}</span></div>
              <div><span className="text-muted">Output:</span> <span className="text-primary">{ex.output}</span></div>
              {ex.explanation && <div><span className="text-muted">Explanation:</span> <span className="text-secondary">{ex.explanation}</span></div>}
            </div>
          </div>
        ))}

        {problem.constraints?.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-muted mb-2">Constraints</div>
            {problem.constraints.map((c, i) => <div key={i} className="font-mono text-xs text-secondary">• {c}</div>)}
          </div>
        )}

        {problem.companies?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {problem.companies.map(c => <span key={c} className="bg-surface3 text-secondary text-xs px-2 py-0.5 rounded">{c}</span>)}
          </div>
        )}
      </div>

      {problem.type === 'mcq' && (
        <div className="card mb-4">
          <div className="text-sm font-semibold mb-4">Select your answer:</div>
          <div className="space-y-2 mb-4">
            {problem.options?.map(opt => {
              let cls = 'border-surface text-secondary hover:border-accent/40';
              if (revealed) {
                if (opt.label === problem.correctAnswer) cls = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
                else if (opt.label === selectedAnswer) cls = 'border-red-500/50 bg-red-500/10 text-red-400';
              } else if (opt.label === selectedAnswer) cls = 'border-accent bg-accent/10 text-accent';
              return (
                <div key={opt.label} onClick={() => !revealed && setSelectedAnswer(opt.label)}
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all text-sm ${cls}`}>
                  <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">{opt.label}</span>
                  {opt.text}
                </div>
              );
            })}
          </div>
          {revealed && problem.explanation && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-4">
              <div className="text-xs font-semibold text-emerald-400 mb-2">✅ Explanation</div>
              <div className="text-sm text-secondary">{problem.explanation}</div>
            </div>
          )}
          <div className="flex gap-2">
            {!revealed && <button onClick={handleSubmit} disabled={submitting || !selectedAnswer} className="btn-primary disabled:opacity-40">{submitting ? <LoadingSpinner size={14} /> : 'Submit Answer'}</button>}
            <Link to="/ai-tutor" className="btn-outline text-sm">🤖 Get AI Explanation</Link>
          </div>
        </div>
      )}

      {problem.hints?.length > 0 && (
        <div className="card">
          <div className="text-sm font-semibold mb-3">💡 Hints</div>
          {problem.hints.map((h, i) => (
            <details key={i} className="mb-2">
              <summary className="text-sm cursor-pointer text-accent">Hint {i + 1}</summary>
              <div className="text-sm text-secondary mt-2 ml-2">{h}</div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
