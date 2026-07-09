// TestResult.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProgressBar } from '@/components/common/UI';

export function TestResult() {
  const { state } = useLocation();
  const result = state?.result || { score: { percentage: 75, obtained: 60, total: 80, grade: 'B' }, analysis: { correct: 15, wrong: 4, skipped: 1, weakTopics: ['Dynamic Programming'], strongTopics: ['Arrays'] }, xpEarned: 375 };

  const { score, analysis, xpEarned } = result;
  const pct = score?.percentage || 0;
  const grade = score?.grade || 'B';

  const gradeColor = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="p-6 fade-in max-w-3xl mx-auto">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card text-center mb-5">
        <div className="text-5xl mb-3">{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚'}</div>
        <div className={`text-5xl font-bold ${gradeColor} mb-1`}>{pct}%</div>
        <div className={`text-2xl font-bold ${gradeColor} mb-2`}>Grade: {grade}</div>
        <div className="text-secondary text-sm mb-4">{state?.test?.title || 'Mock Test'}</div>
        <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-full text-amber-400 text-sm font-semibold">
          ⚡ +{xpEarned} XP Earned
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[{ l: 'Correct', v: analysis?.correct || 0, c: 'text-emerald-400' }, { l: 'Wrong', v: analysis?.wrong || 0, c: 'text-red-400' }, { l: 'Skipped', v: analysis?.skipped || 0, c: 'text-secondary' }].map(s => (
          <div key={s.l} className="stat-card text-center">
            <div className={`text-3xl font-bold ${s.c}`}>{s.v}</div>
            <div className="text-xs text-muted mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {analysis?.weakTopics?.length > 0 && (
          <div className="card">
            <div className="text-sm font-semibold text-red-400 mb-3">⚠️ Weak Topics</div>
            {analysis.weakTopics.map(t => (
              <div key={t} className="p-2 bg-red-500/5 border border-red-500/15 rounded-lg mb-2 text-sm capitalize">{t.replace(/-/g,' ')}</div>
            ))}
          </div>
        )}
        {analysis?.strongTopics?.length > 0 && (
          <div className="card">
            <div className="text-sm font-semibold text-emerald-400 mb-3">✅ Strong Topics</div>
            {analysis.strongTopics.map(t => (
              <div key={t} className="p-2 bg-emerald-500/5 border border-emerald-500/15 rounded-lg mb-2 text-sm capitalize">{t.replace(/-/g,' ')}</div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link to="/tests" className="btn-outline flex-1 justify-center">← All Tests</Link>
        <Link to="/ai-tutor" className="btn-primary flex-1 justify-center">🤖 Review with AI</Link>
      </div>
    </div>
  );
}

export default TestResult;
