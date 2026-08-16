'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Label from '@radix-ui/react-label';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { HeaderControls } from '@/components/HeaderControls';
import { translations } from '@/lib/i18n';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, locale } = useAppStore();
  const t = translations[locale];

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res: any = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        preferredCurrency: 'BDT',
        preferredLocale: locale,
      });

      setUser(res.data.user, res.data.accessToken);
      toast.success('Registration successful! Welcome to Khoroch.');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
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
        <div className="text-center mb-6">
          <img
            src="/logo-smooth-rounded.svg"
            alt="খরচ"
            className="h-24 sm:h-28 w-auto object-contain mx-auto mb-2 transition-transform hover:scale-105"
          />
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Create an Account
          </h1>
          <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Start tracking your expenses with AI in seconds
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label.Root className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                First Name
              </Label.Root>
              <input
                type="text"
                required
                placeholder="Tarek"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-base w-full"
              />
            </div>
            <div>
              <Label.Root className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Last Name
              </Label.Root>
              <input
                type="text"
                required
                placeholder="Rahman"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-base w-full"
              />
            </div>
          </div>

          <div>
            <Label.Root className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email Address
            </Label.Root>
            <input
              type="email"
              required
              placeholder="user@example.com"
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
              minLength={6}
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
            {loading ? 'Creating account...' : t.register}
          </button>
        </form>

        <p className="text-center text-xs mt-6 font-medium" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-bold hover:underline" style={{ color: 'var(--accent)' }}>
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
