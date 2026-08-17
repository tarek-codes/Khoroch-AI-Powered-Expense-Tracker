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
  TrendUp,
  CaretDown,
  Check,
  Copy,
  Sparkle,
  Buildings,
  Wallet,
  Clock,
  ChartPie,
  CreditCard,
  Plus,
} from '@phosphor-icons/react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppStore } from '@/store/appStore';
import { translations, toBengaliNumber } from '@/lib/i18n';
import { VoiceModal } from '@/components/VoiceModal';
import { PaymentMethodLogo } from '@/components/PaymentMethodLogo';
import { toast } from 'sonner';

export default function LandingPage() {
  const { user, isHydrated, locale, setLocale, theme, setTheme } = useAppStore();
  const t = translations[locale];

  const [activeVoiceDemo, setActiveVoiceDemo] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);

  // Interactive bills demo state
  const [bills, setBills] = useState([
    { id: 1, name: 'DESCO Electricity', amount: 2450, due: '25 Aug', paid: false, icon: Lightning, color: '#f59e0b' },
    { id: 2, name: 'Dot Internet Fiber', amount: 1200, due: '10 Aug', paid: true, icon: Globe, color: '#10b981' },
    { id: 3, name: 'Dhaka WASA Water', amount: 680, due: '15 Aug', paid: false, icon: Buildings, color: '#0ea5e9' },
  ]);

  // Interactive loans demo state
  const [loans, setLoans] = useState([
    { id: 1, person: 'Rafiqul Islam', type: 'lent', amount: 15000, note: 'Medical emergency', settled: false },
    { id: 2, person: 'Tanvir Ahmed', type: 'borrowed', amount: 2500, note: 'Office lunch share', settled: false },
    { id: 3, person: 'Sabbir Hossain', type: 'lent', amount: 4000, note: 'Weekend trip advance', settled: true },
  ]);

  const toggleBill = (id: number) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b))
    );
    toast.success(locale === 'bn' ? 'বিলের স্ট্যাটাস পরিবর্তন হয়েছে' : 'Bill status updated');
  };

  const toggleLoan = (id: number) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === id ? { ...l, settled: !l.settled } : l))
    );
    toast.success(locale === 'bn' ? 'ঋণের হিসাব সমন্বয় হয়েছে' : 'Loan status updated');
  };

  const voiceDemos = [
    {
      label: 'বাংলা',
      text: 'রিকশা ভাড়া ৫০ টাকা এবং কাঁচাবাজারে ৮৫০ টাকা বিকাশে দিলাম',
      items: [
        { name: 'Kacha Bazar', nameBn: 'কাঁচাবাজার', category: 'Groceries', amount: 850, method: 'bKash' },
        { name: 'Rickshaw', nameBn: 'রিকশা ভাড়া', category: 'Transportation', amount: 50, method: 'Cash' },
      ],
    },
    {
      label: 'Benglish',
      text: 'Uber ride 250 taka and dinner 680 taka নগদে পরিশোধ করেছি',
      items: [
        { name: 'Dinner Bistro', nameBn: 'ডিনার রেস্তোরাঁ', category: 'Food & Dining', amount: 680, method: 'Nagad' },
        { name: 'Uber Ride', nameBn: 'উবার রাইড', category: 'Transportation', amount: 250, method: 'Card' },
      ],
    },
    {
      label: 'English',
      text: 'Paid Dot Internet 1200 taka and ChatGPT subscription 2400 taka',
      items: [
        { name: 'ChatGPT Plus', nameBn: 'চ্যাটজিপিটি', category: 'Subscriptions', amount: 2400, method: 'Card' },
        { name: 'Dot Internet', nameBn: 'ডট ইন্টারনেট', category: 'Utility Bills', amount: 1200, method: 'bKash' },
      ],
    },
  ];

  const categoryChartData = [
    { name: 'Housing & Utilities', value: 18200, color: '#f59e0b' },
    { name: 'Groceries', value: 14500, color: '#10b981' },
    { name: 'Food & Dining', value: 6400, color: '#06b6d4' },
    { name: 'Transportation', value: 3200, color: '#8b5cf6' },
    { name: 'Subscriptions', value: 2860, color: '#ec4899' },
  ];

  const faqs = [
    {
      q: locale === 'bn' ? 'খরচ কীভাবে বাংলা ও ইংরেজি ভাষা বোঝে?' : 'How does Khoroch process bilingual voice inputs?',
      a: locale === 'bn'
        ? 'আমাদের সিস্টেম ওয়েব অডিও স্ট্রিমিং এবং গুগল জেমিনি এআই ব্যবহার করে চলতি বাংলা, ইংরেজি ও বাংলিশ বাক্য থেকে মিলি-সেকেন্ডে মার্চেন্ট, পরিমাণ ও পেমেন্ট চ্যানেল আলাদা করে।'
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

  const netDebt = loans
    .filter((l) => !l.settled)
    .reduce((acc, l) => acc + (l.type === 'lent' ? l.amount : -l.amount), 0);

  return (
    <div
      className="min-h-screen transition-colors duration-150 relative selection:bg-emerald-600 selection:text-white"
      style={{
        backgroundColor: 'var(--bg-page)',
        color: 'var(--text-primary)',
      }}
    >
      {/* ─── Ambient Glow Accents (Emerald & Gold) ─── */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-15 blur-[140px] -top-20 -left-20"
        style={{ background: 'radial-gradient(circle, #059669 0%, #10b981 40%, transparent 70%)' }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-10 blur-[140px] top-[30%] -right-20"
        style={{ background: 'radial-gradient(circle, #d97706 0%, #f59e0b 40%, transparent 70%)' }}
      />

      {/* ─── Header Navigation ─── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b transition-colors"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(10, 15, 26, 0.85)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo-smooth-rounded.svg" alt="খরচ" className="h-9 w-auto object-contain transition-transform group-hover:scale-103" />
            <span
              className="font-mono text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded border"
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
              {locale === 'bn' ? 'ভয়েস স্টুডিও' : 'Voice Studio'}
            </a>
            <a href="#analytics" className="transition-colors hover:text-emerald-500" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn' ? 'এনালিটিক্স' : 'Analytics'}
            </a>
            <a href="#security" className="transition-colors hover:text-emerald-500" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn' ? 'নিরাপত্তা' : 'Security'}
            </a>
            <a href="#faq" className="transition-colors hover:text-emerald-500" style={{ color: 'var(--text-secondary)' }}>
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Switch */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:border-amber-500/60 cursor-pointer shadow-2xs"
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

            {/* Theme Toggle */}
            <ToggleGroup.Root
              type="single"
              value={theme}
              onValueChange={(val) => {
                if (val) setTheme(val as 'light' | 'dark');
              }}
              className="hidden sm:flex p-0.5 rounded-lg border shadow-2xs"
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
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-transform active:scale-98 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                }}
              >
                <span>{locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                <ArrowRight size={13} weight="bold" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-semibold transition-colors hover:text-emerald-500"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-transform active:scale-98 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  }}
                >
                  <span>{locale === 'bn' ? 'শুরু করুন' : 'Get started'}</span>
                  <ArrowRight size={13} weight="bold" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── 1. Hero Section (Balanced Split with Rich Stage) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-6">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full border shadow-2xs"
              style={{
                borderColor: 'rgba(217, 119, 6, 0.35)',
                backgroundColor: 'rgba(217, 119, 6, 0.08)',
                color: '#d97706',
              }}
            >
              <Sparkle size={14} weight="fill" className="text-amber-500" />
              <span>{locale === 'bn' ? 'এআই চালিত দ্বিভাষিক খরচ ট্র্যাকার' : 'AI-Powered Bilingual Expense Intelligence'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.15]" style={{ color: 'var(--text-primary)' }}>
              {locale === 'bn' ? 'বাংলা ও ইংরেজি ভয়েসে খরচের নির্ভুল হিসাব' : 'The AI Expense Tracker for Spoken Bangla, Receipts and Cashflow'}
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-[52ch]">
              {locale === 'bn'
                ? 'কথা বলে বা রসিদের ছবি তুলে চোখের পলকে খরচ এন্ট্রি করুন। ইউটিলিটি বিল, সাবস্ক্রিপশন ও ধার-দেনার হিসাব রাখুন সহজেই।'
                : 'Speak naturally in Bangla or English, scan paper invoices with vision AI, manage utility bills, and settle debts in real time.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-extrabold text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 8px 20px -6px rgba(5, 150, 105, 0.4)',
                }}
              >
                <span>{locale === 'bn' ? 'বিনামূল্যে শুরু করুন' : 'Get started free'}</span>
                <ArrowRight size={14} weight="bold" />
              </Link>

              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-sm font-bold border flex items-center justify-center gap-2.5 transition-colors hover:border-amber-500/70 cursor-pointer shadow-2xs"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'rgba(217, 119, 6, 0.3)',
                  color: 'var(--text-primary)',
                }}
              >
                <Microphone size={16} weight="fill" className="text-red-500 animate-pulse" />
                <span>{locale === 'bn' ? 'লাইভ ভয়েস ট্রাই করুন' : 'Test voice AI live'}</span>
              </button>
            </div>

            {/* Micro Metrics Strip */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <p className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">৳ 0</p>
                <p className="text-xs font-semibold text-slate-500">{locale === 'bn' ? '১০০% ফ্রি' : 'Platform Fee'}</p>
              </div>
              <div>
                <p className="font-mono text-xl font-black text-amber-500">&lt; 300ms</p>
                <p className="text-xs font-semibold text-slate-500">{locale === 'bn' ? 'এআই পার্সিং গতি' : 'AI Parse Speed'}</p>
              </div>
              <div>
                <p className="font-mono text-xl font-black text-teal-500">100%</p>
                <p className="text-xs font-semibold text-slate-500">{locale === 'bn' ? 'এনক্রিপ্টেড ডেটা' : 'Private & Secure'}</p>
              </div>
            </div>
          </div>

          {/* Right Hero Stage Card */}
          <div className="lg:col-span-6">
            <div
              className="rounded-3xl border p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden backdrop-blur-xl"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(245, 158, 11, 0.35)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500 font-mono">
                    August 2026 Monthly Budget
                  </span>
                  <p className="text-xl sm:text-2xl font-black font-mono mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    43,160 ৳ <span className="text-xs font-semibold text-slate-500 font-sans">/ 65,000 ৳</span>
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-mono">
                    <TrendUp size={12} weight="bold" />
                    <span>66% Normal</span>
                  </span>
                  <p className="text-[11px] font-semibold text-slate-500">21,840 ৳ remaining</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: '66%',
                    background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 100%)',
                  }}
                />
              </div>

              {/* Audio Waveform & Phrase Box */}
              <div
                className="p-4 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--bg-surface-sunken)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold font-mono uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Spoken Audio Stream
                    </span>
                  </div>

                  {/* Audio Bars */}
                  <div className="flex items-center gap-1">
                    {[14, 22, 18, 28, 20, 32, 16, 26, 30, 18, 12].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-emerald-500 transition-all duration-300"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  "{voiceDemos[activeVoiceDemo].text}"
                </p>

                {/* Phrase Selectors */}
                <div className="flex items-center gap-1.5 pt-1">
                  {voiceDemos.map((demo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveVoiceDemo(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        activeVoiceDemo === idx
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                          : 'border-slate-300 dark:border-zinc-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {demo.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parsed Line Items */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold font-mono text-slate-500 px-1">
                  <span>AI EXTRACTED LINE ITEMS</span>
                  <span className="text-emerald-500">Auto-Categorized</span>
                </div>

                {voiceDemos[activeVoiceDemo].items.map((item, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border flex items-center justify-between shadow-2xs transition-transform hover:scale-101"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <PaymentMethodLogo name={item.method} size={28} />
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                          {locale === 'bn' ? item.nameBn : item.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-semibold">
                          {item.category} • {item.method}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                      {locale === 'bn' ? `${toBengaliNumber(item.amount)} ৳` : `${item.amount} ৳`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Asymmetric Bento Grid Section ─── */}
      <section id="features" className="py-20 border-t relative" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14 space-y-2">
            <span
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border"
              style={{
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#059669',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
              }}
            >
              Unified Modules
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {locale === 'bn' ? 'প্রয়োজনীয় সকল ফিনটেক টুল এক প্ল্যাটফর্মে' : 'Engineered for Complete Financial Control'}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {locale === 'bn'
                ? 'স্প্রেডশিটের বদলে স্বয়ংক্রিয় এআই পার্সিং, বিল নোটিফিকেশন ও ডেট ট্র্যাকিং।'
                : 'Replace manual record-keeping with automated audio parsing, invoice vision, and debt reconciliation.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Tile 1: Voice AI Engine (7 cols) */}
            <div
              className="md:col-span-7 p-7 sm:p-8 rounded-3xl border flex flex-col justify-between shadow-sm relative overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
              }}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Microphone size={24} weight="bold" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'ন্যাচারাল স্পোকেন ভয়েস ইঞ্জিন' : 'Natural Spoken Expense Engine'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-[50ch]">
                  {locale === 'bn'
                    ? 'চলতি বাংলা বা ইংরেজিতে কথা বললেই ক্যাটাগরি, মার্চেন্ট ও টাকার পরিমাণ আলাদা হয়ে যায়।'
                    : 'Speak naturally in colloquial Bangla or English on the go. Gemini LLM parses multiple line items, payment modes, and vendors.'}
                </p>
              </div>

              <div
                className="mt-6 p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-2">
                  <PaymentMethodLogo name="bKash" size={24} />
                  <span className="text-slate-600 dark:text-slate-300">"Kacha Bazar 850 tk bKash"</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg">
                  850 ৳ • Groceries
                </span>
              </div>
            </div>

            {/* Tile 2: Vision OCR (5 cols) */}
            <div
              className="md:col-span-5 p-7 sm:p-8 rounded-3xl border flex flex-col justify-between shadow-sm relative overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
              }}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <Receipt size={24} weight="bold" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'স্মার্ট রসিদ ও ইনভয়েস স্ক্যানার' : 'Receipt Vision OCR'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {locale === 'bn'
                    ? 'মুদি দোকান বা রেস্তোরাঁর প্রিন্ট করা রসিদের ছবি তুলে আইটেমাইজড ব্রেকডাউন সংরক্ষণ করুন।'
                    : 'Snap a photo of printed supermarket or dining receipts for instant multi-item breakdown.'}
                </p>
              </div>

              <div
                className="mt-6 p-4 rounded-2xl border font-mono text-xs space-y-1.5"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex justify-between font-bold text-amber-600">
                  <span>Shwapno Superstore</span>
                  <span>330.00 ৳</span>
                </div>
                <p className="text-[11px] text-slate-500">3 Items Extracted • Tax and VAT Parsed</p>
              </div>
            </div>

            {/* Tile 3: Utility Bills (5 cols) */}
            <div
              className="md:col-span-5 p-7 sm:p-8 rounded-3xl border flex flex-col justify-between shadow-sm relative overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'rgba(14, 165, 233, 0.3)',
              }}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                  <Lightning size={24} weight="bold" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'ইউটিলিটি বিল ও সাবস্ক্রিপশন' : 'Utility Bills and Subscriptions'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {locale === 'bn'
                    ? 'বিদ্যুৎ, পানি ও ইন্টারনেট বিলের ট্র্যাক রাখুন। বিল পরিশোধে এক ক্লিকে ব্যালেন্স সমন্বয়।'
                    : 'Track DESCO, WASA, Dot Internet, and Netflix. 1-click status deducts from monthly pool.'}
                </p>
              </div>

              {/* Interactive Bills Demo */}
              <div className="mt-6 space-y-2">
                {bills.slice(0, 2).map((bill) => (
                  <div
                    key={bill.id}
                    onClick={() => toggleBill(bill.id)}
                    className="p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:border-emerald-500/50"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${bill.color}20`, color: bill.color }}>
                        <bill.icon size={15} weight="bold" />
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{bill.name}</p>
                        <p className="text-[10px] text-slate-500">Due: {bill.due}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        bill.paid
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : 'bg-rose-500/15 text-rose-600'
                      }`}
                    >
                      {bill.paid ? 'PAID' : 'DUE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tile 4: Lend & Borrow Ledger (7 cols) */}
            <div
              className="md:col-span-7 p-7 sm:p-8 rounded-3xl border flex flex-col justify-between shadow-sm relative overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'rgba(217, 119, 6, 0.3)',
              }}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <ArrowsLeftRight size={24} weight="bold" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'ধার ও দেনার খাতা' : 'Debt and Lending Ledger'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-[50ch]">
                  {locale === 'bn'
                    ? 'কাউকে টাকা ধার দেওয়া বা ধার নেওয়ার নির্ভুল রেকর্ড। পরিশোধের সাথে সাথে এক ক্লিকে সেটেল করুন।'
                    : 'Maintain timestamped records of money lent or borrowed with real-time net receivable balance.'}
                </p>
              </div>

              {/* Interactive Debt Rows */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold px-1 text-slate-500 font-mono">
                  <span>ACTIVE LOANS</span>
                  <span className="text-emerald-600 font-black">Net Position: +{netDebt.toLocaleString()} ৳</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {loans.slice(0, 2).map((loan) => (
                    <div
                      key={loan.id}
                      onClick={() => toggleLoan(loan.id)}
                      className="p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:border-amber-500/50"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{loan.person}</p>
                        <p className="text-[10px] text-slate-500">{loan.type === 'lent' ? 'I Lent' : 'I Borrowed'}</p>
                      </div>
                      <span className={`font-mono text-xs font-black ${loan.type === 'lent' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {loan.type === 'lent' ? `+${loan.amount} ৳` : `-${loan.amount} ৳`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Visual Analytics & Spending Breakdown ─── */}
      <section id="analytics" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border"
              style={{
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#059669',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
              }}
            >
              Real-Time Visuals
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {locale === 'bn' ? 'খরচের গভীর এনালিটিক্স ও ট্রেন্ডস' : 'Deep Financial Analytics and Trends'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {locale === 'bn'
                ? 'ক্যাটাগরি ভিত্তিক খরচের পাই চার্ট, মাসিক খরচের তুলনামূলক গ্রাফ এবং পেমেন্ট চ্যানেল ভিত্তিক হিসাব দেখুন সহজে।'
                : 'Interactive donut breakdowns, monthly pace projections, and payment channel insights make cashflow instantly readable.'}
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle size={18} weight="fill" className="text-emerald-500 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'মাসিক খরচের গতি ও ক্যাটাগরি বিশ্লেষণ' : 'Monthly spending trajectory and category pace'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={18} weight="fill" className="text-amber-500 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'বিকাশ, নগদ ও কার্ডের আলাদা হিসাব' : 'Separate wallets for bKash, Nagad, and Bank Cards'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={18} weight="fill" className="text-sky-500 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'সিএসভি ও স্প্রেডশিট এক্সপোর্ট' : 'One-click CSV ledger export'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Donut Preview Card */}
          <div className="lg:col-span-7">
            <div
              className="p-7 rounded-3xl border shadow-xl space-y-6"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">Category Share</p>
                  <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Monthly Expenditure</h4>
                </div>
                <span className="font-mono text-xs font-black px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600">
                  45,160 ৳ Total
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* Donut Chart */}
                <div className="sm:col-span-6 h-52 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`${val} ৳`, 'Amount']}
                        contentStyle={{
                          backgroundColor: 'var(--bg-surface)',
                          borderColor: 'var(--border-subtle)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend List */}
                <div className="sm:col-span-6 space-y-2">
                  {categoryChartData.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-500">{cat.value.toLocaleString()} ৳</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Security & Data Architecture ─── */}
      <section id="security" className="py-20 border-t" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14 space-y-2">
            <span
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border"
              style={{
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#059669',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
              }}
            >
              Data Sovereignty
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {locale === 'bn' ? 'নিরাপত্তা ও ডেটা সুরক্ষার নিশ্চয়তা' : 'Data Privacy by Architecture'}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {locale === 'bn'
                ? 'গ্রাহকের তথ্যের গোপনীয়তা রক্ষায় আধুনিক ক্রিপ্টোগ্রাফিক স্ট্যান্ডার্ড।'
                : 'Built with stateless tokenization, composite database indexes, and zero telemetry tracking.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'PostgreSQL ACID', desc: locale === 'bn' ? 'কম্পোজিট ইনডেক্স ও নির্ভরযোগ্য ট্রানজেকশন।' : 'Relational durability with optimized composite indexes for 10ms queries.', icon: ShieldCheck },
              { title: 'JWT Authentication', desc: locale === 'bn' ? 'পাসওয়ার্ড বিসিআরওয়াইপিটি এনক্রিপশন দ্বারা সুরক্ষিত।' : 'Stateless bearer tokens with salted bcrypt password hashing.', icon: LockKey },
              { title: 'Zero Data Selling', desc: locale === 'bn' ? 'কোনো তৃতীয় পক্ষের ট্র্যাকার বা ডেটা বিক্রির সুযোগ নেই।' : 'No ads, no data broker sharing, and zero third-party marketing.', icon: CheckCircle },
              { title: 'Open Source', desc: locale === 'bn' ? 'সোর্স কোড উন্মুক্ত এবং নিজের সার্ভারে হোস্টযোগ্য।' : 'Full codebase transparency and easy Docker container deployment.', icon: Sparkle },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--bg-surface-sunken)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                  <item.icon size={20} weight="bold" />
                </div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. FAQ Accordion ─── */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight mb-10 text-center" style={{ color: 'var(--text-primary)' }}>
          {locale === 'bn' ? 'সাধারণ জিজ্ঞাসাসমূহ' : 'Frequently Asked Questions'}
        </h2>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border transition-colors overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: isOpen ? 'rgba(245, 158, 11, 0.45)' : 'var(--border-subtle)',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span>{faq.q}</span>
                  <CaretDown size={17} weight="bold" className={`transition-transform text-amber-500 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t pt-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 6. High-Contrast Conversion Banner ─── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl p-8 sm:p-14 text-center text-white border shadow-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #92400e 100%)',
            borderColor: 'rgba(245, 158, 11, 0.4)',
          }}
        >
          <div className="max-w-xl mx-auto space-y-5 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {locale === 'bn' ? 'আজই খরচের নিয়ন্ত্রণ নিন' : 'Take control of your daily financial life'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              {locale === 'bn'
                ? 'কোন ক্রেডিট কার্ডের প্রয়োজন নেই। সম্পূর্ণ বিনামূল্যে এখনই শুরু করুন।'
                : 'No credit card required. Free and open for everyone.'}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold text-emerald-950 bg-white shadow-md transition-transform active:scale-98 cursor-pointer hover:bg-emerald-50"
              >
                {locale === 'bn' ? 'ফ্রি অ্যাকাউন্ট খুলুন' : 'Create free account'}
              </Link>
              <button
                onClick={handleCopy}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold border border-white/30 text-white flex items-center justify-center gap-2 transition-colors hover:bg-white/10 cursor-pointer"
              >
                {copiedInstall ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
                <span>{locale === 'bn' ? 'গিট ক্লোন' : 'Clone repository'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. Clean Minimal Footer ─── */}
      <footer className="border-t py-10" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-smooth-rounded.svg" alt="খরচ" className="h-8 w-auto object-contain" />
            <span className="text-xs text-slate-500 font-medium">
              © {new Date().getFullYear()} Khoroch (খরচ). Built with Next.js 15, React 19 and NestJS.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
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
