import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
  root.classList.remove('light', 'dark');
  root.classList.add(effectiveTheme);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggleTheme: () =>
        set((state) => {
          const currentEffectiveTheme =
            state.theme === 'system' ? getSystemTheme() : state.theme;
          const newTheme = currentEffectiveTheme === 'light' ? 'dark' : 'light';
          applyTheme(newTheme);
          return { theme: newTheme };
        }),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        }
      },
    }
  )
);

// Initialize theme on app start
if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('theme-storage');
  if (storedTheme) {
    try {
      const parsed = JSON.parse(storedTheme);
      applyTheme(parsed.state?.theme || 'light');
    } catch {
      applyTheme('light');
    }
  }
}
