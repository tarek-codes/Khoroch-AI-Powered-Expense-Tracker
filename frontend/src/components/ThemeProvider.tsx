'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { Toaster } from 'sonner';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, setLocale, setUser, setFontFamily, setHydrated, fontFamily } = useAppStore();

  useEffect(() => {
    // Hydrate state from localStorage on client mount
    try {
      const storedTheme = localStorage.getItem('khoroch_theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setTheme(storedTheme);
      }
      const storedLocale = localStorage.getItem('khoroch_locale');
      if (storedLocale === 'en' || storedLocale === 'bn') {
        setLocale(storedLocale);
      }
      const storedFont = localStorage.getItem('khoroch_font');
      if (storedFont) {
        setFontFamily(storedFont as any);
      }
      const storedUser = localStorage.getItem('khoroch_user');
      const storedToken = localStorage.getItem('khoroch_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser), storedToken);
      }
    } catch (e) {
      // ignore
    } finally {
      setHydrated();
    }
  }, [setTheme, setLocale, setUser, setFontFamily, setHydrated]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (fontFamily) {
      document.documentElement.setAttribute('data-font', fontFamily);
    }
  }, [fontFamily]);

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        theme={theme}
        toastOptions={{
          style: {
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)',
          },
        }}
      />
      {children}
    </>
  );
}
