'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Microphone,
  Receipt,
  ArrowRight,
  Check,
  Globe,
  Plus,
  ArrowUpRight,
  Sparkle,
  Lightning,
  Buildings,
  Wallet,
  Clock,
  ChartPie,
  CreditCard,
  CheckCircle,
  Copy,
  ArrowsLeftRight,
  TrendUp,
  Scan,
  ShieldCheck,
  Sliders,
  CaretRight,
} from '@phosphor-icons/react';
import { useAppStore } from '@/store/appStore';
import { translations, toBengaliNumber } from '@/lib/i18n';
import { VoiceModal } from '@/components/VoiceModal';
import { PaymentMethodLogo } from '@/components/PaymentMethodLogo';
import { toast } from 'sonner';

export default function LandingPage() {
  const { user, isHydrated, locale, setLocale } = useAppStore();
  const t = translations[locale];

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [activeVoiceTab, setActiveVoiceTab] = useState<'bn' | 'mixed' | 'en'>('bn');

  // Interactive Live Hero State
  const [heroBudget, setHeroBudget] = useState(30000);
  const [heroExpenses, setHeroExpenses] = useState([
    { id: 1, name: 'Lunch & Cafe', category: 'Food & Dining', amount: 350, method: 'bKash', time: '12:30 PM' },
    { id: 2, name: 'Uber Ride', category: 'Transportation', amount: 420, method: 'Nagad', time: '09:15 AM' },
    { id: 3, name: 'Kacha Bazar', category: 'Groceries', amount: 1850, method: 'Cash', time: 'Yesterday' },
  ]);

  const totalSpent = heroExpenses.reduce((sum, e) => sum + e.amount, 11550 - 2620);
  const remainingBalance = heroBudget - totalSpent;
  const spentPercentage = Math.min(100, Math.round((totalSpent / heroBudget) * 100));

  const addQuickExpense = (name: string, category: string, amount: number, method: string) => {
    const newExp = {
      id: Date.now(),
      name,
      category,
      amount,
      method,
      time: 'Just now',
    };
    setHeroExpenses((prev) => [newExp, ...prev.slice(0, 3)]);
    toast.success(
      locale === 'bn'
        ? `৳${amount} যোগ করা হয়েছে (${name})`
        : `Added ৳${amount} for ${name}`
    );
  };

  // Interactive Voice Demo Data
  const voiceDemos = {
    bn: {
      label: 'বাংলা',
      text: 'রিকশা ভাড়া ৫০ টাকা এবং কাঁচাবাজারে ৮৫০ টাকা বিকাশে দিলাম',
      parsed: [
        { name: 'Kacha Bazar', category: 'Groceries', amount: 850, method: 'bKash' },
        { name: 'Rickshaw Fare', category: 'Transportation', amount: 50, method: 'Cash' },
      ],
    },
    mixed: {
      label: 'Benglish',
      text: 'Uber ride 250 taka and dinner 680 taka নগদে পরিশোধ করেছি',
      parsed: [
        { name: 'Dinner Bistro', category: 'Food & Dining', amount: 680, method: 'Nagad' },
        { name: 'Uber Ride', category: 'Transportation', amount: 250, method: 'Card' },
      ],
    },
    en: {
      label: 'English',
      text: 'Paid Dot Internet 1200 taka and ChatGPT subscription 2400 taka',
      parsed: [
        { name: 'ChatGPT Plus', category: 'Subscriptions', amount: 2400, method: 'Card' },
        { name: 'Dot Internet', category: 'Utility Bills', amount: 1200, method: 'bKash' },
      ],
    },
  };

  // Copy Repo command
  const handleCopy = () => {
    navigator.clipboard.writeText('git clone https://github.com/tarek-codes/Khoroch-AI-Powered-Expense-Tracker.git');
    setCopiedInstall(true);
    toast.success(locale === 'bn' ? 'কমান্ড কপি হয়েছে!' : 'Clone command copied!');
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  return (
    <div
      className="min-h-screen text-[#171717] selection:bg-[#179B51] selection:text-white relative overflow-x-hidden"
      style={{
        backgroundColor: '#FAFAF7',
        fontFamily: 'var(--font-jakarta), var(--font-sans), Inter, sans-serif',
      }}
    >
      {/* ─── Top Navigation ─── */}
      <header className="w-full bg-[#FAFAF7]/90 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo-smooth-rounded.svg"
              alt="খরচ"
              className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="hidden sm:inline-block font-mono text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FBC02B]/20 text-[#92400e] border border-[#FBC02B]/40">
              Fintech
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#171717]">
            <a href="#features" className="hover:text-[#179B51] transition-colors">
              {locale === 'bn' ? 'ফিচারসমূহ' : 'Features'}
            </a>
            <a href="#voice" className="hover:text-[#179B51] transition-colors">
              {locale === 'bn' ? 'ভয়েস এআই' : 'Voice AI'}
            </a>
            <a href="#budget" className="hover:text-[#179B51] transition-colors">
              {locale === 'bn' ? 'বাজেট' : 'Budget'}
            </a>
            <a href="#insights" className="hover:text-[#179B51] transition-colors">
              {locale === 'bn' ? 'ইনসাইটস' : 'Insights'}
            </a>
            <a href="#how-it-works" className="hover:text-[#179B51] transition-colors">
              {locale === 'bn' ? 'কীভাবে কাজ করে' : 'How It Works'}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Switch */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-neutral-300 bg-white shadow-xs hover:border-[#179B51] transition-all cursor-pointer"
            >
              <Globe size={14} weight="bold" className="text-[#179B51]" />
              <span>{locale === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {isHydrated && user ? (
              <Link
                href="/dashboard"
                className="px-4.5 py-2 rounded-xl text-xs font-bold text-white bg-[#179B51] shadow-sm hover:bg-[#148344] hover:shadow-md transition-all flex items-center gap-1.5"
              >
                <span>{locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                <ArrowRight size={13} weight="bold" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-bold text-[#171717] hover:text-[#179B51] transition-colors"
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  className="px-4.5 py-2 rounded-xl text-xs font-bold text-white bg-[#179B51] shadow-sm hover:bg-[#148344] hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>{locale === 'bn' ? 'শুরু করুন' : 'Get Started'}</span>
                  <ArrowRight size={13} weight="bold" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section with Dynamic Live Showcase ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-18 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FBC02B]/15 border border-[#FBC02B]/50 rounded-full text-xs font-bold text-[#92400e]">
              <Sparkle size={14} weight="fill" className="text-[#FBC02B]" />
              <span>{locale === 'bn' ? 'বাংলা ও ইংরেজি ভয়েস ফাইন্যান্স' : 'Bilingual Personal Finance Platform'}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06] text-[#171717]">
              {locale === 'bn' ? (
                <>
                  দৈনন্দিন খরচের ওপর সম্পূর্ণ{' '}
                  <span className="text-[#179B51] relative inline-block">
                    নিয়ন্ত্রণ
                    <span className="absolute bottom-1 left-0 w-full h-2.5 bg-[#FBC02B]/30 -z-10 rounded-sm" />
                  </span>{' '}
                  নিন।
                </>
              ) : (
                <>
                  Take control of your everyday{' '}
                  <span className="text-[#179B51] relative inline-block">
                    spending
                    <span className="absolute bottom-1 left-0 w-full h-2.5 bg-[#FBC02B]/30 -z-10 rounded-sm" />
                  </span>.
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-[#555555] font-normal leading-relaxed max-w-[48ch]">
              {locale === 'bn'
                ? 'বাংলা বা ইংরেজিতে কথা বলে খরচ রেকর্ড করুন, রসিদ স্ক্যান করুন এবং মাসিক বাজেট রাখুন হাতের মুঠোয়।'
                : 'Track expenses with natural voice, scan paper receipts with vision AI, and manage your monthly budget with ease.'}
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/register"
                className="px-7 py-3.5 rounded-xl text-base font-bold text-white bg-[#179B51] shadow-md hover:bg-[#148344] hover:shadow-lg transition-all text-center flex items-center justify-center gap-2 group"
              >
                <span>{locale === 'bn' ? 'বিনামূল্যে শুরু করুন' : 'Get Started Free'}</span>
                <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="px-6 py-3.5 rounded-xl text-base font-bold text-[#171717] bg-white border border-neutral-300 shadow-sm hover:border-[#179B51] hover:bg-neutral-50 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <Microphone size={18} weight="fill" className="text-red-500" />
                <span>{locale === 'bn' ? 'ভয়েস ট্রাই করুন' : 'Try Live Voice AI'}</span>
              </button>
            </div>

            {/* Micro Feature Metric Pills */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="p-3.5 bg-white border border-neutral-200/80 rounded-xl shadow-xs text-center">
                <p className="font-mono text-xl font-black text-[#179B51]">৳ 0</p>
                <p className="text-xs font-semibold text-[#666666]">{locale === 'bn' ? '১০০% ফ্রি' : '100% Free'}</p>
              </div>
              <div className="p-3.5 bg-white border border-neutral-200/80 rounded-xl shadow-xs text-center">
                <p className="font-mono text-xl font-black text-[#d97706]">&lt; 300ms</p>
                <p className="text-xs font-semibold text-[#666666]">{locale === 'bn' ? 'এআই স্পিড' : 'AI Latency'}</p>
              </div>
              <div className="p-3.5 bg-white border border-neutral-200/80 rounded-xl shadow-xs text-center">
                <p className="font-mono text-xl font-black text-[#171717]">100%</p>
                <p className="text-xs font-semibold text-[#666666]">{locale === 'bn' ? 'এনক্রিপ্টেড' : 'Private & Secure'}</p>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Product Canvas (Interactive Live Simulation) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-6"
          >
            <div className="bg-white border border-neutral-200 rounded-3xl shadow-xl p-6 sm:p-7 space-y-5 relative">
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#179B51]/10 flex items-center justify-center text-[#179B51]">
                    <Wallet size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#171717]">Khoroch Dashboard</h3>
                    <p className="text-[11px] text-[#888888]">Live Personal Workspace</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-[#FBC02B]/20 text-[#92400e] px-2.5 py-1 rounded-full border border-[#FBC02B]/40">
                  August 2026
                </span>
              </div>

              {/* Main Balance Display */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#777777] uppercase tracking-wider font-mono">Remaining Balance</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-3xl sm:text-4xl font-black text-[#171717] font-mono tracking-tight">
                    ৳ {remainingBalance.toLocaleString()}
                  </p>
                  <span className="text-xs font-bold text-[#179B51] bg-[#179B51]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <TrendUp size={12} weight="bold" />
                    <span>Healthy Pace</span>
                  </span>
                </div>
              </div>

              {/* Budget Pacing Bar */}
              <div className="space-y-2 p-3.5 bg-[#FAFAF7] rounded-2xl border border-neutral-200/60">
                <div className="flex justify-between text-xs font-semibold text-[#555555]">
                  <span>Spent: <strong className="text-[#171717] font-mono font-bold">৳ {totalSpent.toLocaleString()}</strong></span>
                  <span>Target: <strong className="text-[#171717] font-mono font-bold">৳ {heroBudget.toLocaleString()}</strong></span>
                </div>
                <div className="w-full h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#179B51] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${spentPercentage}%` }}
                    transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                  />
                </div>
              </div>

              {/* Quick Add Expense Interactive Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#777777] uppercase tracking-wider font-mono">Quick Test Transactions</span>
                  <span className="text-[11px] text-[#179B51] font-semibold">Click to simulate</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => addQuickExpense('Cold Coffee', 'Food & Dining', 220, 'bKash')}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-bold text-[#171717] hover:border-[#179B51] hover:bg-[#179B51]/5 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus size={12} weight="bold" className="text-[#179B51]" />
                    <span>Coffee (৳220)</span>
                  </button>
                  <button
                    onClick={() => addQuickExpense('Rickshaw', 'Transportation', 60, 'Cash')}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-bold text-[#171717] hover:border-[#179B51] hover:bg-[#179B51]/5 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus size={12} weight="bold" className="text-[#179B51]" />
                    <span>Rickshaw (৳60)</span>
                  </button>
                  <button
                    onClick={() => addQuickExpense('Supermarket', 'Groceries', 640, 'Nagad')}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-bold text-[#171717] hover:border-[#179B51] hover:bg-[#179B51]/5 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus size={12} weight="bold" className="text-[#179B51]" />
                    <span>Bazar (৳640)</span>
                  </button>
                </div>
              </div>

              {/* Transaction Stream */}
              <div className="space-y-2 pt-1">
                <AnimatePresence initial={false}>
                  {heroExpenses.map((exp) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-3 bg-[#FAFAF7] rounded-xl border border-neutral-200/70 hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <PaymentMethodLogo name={exp.method} size={22} />
                        <div>
                          <p className="text-xs font-bold text-[#171717]">{exp.name}</p>
                          <p className="text-[10px] text-[#777777]">{exp.category} • {exp.time}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-black text-[#171717]">-৳ {exp.amount.toLocaleString()}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Animated Marquee Value Ticker ─── */}
      <div className="w-full bg-[#171717] text-[#FAFAF7] py-4 overflow-hidden border-y border-neutral-800">
        <div className="flex items-center gap-12 whitespace-nowrap text-xs sm:text-sm font-bold uppercase tracking-wider font-mono animate-none">
          <div className="flex items-center gap-10 shrink-0">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#179B51]" /> Voice Expense AI</span>
            <span className="text-neutral-500">•</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FBC02B]" /> Receipt Vision OCR</span>
            <span className="text-neutral-500">•</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#179B51]" /> Monthly Budget Tracker</span>
            <span className="text-neutral-500">•</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FBC02B]" /> Debt & Lending Ledger</span>
            <span className="text-neutral-500">•</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#179B51]" /> bKash, Nagad & Bank Sync</span>
            <span className="text-neutral-500">•</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FBC02B]" /> Bilingual Bangla & English</span>
          </div>
        </div>
      </div>

      {/* ─── Problem Statement Banner ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-14 text-center space-y-5 shadow-sm">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#179B51] bg-[#179B51]/10 px-3 py-1 rounded-full">
            Financial Clarity
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#171717]">
            {locale === 'bn' ? (
              <>
                আপনার টাকা আসলে{' '}
                <span className="text-[#179B51]">কোথায় যায়?</span>
              </>
            ) : (
              <>
                Where does your money{' '}
                <span className="text-[#179B51]">actually go?</span>
              </>
            )}
          </h2>
          <p className="text-base sm:text-lg text-[#666666] font-normal leading-relaxed max-w-[60ch] mx-auto">
            {locale === 'bn'
              ? 'প্রতিদিনের ছোট ছোট খরচ দ্রুত জমা হয়ে যায়। খরচ আপনাকে প্রতিটি ব্যয়ের নিখুঁত হিসাব রাখতে, অভ্যাস বুঝতে এবং কত টাকা বাকি আছে তা পরিষ্কার দেখতে সাহায্য করে।'
              : 'Small expenses add up quickly. Khoroch helps you keep track of your spending, understand your habits, and know exactly how much money you have left.'}
          </p>
        </div>
      </section>

      {/* ─── 3 Rich Interactive Feature Showcases ─── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 pb-20">
        {/* Feature 1: Instant Expense Logger */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-7 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#179B51]/10 flex items-center justify-center text-[#179B51]">
                <Plus size={22} weight="bold" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#179B51]">
                01. Instant Entry
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#171717]">
                {locale === 'bn' ? 'প্রতিটি খরচের দ্রুত ও নিখুঁত হিসাব।' : 'Track every expense with ease.'}
              </h3>
              <p className="text-base text-[#666666] font-normal leading-relaxed">
                {locale === 'bn'
                  ? 'ম্যানুয়ালি হিসাব মেলাতে আর কোনো ঝামেলা নেই। কোথায় কত টাকা খরচ হচ্ছে তা এক ক্লিকে রেকর্ড করুন।'
                  : 'Know where every taka goes without manually piecing everything together at the end of the month.'}
              </p>

              <div className="space-y-2 pt-2 text-xs font-semibold text-[#171717]">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-[#179B51]" />
                  <span>{locale === 'bn' ? 'বিকাশ, নগদ, ব্যাংক কার্ড ও ক্যাশ সাপোর্ট' : 'Direct bKash, Nagad, Card and Cash wallet channels'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-[#179B51]" />
                  <span>{locale === 'bn' ? 'কাস্টম ক্যাটাগরি ও ফিল্টারিং সুবিধা' : 'Custom categories, payment tags, and date range filters'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#FAFAF7] border border-neutral-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <span className="font-bold text-sm">Quick Add Demo</span>
                <span className="font-mono text-xs font-bold text-[#179B51]">BDT ৳</span>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="text-[#666666] block mb-1">Amount (৳)</label>
                  <input
                    type="number"
                    defaultValue="450"
                    id="demo-amount-input"
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-mono font-bold text-base focus:border-[#179B51] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#666666] block mb-1">Category</label>
                  <select className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-medium focus:border-[#179B51] focus:outline-none">
                    <option>Food & Dining</option>
                    <option>Groceries</option>
                    <option>Transportation</option>
                    <option>Utility Bills</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#666666] block mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg border-2 border-[#179B51] bg-[#179B51]/10 flex items-center justify-center gap-1.5 text-xs font-bold">
                      <PaymentMethodLogo name="bKash" size={16} />
                      <span>bKash</span>
                    </div>
                    <div className="p-2 rounded-lg border border-neutral-200 bg-white flex items-center justify-center gap-1.5 text-xs font-medium">
                      <PaymentMethodLogo name="Nagad" size={16} />
                      <span>Nagad</span>
                    </div>
                    <div className="p-2 rounded-lg border border-neutral-200 bg-white flex items-center justify-center gap-1.5 text-xs font-medium">
                      <PaymentMethodLogo name="Card" size={16} />
                      <span>Card</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toast.success(locale === 'bn' ? 'খরচ সংরক্ষিত হয়েছে!' : 'Expense saved successfully!')}
                  className="w-full py-3 bg-[#179B51] text-white font-bold text-sm rounded-xl shadow-sm hover:bg-[#148344] transition-all cursor-pointer mt-1"
                >
                  {locale === 'bn' ? 'খরচ সংরক্ষণ করুন' : 'Save Expense (৳ 450)'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Natural Spoken Voice AI */}
        <div id="voice" className="bg-white border border-neutral-200 rounded-3xl p-7 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Microphone size={22} weight="bold" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600">
                02. Voice AI Capture
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#171717]">
                {locale === 'bn' ? 'শুধু বলুন আপনি কী খরচ করেছেন।' : 'Just say what you spent.'}
              </h3>
              <p className="text-base text-[#666666] font-normal leading-relaxed">
                {locale === 'bn'
                  ? 'বাংলা, ইংরেজি বা চলতি বাংলিশে কথা বলুন। এআই স্বয়ংক্রিয়ভাবে ক্যাটাগরি, মার্চেন্ট ও টাকার পরিমাণ আলাদা করে সনাক্ত করবে।'
                  : 'Speak naturally in conversational Bangla, English, or mixed phrases. Gemini LLM parses multiple line items in under 300ms.'}
              </p>

              {/* Language Switch Tabs */}
              <div className="flex items-center gap-2 pt-2">
                {(['bn', 'mixed', 'en'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveVoiceTab(tab)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                      activeVoiceTab === tab
                        ? 'bg-[#FBC02B] text-[#171717] shadow-xs'
                        : 'bg-neutral-100 text-[#666666] hover:bg-neutral-200'
                    }`}
                  >
                    {voiceDemos[tab].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#FAFAF7] border border-neutral-200 rounded-2xl p-6 space-y-4">
              {/* Spoken Voice Bar with Animated Audio Waveform */}
              <div className="p-3.5 bg-white border border-neutral-200 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider font-mono">Spoken Audio</span>
                  <p className="text-xs font-semibold text-[#171717] italic">
                    "{voiceDemos[activeVoiceTab].text}"
                  </p>
                </div>

                {/* Animated Wave Bars */}
                <div className="flex items-center gap-0.5 h-6 shrink-0">
                  {[12, 20, 16, 24, 14, 22, 18, 10].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [h, Math.max(6, (h * 1.5) % 24), h] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                      className="w-1 bg-[#179B51] rounded-full"
                    />
                  ))}
                </div>
              </div>

              <div className="text-center font-mono font-bold text-xs text-[#888888]">
                ↓ Extracted & Auto-Categorized
              </div>

              {/* Extracted Items */}
              <div className="space-y-2">
                {voiceDemos[activeVoiceTab].parsed.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white border border-neutral-200 rounded-xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <PaymentMethodLogo name={item.method} size={20} />
                      <div>
                        <p className="text-xs font-bold text-[#171717]">{item.name}</p>
                        <p className="text-[10px] text-[#777777]">{item.category} • {item.method}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-black text-[#179B51]">৳ {item.amount}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="flex-1 py-2.5 bg-white text-[#171717] font-bold text-xs rounded-xl border border-neutral-200 shadow-xs hover:bg-neutral-50 cursor-pointer"
                >
                  Test Microphone
                </button>
                <button
                  type="button"
                  onClick={() => toast.success(locale === 'bn' ? 'ভয়েস খরচ নিশ্চিত হয়েছে!' : 'Voice expense confirmed!')}
                  className="flex-1 py-2.5 bg-[#179B51] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#148344] cursor-pointer"
                >
                  Confirm & Log
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Receipt Vision OCR */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-7 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600">
                <Receipt size={22} weight="bold" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-sky-600">
                03. Vision OCR
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#171717]">
                {locale === 'bn' ? 'রসিদের ছবি থেকে সরাসরি খরচ।' : 'Turn receipts into expenses.'}
              </h3>
              <p className="text-base text-[#666666] font-normal leading-relaxed">
                {locale === 'bn'
                  ? 'কাগজের রসিদের ছবি তুলুন। মার্চেন্টের নাম, মোট টাকা ও প্রতিটি আইটেম স্বয়ংক্রিয়ভাবে এক্সট্র্যাক্ট হয়ে যাবে।'
                  : 'Snap a photo of printed supermarket or pharmacy receipts. Extract merchant, date, VAT, and line items in seconds.'}
              </p>

              <div className="flex items-center gap-2 text-xs font-bold text-[#666666] pt-1">
                <span className="px-2.5 py-1 bg-neutral-100 rounded-lg">Receipt</span>
                <span>→</span>
                <span className="px-2.5 py-1 bg-neutral-100 rounded-lg">Scan</span>
                <span>→</span>
                <span className="px-2.5 py-1 bg-neutral-100 rounded-lg">Extract</span>
                <span>→</span>
                <span className="px-2.5 py-1 bg-[#179B51] text-white rounded-lg">Confirm</span>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#FAFAF7] border border-neutral-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <span className="font-bold text-sm">Receipt Extracted</span>
                <span className="text-xs font-mono font-bold bg-[#179B51]/10 text-[#179B51] px-2.5 py-0.5 rounded-full">
                  17 Aug 2026
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-dashed border-neutral-200">
                  <span className="font-semibold text-[#777777]">Merchant</span>
                  <span className="font-bold text-[#171717]">Shwapno Superstore</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-neutral-200">
                  <span className="font-semibold text-[#777777]">Category</span>
                  <span className="font-bold text-[#171717]">Groceries</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-neutral-200">
                  <span className="font-semibold text-[#777777]">Items Detected</span>
                  <span className="font-bold text-[#171717]">3 Line Items (VAT Included)</span>
                </div>
                <div className="flex justify-between py-2 pt-3 font-bold text-sm border-t border-neutral-200">
                  <span className="text-[#171717]">Total Amount</span>
                  <span className="font-mono text-base font-black text-[#179B51]">৳ 1,850.00</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.success(locale === 'bn' ? 'রসিদ সংরক্ষিত হয়েছে!' : 'Receipt confirmed and saved!')}
                className="w-full py-2.5 bg-[#179B51] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#148344] transition-all cursor-pointer"
              >
                Confirm & Save Receipt
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Monthly Budget Command Section ─── */}
      <section id="budget" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#179B51] bg-[#179B51]/10 px-3 py-1 rounded-full">
            04. Monthly Budgeting
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#171717]">
            {locale === 'bn' ? 'মাসিক বাজেটের ওপর পূর্ণ নিয়ন্ত্রণ।' : 'Stay on top of your monthly budget.'}
          </h3>
          <p className="text-base text-[#666666] font-normal">
            {locale === 'bn'
              ? 'মাসের শুরুতে টার্গেট বাজেট নির্ধারণ করুন এবং কত খরচ হয়েছে ও কত বাকি আছে তা লাইভ ট্র্যাক করুন।'
              : 'Set a starting target, track daily pacing, and avoid unexpected end-of-month budget shocks.'}
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-white border border-neutral-200 rounded-3xl shadow-lg p-7 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <span className="text-xs font-semibold text-[#777777]">Target Budget</span>
              <p className="text-2xl font-black text-[#171717] font-mono">৳ 30,000</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-[#777777]">Remaining</span>
              <p className="text-2xl font-black text-[#179B51] font-mono">৳ 18,450</p>
            </div>
          </div>

          {/* Budget Pacing Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#171717]">
              <span>Spent: ৳ 11,550</span>
              <span>38.5% spent</span>
            </div>
            <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#179B51] rounded-full" style={{ width: '38.5%' }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-bold">
            <div className="p-3 bg-[#FAFAF7] rounded-xl border border-neutral-200/60">
              <p className="text-[#888888] text-[10px]">Daily Average</p>
              <p className="font-mono text-[#171717] font-bold text-sm">৳ 679</p>
            </div>
            <div className="p-3 bg-[#FAFAF7] rounded-xl border border-neutral-200/60">
              <p className="text-[#888888] text-[10px]">Pace Status</p>
              <p className="text-[#179B51] font-bold text-sm">Healthy</p>
            </div>
            <div className="p-3 bg-[#FAFAF7] rounded-xl border border-neutral-200/60">
              <p className="text-[#888888] text-[10px]">Days Left</p>
              <p className="font-mono text-[#171717] font-bold text-sm">14 Days</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Yellow Brand Breakout ─── */}
      <section className="w-full bg-[#FBC02B] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#171717]">
            {locale === 'bn' ? 'সচেতনভাবে খরচ করুন। নিজের টাকা বুঝুন।' : 'Spend intentionally. Understand your money.'}
          </h2>
          <p className="text-base sm:text-lg text-[#171717] font-medium max-w-[50ch] mx-auto">
            {locale === 'bn'
              ? 'খরচ আপনার দৈনন্দিন খরচের হিসাবকে করে তোলে পানির মতো সহজ ও পরিপাটি।'
              : 'Khoroch makes everyday expense tracking simple, fast, and completely stress-free.'}
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-block px-8 py-3.5 rounded-xl text-base font-bold text-[#171717] bg-white shadow-md hover:bg-neutral-50 hover:shadow-lg transition-all"
            >
              {locale === 'bn' ? 'ট্র্যাকিং শুরু করুন' : 'Start Tracking Now'}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Spending Insights ─── */}
      <section id="insights" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#171717]">
            {locale === 'bn' ? 'কোথায় কত খরচ হচ্ছে তার পরিষ্কার চিত্র' : 'Where your money goes'}
          </h3>
          <p className="text-base text-[#666666]">
            {locale === 'bn'
              ? 'ক্যাটাগরি অনুযায়ী খরচের বিশ্লেষণ দেখে বুঝে নিন কোন খাতে বেশি খরচ হচ্ছে।'
              : 'Simple, clear financial analytics without complicated or confusing graphs.'}
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white border border-neutral-200 rounded-3xl shadow-lg p-7 sm:p-8 space-y-5">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-[#171717] mb-1.5">
                <span>Food & Dining</span>
                <span className="font-mono">৳ 4,200 (35%)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#179B51] rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#171717] mb-1.5">
                <span>Utility Bills</span>
                <span className="font-mono">৳ 3,200 (26%)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#179B51] rounded-full" style={{ width: '48%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#171717] mb-1.5">
                <span>Groceries & Shopping</span>
                <span className="font-mono">৳ 2,300 (19%)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#FBC02B] rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#171717] mb-1.5">
                <span>Transportation</span>
                <span className="font-mono">৳ 1,850 (15%)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#171717] rounded-full" style={{ width: '28%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works (01 - 04) ─── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-2xl mb-12 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171717]">
            {locale === 'bn' ? 'সহজ চার ধাপে সম্পূর্ণ নিয়ন্ত্রণ' : 'How Khoroch Works'}
          </h2>
          <p className="text-base text-[#666666]">
            {locale === 'bn'
              ? 'কোনো জটিলতা ছাড়া চার ধাপে আপনার পার্সোনাল ফাইন্যান্স সাজিয়ে নিন।'
              : 'Four straightforward steps to achieve daily clarity.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3 hover:shadow-md transition-shadow">
            <span className="text-3xl font-black text-[#179B51] font-mono block">01</span>
            <h4 className="font-bold text-lg text-[#171717]">
              {locale === 'bn' ? 'বাজেট সেট করুন' : 'Set your budget'}
            </h4>
            <p className="text-xs text-[#666666] leading-relaxed">
              {locale === 'bn'
                ? 'মাসের শুরুতে স্টার্টিং ব্যালেন্স ও খরচের লিমিট নির্ধারণ করুন।'
                : 'Define your starting monthly target and spending boundary.'}
            </p>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3 hover:shadow-md transition-shadow">
            <span className="text-3xl font-black text-[#179B51] font-mono block">02</span>
            <h4 className="font-bold text-lg text-[#171717]">
              {locale === 'bn' ? 'খরচ রেকর্ড করুন' : 'Track expenses'}
            </h4>
            <p className="text-xs text-[#666666] leading-relaxed">
              {locale === 'bn'
                ? 'ভয়েস ইনপুট, রসিদ স্ক্যান বা কুইক ফর্মের মাধ্যমে সহজে রেকর্ড করুন।'
                : 'Log expenses in seconds via voice capture, receipt camera scan, or form.'}
            </p>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3 hover:shadow-md transition-shadow">
            <span className="text-3xl font-black text-[#179B51] font-mono block">03</span>
            <h4 className="font-bold text-lg text-[#171717]">
              {locale === 'bn' ? 'অভ্যাস বুঝুন' : 'Understand habits'}
            </h4>
            <p className="text-xs text-[#666666] leading-relaxed">
              {locale === 'bn'
                ? 'ক্যাটাগরি ও পেমেন্ট চ্যানেল ভিত্তিক হিসাব দেখে খরচ অপ্টিমাইজ করুন।'
                : 'See where money flows across bKash, Nagad, cards, and cash.'}
            </p>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-3 hover:shadow-md transition-shadow">
            <span className="text-3xl font-black text-[#179B51] font-mono block">04</span>
            <h4 className="font-bold text-lg text-[#171717]">
              {locale === 'bn' ? 'নিয়ন্ত্রণে থাকুন' : 'Stay in control'}
            </h4>
            <p className="text-xs text-[#666666] leading-relaxed">
              {locale === 'bn'
                ? 'ইউটিলিটি বিল, সাবস্ক্রিপশন ও ধার-দেনার নিখুঁত ব্যালেন্স বজায় রাখুন।'
                : 'Keep utility bills, memberships, and peer loans settled on time.'}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Final Conversion Banner ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-[#179B51] text-white rounded-3xl p-8 sm:p-14 text-center space-y-5 shadow-xl">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {locale === 'bn'
              ? 'খরচের হিসাব সাজাতে আপনি প্রস্তুত?'
              : 'Ready to take control of your spending?'}
          </h2>
          <p className="text-base sm:text-lg text-emerald-100 font-normal max-w-[48ch] mx-auto leading-relaxed">
            {locale === 'bn'
              ? 'আজই শুরু করুন সম্পূর্ণ বিনামূল্যে। কোনো ক্রেডিট কার্ডের প্রয়োজন নেই।'
              : 'Start tracking your expenses with Khoroch. Free and open source.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold text-[#171717] bg-[#FBC02B] shadow-md hover:bg-amber-400 hover:shadow-lg transition-all cursor-pointer"
            >
              {locale === 'bn' ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন' : 'Get Started Free'}
            </Link>
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-[#171717] shadow-md hover:bg-neutral-900 transition-all cursor-pointer"
            >
              {copiedInstall ? 'Command Copied' : 'Clone on GitHub'}
            </button>
          </div>
        </div>
      </section>

      {/* ─── Clean Dark Footer ─── */}
      <footer className="w-full bg-[#171717] text-[#FAFAF7] py-12 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <img src="/logo-smooth-rounded.svg" alt="খরচ" className="h-7 w-auto object-contain bg-white rounded p-0.5" />
              <span className="font-bold text-base text-[#FAFAF7]">Khoroch</span>
            </div>
            <p className="text-xs text-[#999999]">
              {locale === 'bn' ? 'নিজের খরচ ট্র্যাক করুন। টাকাকে বুঝুন।' : 'Track your spending. Understand your money.'}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-[#999999]">
            <a href="#features" className="hover:text-[#FBC02B] transition-colors">{locale === 'bn' ? 'ফিচারসমূহ' : 'Features'}</a>
            <a href="#how-it-works" className="hover:text-[#FBC02B] transition-colors">{locale === 'bn' ? 'কীভাবে কাজ করে' : 'How It Works'}</a>
            <Link href="/login" className="hover:text-[#FBC02B] transition-colors">{t.login}</Link>
            <Link href="/register" className="hover:text-[#FBC02B] transition-colors">{t.register}</Link>
            <a
              href="https://github.com/tarek-codes/Khoroch-AI-Powered-Expense-Tracker"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#FBC02B] transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="text-xs text-[#777777] font-mono">
            © {new Date().getFullYear()} Khoroch. All rights reserved.
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
