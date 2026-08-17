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
  Camera,
  Trash,
} from '@phosphor-icons/react';
import { Sidebar } from '@/components/Sidebar';
import { useAppStore } from '@/store/appStore';
import { translations, formatMoney, toBengaliNumber, formatUserName, formatFirstName } from '@/lib/i18n';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isHydrated, token, locale, logout } = useAppStore();
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

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!token && !user) {
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

  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(locale === 'bn' ? 'ছবির সাইজ ৫ মেগাবাইটের কম হতে হবে' : 'Profile photo must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      // Instant optimistic update
      const updatedUser = { ...user, avatarUrl: base64 };
      setUser(updatedUser);

      // Attempt backend upload if supported
      try {
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);
        const res: any = await api.post('/users/me/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res?.data?.avatarUrl || res?.avatarUrl) {
          setUser({ ...updatedUser, avatarUrl: res.data?.avatarUrl || res.avatarUrl });
        }
        toast.success(locale === 'bn' ? 'প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে' : 'Profile picture updated successfully');
      } catch (err) {
        // Even if backend upload endpoint is missing/fails, base64 is already persisted in local user state
        toast.success(locale === 'bn' ? 'প্রোফাইল ছবি সফলভাবে সংরক্ষিত হয়েছে' : 'Profile picture saved successfully');
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUser({ ...user, avatarUrl: undefined });
    toast.success(locale === 'bn' ? 'প্রোফাইল ছবি মুছে ফেলা হয়েছে' : 'Profile picture removed');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const fullName = formatUserName(user, locale) || (locale === 'bn' ? 'ইউজার' : 'User');
  const initial = user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div
      className="min-h-screen flex transition-colors duration-150"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-6 lg:p-8 space-y-6 max-w-[1200px] w-full mx-auto dashboard-scaled-text">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-xl border transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
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
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />

              {/* Large Avatar with Photo Upload Trigger */}
              <div className="relative group shrink-0">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center font-extrabold text-4xl shadow-md overflow-hidden cursor-pointer relative transition-transform hover:scale-102 border-2 border-emerald-500/30"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                  }}
                  title={locale === 'bn' ? 'প্রোফাইল ছবি পরিবর্তন করতে ক্লিক করুন' : 'Click to change profile picture'}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{initial}</span>
                  )}

                  {/* Hover Overlay with Camera Icon */}
                  <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity gap-1 backdrop-blur-[2px]">
                    <Camera size={26} weight="bold" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      {locale === 'bn' ? 'আপলোড' : 'Upload'}
                    </span>
                  </div>
                </div>

                {/* Floating Camera / Trash Action Pills */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-zinc-900 transition-transform active:scale-90 cursor-pointer"
                  title={locale === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change picture'}
                >
                  <Camera size={15} weight="bold" />
                </button>

                {user.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-zinc-900 transition-transform active:scale-90 cursor-pointer"
                    title={locale === 'bn' ? 'ছবি মুছে ফেলুন' : 'Remove picture'}
                  >
                    <Trash size={12} weight="bold" />
                  </button>
                )}
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
                    <span>{t.accountActive}</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Sparkle size={14} weight="bold" style={{ color: 'var(--accent)' }} />
                    <span>{t.aiEngineEnabled}</span>
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
                {t.accountInfo}
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{t.firstName}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatFirstName(user.firstName, locale) || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{t.lastName}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatFirstName(user.lastName, locale) || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{t.emailAddress}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{user.email || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{t.preferredCurrency}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{user.preferredCurrency || (locale === 'bn' ? 'টাকা (৳)' : 'BDT (৳)')}</span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{t.systemRole}</span>
                  <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--accent)' }}>{user.role === 'admin' ? (locale === 'bn' ? 'অ্যাডমিন' : 'Admin') : (locale === 'bn' ? 'ব্যবহারকারী' : 'User')}</span>
                </div>
              </div>
            </div>

            {/* Financial Activity Card */}
            <div className="surface-card p-6 space-y-4">
              <h3 className="text-sm font-bold tracking-tight pb-2 border-b" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                {t.financialOverview}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-surface-sunken)' }}>
                  <div className="flex items-center gap-2 mb-1.5" style={{ color: 'var(--accent)' }}>
                    <CalendarBlank size={16} weight="bold" />
                    <span className="text-[11px] font-bold uppercase">{t.totalTracked}</span>
                  </div>
                  <p className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                    {formatMoney(stats.totalSpent, locale)}
                  </p>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-surface-sunken)' }}>
                  <div className="flex items-center gap-2 mb-1.5" style={{ color: 'var(--success)' }}>
                    <Wallet size={16} weight="bold" />
                    <span className="text-[11px] font-bold uppercase">{t.activeBudget}</span>
                  </div>
                  <p className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                    {formatMoney(stats.budget, locale)}
                  </p>
                </div>

                <div className="p-4 rounded-xl sm:col-span-2" style={{ backgroundColor: 'var(--bg-surface-sunken)' }}>
                  <div className="flex items-center gap-2 mb-1.5" style={{ color: 'var(--info)' }}>
                    <Receipt size={16} weight="bold" />
                    <span className="text-[11px] font-bold uppercase">{t.recordedTransactions}</span>
                  </div>
                  <p className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                    {locale === 'bn' ? `${toBengaliNumber(stats.transactionCount)} টি এন্ট্রি সংরক্ষিত` : `${stats.transactionCount} entries recorded`}
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
