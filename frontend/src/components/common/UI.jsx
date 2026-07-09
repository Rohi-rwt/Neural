import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function StatCard({ label, value, change, color = 'accent', icon, progress }) {
  const colors = {
    accent: { text: 'text-accent', bar: 'from-accent to-accent-3', bg: 'bg-accent/10' },
    green: { text: 'text-emerald-400', bar: 'from-emerald-500 to-emerald-400', bg: 'bg-emerald-500/10' },
    amber: { text: 'text-amber-400', bar: 'from-amber-500 to-amber-400', bg: 'bg-amber-500/10' },
    cyan: { text: 'text-cyan-400', bar: 'from-cyan-500 to-cyan-400', bg: 'bg-cyan-500/10' },
    red: { text: 'text-red-400', bar: 'from-red-500 to-red-400', bg: 'bg-red-500/10' }
  };
  const c = colors[color] || colors.accent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-xs text-muted font-medium">{label}</div>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${c.text}`}>{value}</div>
      {change && <div className="text-xs text-emerald-400 mt-1">{change}</div>}
      {progress !== undefined && (
        <div className="progress-bar mt-3">
          <div
            className={`h-full bg-gradient-to-r ${c.bar} rounded-full transition-all duration-700`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

export function DifficultyTag({ difficulty }) {
  return (
    <span className={`tag-${difficulty}`}>
      {difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1)}
    </span>
  );
}

export function LoadingSpinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-accent ${className}`} />;
}

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-base font-semibold mb-1">{title}</div>
      <div className="text-sm text-muted mb-4">{description}</div>
      {action}
    </div>
  );
}

export function Badge({ badge }) {
  return (
    <div className={`text-center p-3 rounded-xl border transition-all ${
      badge.earned
        ? 'border-amber-500/40 bg-amber-500/5'
        : 'border-surface opacity-40'
    }`}>
      <div className="text-2xl mb-1">{badge.icon}</div>
      <div className="text-xs font-semibold">{badge.name}</div>
      <div className="text-[10px] text-muted">{badge.desc}</div>
      {badge.earned && (
        <div className="text-[10px] text-amber-400 mt-1 font-medium">✓ Earned</div>
      )}
    </div>
  );
}

export function ProgressBar({ value, max = 100, color = 'accent', className = '' }) {
  const pct = Math.min(100, (value / max) * 100);
  const bars = {
    accent: 'from-accent to-accent-3',
    green: 'from-emerald-500 to-emerald-400',
    amber: 'from-amber-500 to-amber-400',
    cyan: 'from-cyan-500 to-cyan-400',
    red: 'from-red-500 to-red-400'
  };
  return (
    <div className={`progress-bar ${className}`}>
      <div
        className={`h-full bg-gradient-to-r ${bars[color] || bars.accent} rounded-full transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function CodeBlock({ code, language = 'javascript' }) {
  return (
    <div className="code-block text-sm">
      <pre className="text-primary whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-0 bg-surface3 border border-surface rounded-xl p-1 w-fit mb-5">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            active === tab.id
              ? 'bg-accent text-white'
              : 'text-secondary hover:text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
