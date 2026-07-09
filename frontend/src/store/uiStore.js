import { create } from 'zustand';

// Persist helpers (manual, works with any zustand version)
const STORAGE_KEY = 'ui-store';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveState(partial) {
  try {
    const prev = loadState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { ...prev.state, ...partial } }));
  } catch {}
}

const saved = loadState()?.state || {};

export const useUIStore = create((set) => ({
  sidebarOpen: saved.sidebarOpen ?? true,
  theme: saved.theme ?? 'dark',
  activeModal: null,

  toggleSidebar: () => set(s => {
    saveState({ sidebarOpen: !s.sidebarOpen });
    return { sidebarOpen: !s.sidebarOpen };
  }),
  setSidebarOpen: (open) => set(() => {
    saveState({ sidebarOpen: open });
    return { sidebarOpen: open };
  }),
  toggleTheme: () => set(s => {
    const newTheme = s.theme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    saveState({ theme: newTheme });
    return { theme: newTheme };
  }),
  initTheme: () => set(s => {
    if (s.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    return s;
  }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null })
}));
