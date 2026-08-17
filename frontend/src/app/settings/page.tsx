'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Gear,
  Moon,
  Sun,
  Globe,
  SignOut,
  Bell,
  LockKey,
  ShieldCheck,
  User,
  Sliders,
  Sparkle,
  Wallet,
  ArrowCounterClockwise,
  Check,
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useAppStore, ThemeMode } from '@/store/appStore';
import { translations, Locale } from '@/lib/i18n';
import { Sidebar } from '@/components/Sidebar';
import { HeaderControls } from '@/components/HeaderControls';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isHydrated, locale, setLocale, theme, setTheme, toggleTheme, logout, fontFamily, setFontFamily } = useAppStore();
  const t = translations[locale];

  // Settings states
  const [voiceAutoSubmit, setVoiceAutoSubmit] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [monthlyAlerts, setMonthlyAlerts] = useState(true);
  const [currency, setCurrency] = useState('BDT (৳)');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, isHydrated]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error(locale === 'bn' ? 'বর্তমান ও নতুন পাসওয়ার্ড দিন' : 'Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(locale === 'bn' ? 'পাসওয়ার্ড দুটি মিলছে না' : 'Passwords do not match');
      return;
    }

    try {
      setChangingPass(true);
      await api.patch('/users/me/password', {
        currentPassword,
        newPassword,
      });
      toast.success(locale === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে' : 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setChangingPass(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex transition-colors duration-150"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-6 lg:p-8 space-y-6 max-w-[1200px] w-full mx-auto dashboard-scaled-text">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  <Gear size={22} weight="bold" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {t.settings || 'Settings & Preferences'}
                </h1>
              </div>
              <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
                {locale === 'bn'
                  ? 'ভাষা, থিম, নিরাপত্তা, এআই ভয়েস পছন্দ ও অ্যাকাউন্ট নিয়ন্ত্রণ করুন'
                  : 'Customize language, appearance, security, AI options, and system preferences'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <HeaderControls />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Appearance & Localization */}
            <div
              className="p-6 rounded-2xl border shadow-xs space-y-5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <Sun size={20} weight="bold" className="text-amber-500" />
                <h2 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'ভাষা ও ডিসপ্লে মোড' : 'Appearance & Localization'}
                </h2>
              </div>

              {/* Language Selector */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'bn' ? 'সিস্টেমের ভাষা' : 'App Language'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    {locale === 'bn' ? 'বাংলা এবং ইংরেজি মোড' : 'Choose Bangla or English'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                  <button
                    onClick={() => setLocale('en')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      locale === 'en'
                        ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLocale('bn')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      locale === 'bn'
                        ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              {/* Global Website Font Family Selection */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-extrabold text-xs" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'bn' ? 'ওয়েবসাইটের গ্লোবাল ফন্ট' : 'Website Font Family'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    {locale === 'bn'
                      ? 'সম্পূর্ণ ইন্টারফেসের জন্য পছন্দের টাইপোগ্রাফি ফন্ট নির্বাচন করুন'
                      : 'Globally change typography and typography style across the app'}
                  </p>
                </div>
                <select
                  value={fontFamily || 'jakarta'}
                  onChange={(e) => {
                    setFontFamily(e.target.value as any);
                    toast.success(locale === 'bn' ? 'ফন্ট পরিবর্তন সম্পন্ন হয়েছে' : 'Website font updated successfully');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold border outline-none shadow-2xs cursor-pointer min-w-[160px]"
                  style={{
                    backgroundColor: 'var(--bg-surface-sunken)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="jakarta">Plus Jakarta Sans (Modern SaaS)</option>
                  <option value="inter">Inter (Clean & Crisp)</option>
                  <option value="outfit">Outfit (Contemporary)</option>
                  <option value="poppins">Poppins (Geometric & Warm)</option>
                  <option value="roboto">Roboto (Classic Tech)</option>
                  <option value="geist">Geist Mono (Developer Mono)</option>
                </select>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'bn' ? 'থিম ও ইন্টারফেস কালার' : 'Theme Mode'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    {locale === 'bn' ? 'ডার্ক বা লাইট মোড সিলেক্ট করুন' : 'Switch between Dark and Light visuals'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white text-emerald-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Sun size={14} weight="bold" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-zinc-900 text-emerald-400 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    <Moon size={14} weight="bold" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Default Currency */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'bn' ? 'ডিফল্ট কারেন্সি' : 'Default Currency'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    {locale === 'bn' ? 'বাংলাদেশি টাকা (৳)' : 'Bangladeshi Taka (BDT)'}
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-xl font-black text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  BDT (৳)
                </span>
              </div>
            </div>

            {/* 2. AI Voice & Preferences */}
            <div
              className="p-6 rounded-2xl border shadow-xs space-y-5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <Sparkle size={20} weight="bold" className="text-purple-500" />
                <h2 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'এআই ও অটোমেশন পছন্দ' : 'AI & Smart Features'}
                </h2>
              </div>

              {/* Voice Auto Recognition */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'bn' ? 'ভয়েস এন্ট্রি অটো-পার্স' : 'Voice Auto-Extraction'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    {locale === 'bn' ? 'কথা বলা শেষ হলে স্বয়ংক্রিয় খরচ বিশ্লেষণ' : 'Extract expenses upon speech pause'}
                  </p>
                </div>
                <button
                  onClick={() => setVoiceAutoSubmit(!voiceAutoSubmit)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    voiceAutoSubmit ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      voiceAutoSubmit ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Budget Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'bn' ? 'বাজেট সতর্কতা নোটিফিকেশন' : 'Smart Budget Alerts'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    {locale === 'bn' ? 'বাজেটের ৮০% খরচ হলে সতর্ক বার্তা' : 'Notify when approaching budget limit'}
                  </p>
                </div>
                <button
                  onClick={() => setMonthlyAlerts(!monthlyAlerts)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    monthlyAlerts ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      monthlyAlerts ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Multimodal OCR Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'bn' ? 'রসিদ স্ক্যানার মডেল' : 'Receipt OCR Model'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    {locale === 'bn' ? 'Gemini 3.7 Flash ও Groq LLaMA' : 'Google Gemini 3.7 Flash Multimodal'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Online
                </span>
              </div>
            </div>

            {/* 3. Account Security */}
            <div
              className="p-6 rounded-2xl border shadow-xs space-y-4 md:col-span-2"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <LockKey size={20} weight="bold" className="text-emerald-500" />
                <h2 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'নিরাপত্তা ও পাসওয়ার্ড পরিবর্তন' : 'Account Security & Password'}
                </h2>
              </div>

              <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none shadow-2xs"
                    style={{
                      backgroundColor: 'var(--bg-surface-sunken)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none shadow-2xs"
                    style={{
                      backgroundColor: 'var(--bg-surface-sunken)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'bn' ? 'কনফার্ম পাসওয়ার্ড' : 'Confirm New Password'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none shadow-2xs"
                    style={{
                      backgroundColor: 'var(--bg-surface-sunken)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={changingPass}
                    className="btn-accent px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} weight="bold" />
                    <span>{changingPass ? '...' : locale === 'bn' ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 4. Danger Zone & Sign Out */}
            <div
              className="p-6 rounded-2xl border shadow-xs space-y-4 md:col-span-2"
              style={{
                backgroundColor: 'var(--destructive-subtle)',
                borderColor: 'rgba(239, 68, 68, 0.25)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <SignOut size={20} weight="bold" />
                    <span>{locale === 'bn' ? 'অ্যাকাউন্ট থেকে লগআউট' : 'Sign Out of Account'}</span>
                  </h3>
                  <p className="text-xs text-rose-500/80 font-semibold mt-1">
                    {locale === 'bn'
                      ? 'ডিভাইস থেকে সুরক্ষিতভাবে লগআউট করতে নিচের বাটনে চাপ দিন'
                      : 'Safely sign out of your current session on this device'}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 rounded-xl text-xs font-black transition-all bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <SignOut size={16} weight="bold" />
                  <span>{t.logout || 'Sign Out'}</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
