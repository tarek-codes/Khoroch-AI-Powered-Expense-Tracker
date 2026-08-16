'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  EnvelopeSimple,
  ShieldCheck,
  CalendarBlank,
  Wallet,
  Receipt,
  ArrowLeft,
  CheckCircle,
  CurrencyDollar,
  Sparkle,
  SignOut,
} from '@phosphor-icons/react';
import { Sidebar } from '@/components/Sidebar';
import { useAppStore } from '@/store/appStore';
import { translations, formatMoney } from '@/lib/i18n';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, locale, logout } = useAppStore();
  const t = translations[locale];
  const [stats, setStats] = useState<{
    totalSpent: number;
    transactionCount: number;
    budget: number;
  }>({
    totalSpent: 0,
    transactionCount: 0,
    budget: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfileStats = async () => {
      try {
        const [dashRes, expRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/expenses?limit=1'),
        ]);

        const dashboardData = dashRes.data?.data || dashRes.data || {};
        const expensesData = expRes.data?.data || expRes.data || {};

        setStats({
          totalSpent: dashboardData.budget?.totalSpent || 0,
          budget: dashboardData.budget?.startingBalance || 0,
          transactionCount: expensesData.total || 0,
        });
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStats();
  }, [token, router]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const initial = user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div
      className="min-h-screen flex transition-colors duration-150"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-6 lg:p-8 space-y-6 max-w-[1200px] w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-xl border transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                title="Back to Dashboard"
              >
                <ArrowLeft size={18} weight="bold" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'ব্যবহারকারী প্রোফাইল' : 'User Profile'}
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {locale === 'bn' ? 'আপনার ব্যক্তিগত অ্যাকাউন্ট ও সার্বিক বিবরণ' : 'Manage your personal account and overview details'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              style={{
                backgroundColor: 'var(--destructive-subtle)',
                color: 'var(--destructive)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <SignOut size={16} weight="bold" />
              <span>{t.logout}</span>
            </button>
          </div>

          {/* Profile Overview Hero Card */}
          <div className="surface-card p-6 lg:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Large Avatar Placeholder */}
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center font-extrabold text-4xl shadow-md shrink-0 select-none"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                }}
              >
                {initial}
              </div>

              {/* Identity & Badges */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 justify-center sm:justify-start">
                  <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {fullName}
                  </h2>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold self-center sm:self-auto capitalize"
                    style={{
                      backgroundColor: 'var(--accent-subtle)',
                      color: 'var(--accent)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <ShieldCheck size={14} weight="bold" />
                    <span>{user.role || 'Member'}</span>
                  </span>
                </div>

                <p className="text-xs font-medium flex items-center justify-center sm:justify-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <EnvelopeSimple size={15} />
                  <span>{user.email || 'No email provided'}</span>
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-2 pt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle size={14} weight="fill" style={{ color: 'var(--success)' }} />
                    <span>Account Active</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Sparkle size={14} weight="bold" style={{ color: 'var(--accent)' }} />
                    <span>AI Engine Enabled</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details & Financial Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Information Card */}
            <div className="surface-card p-6 space-y-4">
              <h3 className="text-sm font-bold tracking-tight pb-2 border-b" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                Account Information
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>First Name</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{user.firstName || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Last Name</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{user.lastName || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Email Address</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{user.email || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Preferred Currency</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{user.preferredCurrency || 'BDT (৳)'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>System Role</span>
                  <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--accent)' }}>{user.role || 'User'}</span>
                </div>
              </div>
            </div>

            {/* Financial Activity Card */}
            <div className="surface-card p-6 space-y-4">
              <h3 className="text-sm font-bold tracking-tight pb-2 border-b" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                Financial Overview
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-surface-sunken)' }}>
                  <div className="flex items-center gap-2 mb-1.5" style={{ color: 'var(--accent)' }}>
                    <CalendarBlank size={16} weight="bold" />
                    <span className="text-[11px] font-bold uppercase">Total Tracked</span>
                  </div>
                  <p className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                    {formatMoney(stats.totalSpent, locale)}
                  </p>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-surface-sunken)' }}>
                  <div className="flex items-center gap-2 mb-1.5" style={{ color: 'var(--success)' }}>
                    <Wallet size={16} weight="bold" />
                    <span className="text-[11px] font-bold uppercase">Active Budget</span>
                  </div>
                  <p className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                    {formatMoney(stats.budget, locale)}
                  </p>
                </div>

                <div className="p-4 rounded-xl sm:col-span-2" style={{ backgroundColor: 'var(--bg-surface-sunken)' }}>
                  <div className="flex items-center gap-2 mb-1.5" style={{ color: 'var(--info)' }}>
                    <Receipt size={16} weight="bold" />
                    <span className="text-[11px] font-bold uppercase">Recorded Transactions</span>
                  </div>
                  <p className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                    {stats.transactionCount} entries recorded
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
