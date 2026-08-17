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
export type FontFamily = 'jakarta' | 'inter' | 'outfit' | 'poppins' | 'roboto' | 'geist';

interface AppState {
  user: User | null;
  token: string | null;
  locale: Locale;
  theme: ThemeMode;
  fontFamily: FontFamily;
  isHydrated: boolean;
  setUser: (user: User | null, token?: string) => void;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  setFontFamily: (font: FontFamily) => void;
  toggleTheme: () => void;
  setHydrated: () => void;
  logout: () => void;
}

// Initial state is always matching SSR (isHydrated: false) until useEffect fires on mount
const getInitialState = () => {
  return {
    user: null,
    token: null,
    locale: 'en' as Locale,
    theme: 'dark' as ThemeMode,
    fontFamily: 'jakarta' as FontFamily,
    isHydrated: false,
  };
};

const initial = getInitialState();

export const useAppStore = create<AppState>((set, get) => ({
  user: initial.user,
  token: initial.token,
  locale: initial.locale,
  theme: initial.theme,
  fontFamily: initial.fontFamily,
  isHydrated: initial.isHydrated,
  setHydrated: () => set({ isHydrated: true }),
  setUser: (user, token) => {
    if (typeof window !== 'undefined') {
      if (user) localStorage.setItem('khoroch_user', JSON.stringify(user));
      else localStorage.removeItem('khoroch_user');
      if (token) localStorage.setItem('khoroch_token', token);
      else if (!user) localStorage.removeItem('khoroch_token');
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
  setFontFamily: (fontFamily) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('khoroch_font', fontFamily);
      document.documentElement.setAttribute('data-font', fontFamily);
    }
    set({ fontFamily });
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
