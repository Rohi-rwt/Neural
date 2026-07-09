 import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Sun, Moon, Zap, Flame, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/ai-tutor': 'AI Tutor',
  '/dsa': 'DSA Practice',
  '/aptitude': 'Aptitude',
  '/fundamentals': 'CS Fundamentals',
  '/visualizer': 'DSA Visualizer',
  '/tests': 'Mock Tests',
  '/interview': 'Interview Prep',
  '/ai-interviewer': '🤖 AI Interviewer',
  '/roadmap': 'Learning Roadmap',
  '/progress': 'My Progress',
  '/leaderboard': 'Leaderboard',
  '/admin': 'Admin Panel',
  '/subscription': 'Upgrade to Pro'
};

export default function Topbar() {
  const { user, logout } = useAuthStore();

  const {
    theme,
    toggleTheme,
    toggleSidebar
  } = useUIStore();

  const location = useLocation();

  const pageKey =
    Object.keys(PAGE_TITLES).find(k => location.pathname.startsWith(k)) || '';

  const title = PAGE_TITLES[pageKey] || 'NeuralPath';

  return (
    <header className="topbar px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40">

      {/* Left */}
      <div className="flex items-center">

        {/* Mobile Menu */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden mr-3"
        >
          <Menu size={22} />
        </button>

        <div
          className="text-base font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </div>

      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Streak - Desktop Only */}
        <div className="hidden md:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-full text-xs text-amber-500 font-medium">
          <Flame size={13} />
          {user?.streak || 0}-day streak
        </div>

        {/* XP - Tablet/Desktop */}
        <div className="hidden sm:flex items-center gap-1.5 bg-accent/10 border border-accent/25 px-3 py-1.5 rounded-full text-xs text-accent font-medium">
          <Zap size={13} />
          {(user?.xp || 0).toLocaleString()} XP
        </div>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
          title={theme === 'dark'
            ? 'Switch to Light Mode'
            : 'Switch to Dark Mode'}
        >
          {theme === 'dark'
            ? <Sun size={16} />
            : <Moon size={16} />}
        </button>

        {/* Notification */}
        <button
          className="p-2 rounded-lg transition-colors relative flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Desktop Only */}
        <Link
          to="/tests"
          className="btn-primary text-xs py-1.5 px-3 hidden lg:flex"
        >
          📝 Take Test
        </Link>

        {/* Avatar */}
        <div className="relative group">
          <button className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
          </button>

          <div
            className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)'
            }}
          >
            <div
              className="p-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {user?.name}
              </div>

              <div
                className="text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                {user?.email}
              </div>
            </div>

            <div className="p-2">

              <Link
                to="/progress"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                📊 My Progress
              </Link>

              <Link
                to="/subscription"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                ⭐ Upgrade to Pro
              </Link>

              <button
                onClick={logout}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400"
              >
                🚪 Logout
              </button>

            </div>
          </div>

        </div>

      </div>

    </header>
  );
}