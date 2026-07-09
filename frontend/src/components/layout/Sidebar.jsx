import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import {
  Home, Bot, TreePine, Calculator, Monitor, Palette,
  ClipboardList, Briefcase, Map, BarChart3, Trophy,
  Settings, ChevronLeft, ChevronRight, Crown, Video
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: Home, label: 'Dashboard' },
      { to: '/ai-tutor', icon: Bot, label: 'AI Tutor', badge: 'AI' }
    ]
  },
  {
    label: 'Learn',
    items: [
      { to: '/dsa', icon: TreePine, label: 'DSA Practice' },
      { to: '/aptitude', icon: Calculator, label: 'Aptitude' },
      { to: '/fundamentals', icon: Monitor, label: 'CS Fundamentals' },
      { to: '/visualizer', icon: Palette, label: 'DSA Visualizer' }
    ]
  },
  {
    label: 'Prepare',
    items: [
      { to: '/tests', icon: ClipboardList, label: 'Mock Tests' },
      { to: '/interview', icon: Briefcase, label: 'Interview Prep' },
      { to: '/ai-interviewer', icon: Video, label: 'AI Interviewer', badge: 'NEW' },
      { to: '/roadmap', icon: Map, label: 'Roadmap' }
    ]
  },
  {
    label: 'Profile',
    items: [
      { to: '/progress', icon: BarChart3, label: 'My Progress' },
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
      { to: '/subscription', icon: Crown, label: 'Upgrade Pro' },
      { to: '/admin', icon: Settings, label: 'Admin Panel', adminOnly: true }
    ]
  }
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const xpThresholds = [0, 500, 1200, 2500, 4500, 7500, 12000, 18000, 27000, 40000];
  const currentLevelXP = xpThresholds[Math.min((user?.level || 1) - 1, xpThresholds.length - 1)];
  const nextLevelXP = xpThresholds[Math.min(user?.level || 1, xpThresholds.length - 1)];
  const xpPct = nextLevelXP > currentLevelXP
    ? Math.round(((user?.xp || 0) - currentLevelXP) / (nextLevelXP - currentLevelXP) * 100)
    : 100;

  return (
   <motion.aside
animate={{
  width: window.innerWidth >= 1024
    ? (sidebarOpen ? 240 : 64)
    : 240
}}
className={`
sidebar fixed left-0 top-0 h-screen z-50
flex flex-col overflow-hidden
transition-transform duration-300
${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
lg:translate-x-0
`}
>
      {/* Logo */}
      <div className="p-4 flex items-center justify-between min-h-[64px]" style={{ borderBottom: '1px solid var(--border)' }}>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-gradient text-lg font-bold">⚡ NeuralPath</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>AI Learning Platform</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg transition-colors flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="mb-4">
            {sidebarOpen && (
              <div className="text-[10px] uppercase tracking-widest font-semibold px-2 mb-1" style={{ color: 'var(--text-muted)' }}>
                {section.label}
              </div>
            )}
            {section.items.map(item => {
              if (item.adminOnly && user?.role !== 'admin') return null;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 sidebar-item${isActive ? ' active' : ''}`
                  }
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon size={16} className="flex-shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap flex-1"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {sidebarOpen && item.badge && (
                    <span className="bg-accent text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Lv.{user?.level || 1} · {user?.xp || 0} XP</div>
                <div className="progress-bar mt-1">
                  <div className="h-full bg-gradient-to-r from-accent to-cyan-500 rounded-full transition-all" style={{ width: `${xpPct}%` }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
