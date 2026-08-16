import { create } from 'zustand';
import { Locale } from '@/lib/i18n';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  preferredCurrency: string;
  preferredLocale: string;
}

export type ThemeMode = 'dark' | 'light';

interface AppState {
  user: User | null;
  token: string | null;
  locale: Locale;
  theme: ThemeMode;
  setUser: (user: User | null, token?: string) => void;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  token: null,
  locale: 'en',
  theme: 'dark',
  setUser: (user, token) => {
    if (typeof window !== 'undefined') {
      if (user) localStorage.setItem('khoroch_user', JSON.stringify(user));
      else localStorage.removeItem('khoroch_user');
      if (token) localStorage.setItem('khoroch_token', token);
    }
    set((state) => ({ ...state, user, ...(token ? { token } : {}) }));
  },
  setLocale: (locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('khoroch_locale', locale);
    }
    set({ locale });
  },
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('khoroch_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('khoroch_token');
      localStorage.removeItem('khoroch_user');
    }
    set({ user: null, token: null });
  },
}));
