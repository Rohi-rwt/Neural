import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUIStore } from '@/store/uiStore';

export default function Layout() {
  const { sidebarOpen, initTheme } = useUIStore();

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '240px' : '64px' }}
      >
        <Topbar />
        <main className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
