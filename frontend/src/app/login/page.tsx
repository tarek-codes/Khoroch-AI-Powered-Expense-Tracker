'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Label from '@radix-ui/react-label';
import { User, ShieldCheck } from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { HeaderControls } from '@/components/HeaderControls';
import { translations } from '@/lib/i18n';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { user, isHydrated, setUser, locale } = useAppStore();
  const t = translations[locale];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isHydrated && user) {
      router.push('/');
    }
  }, [user, isHydrated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res: any = await api.post('/auth/login', { email, password });
      setUser(res.data.user, res.data.accessToken);
      toast.success(res.message || 'Login successful!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'user' | 'admin') => {
    if (role === 'user') {
      setEmail('user@khoroch.app');
      setPassword('User123!');
    } else {
      setEmail('admin@khoroch.app');
      setPassword('Admin123!');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-150"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-10">
        <HeaderControls />
      </div>

      {/* Atmospheric Background Ambient Glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 blur-[100px] -top-32 -left-32"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none opacity-15 blur-[90px] -bottom-20 -right-20"
        style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-md surface-card p-8 sm:p-9 shadow-xl z-10">
        {/* Brand */}
        <div className="text-center mb-6">
          <img
            src="/logo-smooth-rounded.svg"
            alt="খরচ"
            className="h-24 sm:h-28 w-auto object-contain mx-auto mb-2 transition-transform hover:scale-105"
          />
          <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            AI-Powered Expense Tracker
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div
          className="mb-6 p-3.5 rounded-2xl"
          style={{ backgroundColor: 'var(--bg-surface-sunken)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="text-[10px] uppercase font-bold tracking-wider mb-2.5 text-center" style={{ color: 'var(--text-muted)' }}>
            Quick Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('user')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold btn-secondary"
            >
              <User size={14} weight="bold" />
              <span>Demo User</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold btn-secondary"
            >
              <ShieldCheck size={14} weight="bold" style={{ color: 'var(--accent)' }} />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label.Root className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email Address
            </Label.Root>
            <input
              type="email"
              required
              placeholder="user@khoroch.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base w-full"
            />
          </div>

          <div>
            <Label.Root className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Password
            </Label.Root>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 btn-accent py-2.5"
          >
            {loading ? 'Authenticating...' : t.login}
          </button>
        </form>

        <p className="text-center text-xs mt-6 font-medium" style={{ color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link href="/register" className="font-bold hover:underline" style={{ color: 'var(--accent)' }}>
            {t.register}
          </Link>
        </p>
      </div>
    </div>
  );
}
