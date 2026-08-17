'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Microphone,
  Receipt,
  Lightning,
  ArrowsLeftRight,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle,
  Clock,
  Wallet,
  LockKey,
  CaretDown,
  Check,
  Copy,
  Sparkle,
} from '@phosphor-icons/react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useAppStore } from '@/store/appStore';
import { translations, toBengaliNumber } from '@/lib/i18n';
import { VoiceModal } from '@/components/VoiceModal';
import { toast } from 'sonner';

export default function LandingPage() {
  const { user, isHydrated, locale, setLocale, theme, setTheme } = useAppStore();
  const t = translations[locale];

  const [activeVoiceDemo, setActiveVoiceDemo] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);

  const voiceDemos = [
    {
      label: 'Bangla',
      text: 'রিকশা ভাড়া ৫০ টাকা এবং কাঁচাবাজারে ৮৫০ টাকা বিকাশে দিলাম',
      items: [
        { name: 'Rickshaw', category: 'Transportation', amount: 50, method: 'Cash' },
        { name: 'Kacha Bazar', category: 'Groceries', amount: 850, method: 'bKash' },
      ],
    },
    {
      label: 'Benglish',
      text: 'Uber ride 250 taka and dinner 680 taka নগদে পরিশোধ করেছি',
      items: [
        { name: 'Uber Ride', category: 'Transportation', amount: 250, method: 'Card' },
        { name: 'Dinner', category: 'Food & Dining', amount: 680, method: 'Nagad' },
      ],
    },
    {
      label: 'English',
      text: 'Paid Dot Internet 1200 taka and ChatGPT subscription 2400 taka',
      items: [
        { name: 'Dot Internet', category: 'Utility Bills', amount: 1200, method: 'bKash' },
        { name: 'ChatGPT Plus', category: 'Subscriptions', amount: 2400, method: 'Card' },
      ],
    },
  ];

  const faqs = [
    {
      q: locale === 'bn' ? 'খরচ কীভাবে বাংলা ও ইংরেজি ভাষা বোঝে?' : 'How does Khoroch process bilingual voice inputs?',
      a: locale === 'bn'
        ? 'আমাদের সিস্টেম ব্রাউজার অডিও এবং গুগল জেমিনি এআই ব্যবহার করে বাংলা ও ইংরেজি মিশ্রিত বাক্য থেকে স্বয়ংক্রিয়ভাবে ক্যাটাগরি, মার্চেন্ট এবং টাকার পরিমাণ সনাক্ত করে।'
        : 'Khoroch uses Web Audio and Gemini AI to parse spoken Bangla, English, and everyday Benglish into categorized line items in under 300 milliseconds.',
    },
    {
      q: locale === 'bn' ? 'আমার আর্থিক ডেটা কতটা নিরাপদ?' : 'How secure is my financial data?',
      a: locale === 'bn'
        ? 'আপনার ডেটা নিজস্ব এনক্রিপ্টেড পোস্টগ্রেস ডেটাবেসে সংরক্ষিত থাকে। কোনো তৃতীয় পক্ষের কাছে তথ্য শেয়ার বা বিক্রি করা হয় না।'
        : 'All transactions are protected with stateless JWT authentication and stored in an isolated PostgreSQL database. We never sell user data.',
    },
    {
      q: locale === 'bn' ? 'কোন কোন পেমেন্ট মেথড সাপোর্ট করে?' : 'Which payment channels are supported?',
      a: locale === 'bn'
        ? 'বিকাশ, নগদ, রকেট, ব্যাংক কার্ড ও ক্যাশ ওয়ালেট সরাসরি সাপোর্ট করে।'
        : 'Native balance tracking is available for bKash, Nagad, Rocket, local Visa and Mastercard cards, and cash.',
    },
    {
      q: locale === 'bn' ? 'খরচ কি সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়?' : 'Is Khoroch completely free?',
      a: locale === 'bn'
        ? 'হ্যাঁ, ভয়েস এআই, রসিদ ওসিআর, ইউটিলিটি বিল ও ঋণ খাতা সহ প্রতিটি ফিচার সবার জন্য সম্পূর্ণ ফ্রি এবং ওপেন সোর্স।'
        : 'Yes. Voice tracking, receipt OCR, utility bill management, and debt ledgers are completely free and open source.',
    },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText('git clone https://github.com/tarek-codes/Khoroch-AI-Powered-Expense-Tracker.git');
    setCopiedInstall(true);
    toast.success(locale === 'bn' ? 'কমান্ড কপি হয়েছে' : 'Clone command copied');
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  return (
    <div
      className="min-h-screen transition-colors duration-150 relative selection:bg-emerald-600 selection:text-white"
      style={{
        backgroundColor: 'var(--bg-page)',
        color: 'var(--text-primary)',
      }}
    >
      {/* ─── Navigation Bar (Max 68px, single line desktop) ─── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(10, 15, 26, 0.85)' : 'rgba(255, 255, 255, 0.88)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo-smooth-rounded.svg" alt="খরচ" className="h-9 w-auto object-contain" />
            <span
              className="hidden sm:inline-block font-mono text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
              style={{
                borderColor: 'rgba(217, 119, 6, 0.35)',
                color: '#d97706',
                backgroundColor: 'rgba(217, 119, 6, 0.08)',
              }}
            >
              Fintech
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="#features" className="transition-colors hover:text-emerald-500" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn' ? 'ফিচারসমূহ' : 'Features'}
            </a>
            <a href="#voice" className="transition-colors hover:text-emerald-500" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn' ? 'ভয়েস এআই' : 'Voice AI'}
            </a>
            <a href="#security" className="transition-colors hover:text-emerald-500" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn' ? 'নিরাপত্তা' : 'Security'}
            </a>
            <a href="#faq" className="transition-colors hover:text-emerald-500" style={{ color: 'var(--text-secondary)' }}>
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Locale Switch */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:border-emerald-500/50 cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
              title="Toggle Language"
            >
              <Globe size={13} weight="bold" className="text-amber-500" />
              <span>{locale === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Theme Switch */}
            <ToggleGroup.Root
              type="single"
              value={theme}
              onValueChange={(val) => {
                if (val) setTheme(val as 'light' | 'dark');
              }}
              className="hidden sm:flex p-0.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <ToggleGroup.Item
                value="light"
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  theme === 'light' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-400'
                }`}
                title="Light Mode"
              >
                <Sun size={13} weight="bold" />
              </ToggleGroup.Item>
              <ToggleGroup.Item
                value="dark"
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  theme === 'dark' ? 'bg-zinc-800 text-amber-400 shadow-xs' : 'text-slate-400'
                }`}
                title="Dark Mode"
              >
                <Moon size={13} weight="bold" />
              </ToggleGroup.Item>
            </ToggleGroup.Root>

            {isHydrated && user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-transform active:scale-98 cursor-pointer"
                style={{
                  backgroundColor: '#059669',
                }}
              >
                <span>{locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                <ArrowRight size={13} weight="bold" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold transition-colors hover:text-emerald-500"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-transform active:scale-98 cursor-pointer"
                  style={{
                    backgroundColor: '#059669',
                  }}
                >
                  {locale === 'bn' ? 'শুরু করুন' : 'Get started'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── 1. Asymmetric Split Hero (Fits 100dvh, No AI Mesh Blob) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Copy & CTAs (Max 4 elements) */}
          <div className="lg:col-span-6 space-y-6">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md border"
              style={{
                borderColor: 'rgba(16, 185, 129, 0.3)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                color: '#059669',
              }}
            >
              <Sparkle size={13} weight="fill" className="text-amber-500" />
              <span>{locale === 'bn' ? 'বাংলা ও ইংরেজি এআই খরচ ট্র্যাকার' : 'Bilingual Personal Finance Platform'}</span>
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.18]" style={{ color: 'var(--text-primary)' }}>
              {locale === 'bn' ? 'দৈনন্দিন আর্থিক হিসাব রাখুন সহজে' : 'Intelligent personal finance for modern Bangladesh'}
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-[54ch]">
              {locale === 'bn'
                ? 'বাংলা বা ইংরেজিতে কথা বলে খরচ রেকর্ড করুন, রসিদ স্ক্যান করুন এবং ইউটিলিটি বিল ও ধার-দেনার হিসাব পরিচালনা করুন।'
                : 'Capture expenses by voice in Bangla and English, scan receipts, manage utility bills, and settle debts in real time.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
                style={{
                  backgroundColor: '#059669',
                }}
              >
                <span>{locale === 'bn' ? 'ফ্রি অ্যাকাউন্ট খুলুন' : 'Get started free'}</span>
                <ArrowRight size={14} weight="bold" />
              </Link>

              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-colors hover:border-amber-500 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <Microphone size={16} weight="fill" className="text-red-500" />
                <span>{locale === 'bn' ? 'ভয়েস ট্রাই করুন' : 'Test voice AI'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Live Widget (No fake screenshots) */}
          <div className="lg:col-span-6">
            <div
              className="rounded-2xl border p-6 shadow-lg space-y-5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'rgba(217, 119, 6, 0.3)',
              }}
            >
              {/* Widget Header */}
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Live Voice Parser
                  </span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Latency: 280ms
                </span>
              </div>

              {/* Sample Selector */}
              <div className="flex items-center gap-2">
                {voiceDemos.map((demo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveVoiceDemo(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      activeVoiceDemo === idx
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {demo.label}
                  </button>
                ))}
              </div>

              {/* Spoken Input String */}
              <div
                className="p-3.5 rounded-xl border font-sans text-xs font-medium leading-relaxed"
                style={{
                  backgroundColor: 'var(--bg-surface-sunken)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                "{voiceDemos[activeVoiceDemo].text}"
              </div>

              {/* Parsed Result Rows */}
              <div className="space-y-2">
                {voiceDemos[activeVoiceDemo].items.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                      <p className="text-[11px] text-slate-500">{item.category} • {item.method}</p>
                    </div>
                    <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {item.amount} ৳
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Asymmetric Bento Grid (Features & Pillars) ─── */}
      <section id="features" className="py-16 border-t" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {locale === 'bn' ? 'প্রয়োজনীয় সকল ফিনটেক টুল এক প্ল্যাটফর্মে' : 'Core capabilities built for daily clarity'}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {locale === 'bn'
                ? 'ম্যানুয়াল স্প্রেডশিটের বদলে নির্ভুল এআই অটোমেশন।'
                : 'Replace manual entries with automated audio parsing, invoice vision, and debt reconciliation.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Tile 1: Voice Engine (7 cols) */}
            <div
              className="md:col-span-7 p-7 rounded-2xl border flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
              }}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Microphone size={20} weight="bold" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'ন্যাচারাল ভয়েস পার্সার' : 'Zero-Effort Voice Capture'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-[50ch]">
                  {locale === 'bn'
                    ? 'বাংলা, ইংরেজি বা বাংলিশ যেভাবেই বলুন, মার্চেন্ট, পরিমাণ ও পেমেন্ট মেথড স্বয়ংক্রিয়ভাবে এক্সট্র্যাক্ট হয়।'
                    : 'Speak naturally on the move. Automatically extracts category, counterparty, and amount.'}
                </p>
              </div>

              <div
                className="mt-6 p-4 rounded-xl border flex items-center justify-between font-mono text-xs"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <span className="text-slate-500">"Kacha Bazar 850 tk bKash"</span>
                <span className="font-bold text-emerald-600">850 ৳ (bKash)</span>
              </div>
            </div>

            {/* Tile 2: Vision OCR (5 cols) */}
            <div
              className="md:col-span-5 p-7 rounded-2xl border flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'rgba(217, 119, 6, 0.3)',
              }}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                  <Receipt size={20} weight="bold" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'রসিদ ও ইনভয়েস স্ক্যানার' : 'Receipt Vision OCR'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {locale === 'bn'
                    ? 'মুদি দোকান বা রেস্তোরাঁর রসিদের ছবি তুলে আইটেমাইজড ব্রেকডাউন সংরক্ষণ করুন।'
                    : 'Upload any printed receipt to extract itemized lines, taxes, and totals.'}
                </p>
              </div>

              <div
                className="mt-6 p-4 rounded-xl border flex items-center justify-between font-mono text-xs"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <span className="text-slate-500">Shwapno Superstore</span>
                <span className="font-bold text-amber-600">330 ৳ (Parsed)</span>
              </div>
            </div>

            {/* Tile 3: Utility Bills (5 cols) */}
            <div
              className="md:col-span-5 p-7 rounded-2xl border flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <Lightning size={20} weight="bold" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'ইউটিলিটি বিল ও সাবস্ক্রিপশন' : 'Utility Bills & Subscriptions'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {locale === 'bn'
                    ? 'ডেসকো, নেসকো, ওয়াসা ও ইন্টারনেট বিল পরিশোধের সাথে সাথে ব্যালেন্স সমন্বয়।'
                    : 'Track recurring bills and cloud subscriptions with automatic budget adjustments.'}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600">DESCO</span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600">WASA</span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-500/10 text-sky-600">Internet</span>
              </div>
            </div>

            {/* Tile 4: Lend & Borrow Ledger (7 cols) */}
            <div
              className="md:col-span-7 p-7 rounded-2xl border flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center">
                  <ArrowsLeftRight size={20} weight="bold" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'ধার ও দেনার খাতা' : 'Debt & Lending Ledger'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-[50ch]">
                  {locale === 'bn'
                    ? 'কাউকে টাকা ধার দেওয়া বা নেওয়ার নির্ভুল হিসাব এবং এক ক্লিকে সেটেলমেন্ট।'
                    : 'Track personal debts and receivables with timestamps, due dates, and one-click settlements.'}
                </p>
              </div>

              <div
                className="mt-6 p-4 rounded-xl border flex items-center justify-between font-mono text-xs"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <span className="text-slate-500">Net Receivable Position</span>
                <span className="font-bold text-emerald-600">+12,500 ৳</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Security & Engineering Principles ─── */}
      <section id="security" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {locale === 'bn' ? 'নিরাপত্তা ও ডেটা সুরক্ষার নিশ্চয়তা' : 'Data privacy by architecture'}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {locale === 'bn'
              ? 'গ্রাহকের তথ্যের গোপনীয়তা রক্ষায় আধুনিক ক্রিপ্টোগ্রাফিক স্ট্যান্ডার্ড।'
              : 'Built with stateless tokenization and relational consistency.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'PostgreSQL ACID', desc: locale === 'bn' ? 'কম্পোজিট ইনডেক্স ও নির্ভরযোগ্য ট্রানজেকশন।' : 'Relational durability with optimized composite indexes.' },
            { title: 'JWT Authentication', desc: locale === 'bn' ? 'পাসওয়ার্ড বিসিআরওয়াইপিটি এনক্রিপশন দ্বারা সুরক্ষিত।' : 'Stateless tokens with bcrypt password hashing.' },
            { title: 'Zero Data Selling', desc: locale === 'bn' ? 'কোনো তৃতীয় পক্ষের ট্র্যাকার বা ডেটা বিক্রির সুযোগ নেই।' : 'No telemetry selling and zero third-party brokers.' },
            { title: 'Open Source', desc: locale === 'bn' ? 'সোর্স কোড উন্মুক্ত এবং নিজের সার্ভারে হোস্টযোগ্য।' : 'Full codebase transparency and self-host ready.' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border space-y-2"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. FAQ Section ─── */}
      <section id="faq" className="py-16 border-t" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-8" style={{ color: 'var(--text-primary)' }}>
            {locale === 'bn' ? 'সাধারণ জিজ্ঞাসাসমূহ' : 'Frequently Asked Questions'}
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border transition-colors overflow-hidden"
                  style={{
                    backgroundColor: 'var(--bg-surface-sunken)',
                    borderColor: isOpen ? 'rgba(217, 119, 6, 0.4)' : 'var(--border-subtle)',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4.5 text-left flex items-center justify-between gap-4 font-bold text-sm cursor-pointer"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span>{faq.q}</span>
                    <CaretDown size={16} weight="bold" className={`transition-transform text-amber-500 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4.5 pb-4.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 5. Minimal High-Contrast CTA ─── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl p-8 sm:p-12 text-center text-white border"
          style={{
            backgroundColor: '#064e3b',
            borderColor: 'rgba(217, 119, 6, 0.4)',
          }}
        >
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {locale === 'bn' ? 'আজই খরচের নিয়ন্ত্রণ নিন' : 'Take control of your daily financial life'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              {locale === 'bn'
                ? 'কোন ক্রেডিট কার্ডের প্রয়োজন নেই। সম্পূর্ণ বিনামূল্যে এখনই শুরু করুন।'
                : 'No credit card required. Free and open for everyone.'}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-emerald-950 bg-white shadow-sm transition-transform active:scale-98 cursor-pointer"
              >
                {locale === 'bn' ? 'ফ্রি অ্যাকাউন্ট খুলুন' : 'Create free account'}
              </Link>
              <button
                onClick={handleCopy}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-semibold border border-white/30 text-white flex items-center justify-center gap-2 transition-colors hover:bg-white/10 cursor-pointer"
              >
                {copiedInstall ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
                <span>{locale === 'bn' ? 'গিট ক্লোন' : 'Clone repository'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. Clean Minimal Footer ─── */}
      <footer className="border-t py-8" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo-smooth-rounded.svg" alt="খরচ" className="h-7 w-auto object-contain" />
            <span className="text-xs text-slate-500">
              © {new Date().getFullYear()} Khoroch. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs font-semibold text-slate-500">
            <Link href="/login" className="hover:text-emerald-600 transition-colors">{t.login}</Link>
            <Link href="/register" className="hover:text-emerald-600 transition-colors">{t.register}</Link>
            <a
              href="https://github.com/tarek-codes/Khoroch-AI-Powered-Expense-Tracker"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-600 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Live Voice Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSuccess={() => {
          setIsVoiceModalOpen(false);
          toast.success(locale === 'bn' ? 'ভয়েস প্রসেস সম্পন্ন হয়েছে' : 'Voice processed successfully');
        }}
        categories={[]}
        paymentMethods={[]}
      />
    </div>
  );
}
