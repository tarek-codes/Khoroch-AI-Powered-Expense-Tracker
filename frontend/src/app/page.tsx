'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkle,
  Microphone,
  Receipt,
  Lightning,
  ArrowsLeftRight,
  ChartBar,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle,
  Clock,
  Wallet,
  Play,
  FileText,
  ArrowsClockwise,
  User,
  Star,
  CaretDown,
  LockKey,
  CurrencyDollar,
  DeviceMobile,
  Buildings,
  Check,
  Copy,
} from '@phosphor-icons/react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useAppStore } from '@/store/appStore';
import { translations, toBengaliNumber } from '@/lib/i18n';
import { VoiceModal } from '@/components/VoiceModal';
import { toast } from 'sonner';

export default function LandingPage() {
  const router = useRouter();
  const { user, isHydrated, locale, setLocale, theme, setTheme } = useAppStore();
  const t = translations[locale];

  const [activeTab, setActiveTab] = useState<'voice' | 'ocr' | 'bills' | 'ledger'>('voice');
  const [selectedVoiceSample, setSelectedVoiceSample] = useState(0);
  const [simulatedParsed, setSimulatedParsed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const voiceSamples = [
    {
      localeLabel: 'Bangla (বাংলা)',
      phrase: 'রিকশা ভাড়া ৫০ টাকা এবং কাঁচাবাজারে ৮৫০ টাকা বিকাশে দিলাম',
      englishPhrase: 'Rickshaw fare 50 taka and grocery 850 taka paid with bKash',
      parsedItems: [
        { category: 'Transportation', categoryBn: 'যাতায়াত', amount: 50, merchant: 'Rickshaw', method: 'Cash' },
        { category: 'Groceries', categoryBn: 'বাজার-সদাই', amount: 850, merchant: 'Kacha Bazar', method: 'bKash' },
      ],
    },
    {
      localeLabel: 'Benglish (মিক্সড)',
      phrase: 'Uber ride 250 taka and dinner 680 taka নগদে পরিশোধ করেছি',
      englishPhrase: 'Uber ride 250 taka and dinner 680 taka paid via Nagad',
      parsedItems: [
        { category: 'Transportation', categoryBn: 'যাতায়াত', amount: 250, merchant: 'Uber', method: 'Credit Card' },
        { category: 'Food & Dining', categoryBn: 'খাবার', amount: 680, merchant: 'Restaurant', method: 'Nagad' },
      ],
    },
    {
      localeLabel: 'English',
      phrase: 'Paid Dot Internet bill 1200 taka and ChatGPT subscription 2400 taka',
      englishPhrase: 'Paid Dot Internet bill 1200 taka and ChatGPT subscription 2400 taka',
      parsedItems: [
        { category: 'Utility Bills', categoryBn: 'ইউটিলিটি বিল', amount: 1200, merchant: 'Dot Internet', method: 'bKash' },
        { category: 'Subscriptions', categoryBn: 'সাবস্ক্রিপশন', amount: 2400, merchant: 'OpenAI ChatGPT', method: 'Card' },
      ],
    },
  ];

  const faqs = [
    {
      q: locale === 'bn' ? 'খরচ কীভাবে বাংলা ও ইংরেজি ভয়েস বোঝে?' : 'How does Khoroch understand mixed Bangla and English voice?',
      a: locale === 'bn'
        ? 'আমাদের এআই ইঞ্জিন উন্নত স্পিচ রিকগনিশন ও গুগল জেমিনি এলএলএম মডেল ব্যবহার করে বাংলা, ইংরেজি এবং বাংলিশ (বাঙালি চলতি মিশ্র ভাষা) থেকে স্বয়ংক্রিয়ভাবে মার্চেন্ট, খরচ, ক্যাটাগরি ও পেমেন্ট চ্যানেল আলাদা করতে পারে।'
        : 'Our AI engine pairs Web Audio speech processing with Google Gemini Flash LLM to parse phonetic Bangla, English, and everyday Benglish into structured line-item expenses in milliseconds.',
    },
    {
      q: locale === 'bn' ? 'আমার আর্থিক ডেটা কতটা সুরক্ষিত?' : 'Is my financial data secure and private?',
      a: locale === 'bn'
        ? 'আপনার ডেটা ১০০% এনক্রিপ্টেড এবং পোস্টগ্রেসকিউএল রিলেশনাল ডেটাবেসে নিরাপদে সংরক্ষিত থাকে। কোন তৃতীয় পক্ষের কাছে আপনার তথ্য শেয়ার বা বিক্রি করা হয় না।'
        : 'Your data is strictly isolated with JWT authentication and stored in an enterprise PostgreSQL database. We do not sell or monetize personal financial records.',
    },
    {
      q: locale === 'bn' ? 'বিকাশ, নগদ বা ডেবিট কার্ডের সাথে কি সংযুক্ত করা যায়?' : 'Does it support bKash, Nagad, Rocket, and Bangladeshi Bank Cards?',
      a: locale === 'bn'
        ? 'হ্যাঁ! খরচ-এ বিকাশ, নগদ, রকেট, ব্যাংক কার্ড ও ক্যাশ সহ বাংলাদেশের সকল জনপ্রিয় পেমেন্ট চ্যানেলের জন্য ডেডিকেটেড ব্যালেন্স ট্র্যাকিং ও আইকন সাপোর্ট রয়েছে।'
        : 'Yes! Khoroch has built-in support and logos for bKash, Nagad, Rocket, City Bank, BRAC Bank, standard VISA/Mastercards, and cash wallets.',
    },
    {
      q: locale === 'bn' ? 'ধার ও দেনা (Lend & Borrow) কীভাবে কাজ করে?' : 'How does the Lend & Borrow ledger calculate debt balance?',
      a: locale === 'bn'
        ? 'কাউকে টাকা ধার দিলে বা কারও থেকে ধার নিলে তা ব্যক্তির নাম ও তারিখসহ যুক্ত করা যায়। পরিশোধের সাথে সাথে এক ক্লিকে সেটেলমেন্ট ও ওয়ালেট ব্যালেন্স সমন্বয় হয়ে যায়।'
        : 'Whenever you lend money to someone or borrow for cashflow, you can log it with due dates. Settle it with one click when paid back, keeping your wallet perfectly balanced.',
    },
    {
      q: locale === 'bn' ? 'খরচ ব্যবহার কি বিনামূল্যে?' : 'Is Khoroch completely free to use?',
      a: locale === 'bn'
        ? 'হ্যাঁ! খরচ-এর সমস্ত কোর ফিচার—ভয়েস এন্ট্রি, রসিদ ওসিআর, ইউটিলিটি বিল, সাবস্ক্রিপশন ও ঋণ খাতা সম্পূর্ণ বিনামূল্যে ব্যবহারের জন্য উন্মুক্ত।'
        : 'Yes! All core modules including Voice Parsing, Receipt OCR, Utility Bills, Subscriptions, and Debt Ledgers are 100% free to use.',
    },
  ];

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('git clone https://github.com/tarek-codes/Khoroch-AI-Powered-Expense-Tracker.git');
    setCopiedCode(true);
    toast.success(locale === 'bn' ? 'কমান্ড কপি করা হয়েছে!' : 'Repository clone command copied!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div
      className="min-h-screen selection:bg-emerald-500 selection:text-white transition-colors duration-150 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-page)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans), sans-serif',
      }}
    >
      {/* ─── Ambient Glow Gradients (Emerald & Warm Gold Palette) ─── */}
      <div
        className="absolute w-[680px] h-[680px] rounded-full pointer-events-none opacity-20 blur-[130px] -top-40 -left-40"
        style={{ background: 'radial-gradient(circle, #059669 0%, #d97706 40%, transparent 70%)' }}
      />
      <div
        className="absolute w-[580px] h-[580px] rounded-full pointer-events-none opacity-15 blur-[120px] top-[40%] -right-40"
        style={{ background: 'radial-gradient(circle, #f59e0b 0%, #10b981 50%, transparent 75%)' }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-10 blur-[140px] bottom-0 left-[20%]"
        style={{ background: 'radial-gradient(circle, #047857 0%, #b45309 60%, transparent 80%)' }}
      />

      {/* ─── Top Sticky Glassmorphism Header ─── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b transition-colors"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(9, 13, 22, 0.75)' : 'rgba(255, 255, 255, 0.82)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo-smooth-rounded.svg"
              alt="খরচ Logo"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md border"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                  color: '#d97706',
                }}
              >
                Fintech AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-extrabold tracking-tight">
            <a href="#features" className="transition-colors hover:text-emerald-500" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn' ? 'ফিচারসমূহ' : 'Features'}
            </a>
            <a href="#voice-engine" className="transition-colors hover:text-emerald-500" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn' ? 'ভয়েস এআই' : 'Voice AI'}
            </a>
            <a href="#modules" className="transition-colors hover:text-emerald-500" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn' ? 'ইউটিলিটি ও ঋণ খাতা' : 'Bills & Ledger'}
            </a>
            <a href="#security" className="transition-colors hover:text-emerald-500" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn' ? 'নিরাপত্তা' : 'Security'}
            </a>
            <a href="#faq" className="transition-colors hover:text-emerald-500" style={{ color: 'var(--text-secondary)' }}>
              FAQ
            </a>
          </nav>

          {/* Controls & CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer hover:border-amber-500/50 shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
              title="Toggle Language"
            >
              <Globe size={14} weight="bold" className="text-amber-500" />
              <span>{locale === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Light / Dark Mode Toggle */}
            <ToggleGroup.Root
              type="single"
              value={theme}
              onValueChange={(val) => {
                if (val) setTheme(val as 'light' | 'dark');
              }}
              className="hidden sm:flex p-0.5 rounded-full border shadow-2xs"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <ToggleGroup.Item
                value="light"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  theme === 'light' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Light Mode"
              >
                <Sun size={13} weight={theme === 'light' ? 'fill' : 'bold'} />
              </ToggleGroup.Item>
              <ToggleGroup.Item
                value="dark"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  theme === 'dark' ? 'bg-zinc-800 text-amber-400 shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Dark Mode"
              >
                <Moon size={13} weight={theme === 'dark' ? 'fill' : 'bold'} />
              </ToggleGroup.Item>
            </ToggleGroup.Root>

            {/* Launch App / Login */}
            {isHydrated && user ? (
              <Link
                href="/dashboard"
                className="btn-accent flex items-center gap-2 px-4.5 py-2.2 rounded-full text-xs font-black shadow-md cursor-pointer transition-all hover:scale-103"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #d97706 100%)',
                  color: '#ffffff',
                }}
              >
                <span>{locale === 'bn' ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Launch Dashboard'}</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-full text-xs font-extrabold transition-colors hover:text-emerald-500"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs font-black shadow-md cursor-pointer transition-all hover:scale-103 text-white"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #ca8a04 100%)',
                  }}
                >
                  <span>{locale === 'bn' ? 'ফ্রি শুরু করুন' : 'Get Started'}</span>
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── 1. Hero Section (Fintech Emerald & Gold Theme) ─── */}
      <section className="relative pt-12 pb-20 sm:pt-18 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm backdrop-blur-md transition-all hover:scale-102"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(245, 158, 11, 0.15) 100%)',
              borderColor: 'rgba(217, 119, 6, 0.35)',
            }}
          >
            <Sparkle size={15} weight="fill" className="text-amber-500 animate-pulse" />
            <span className="text-xs font-extrabold tracking-wide" style={{ color: '#d97706' }}>
              {locale === 'bn' ? 'খরচ ২.০ • বাংলা ও ইংরেজি এআই ফিনটেক প্ল্যাটফর্ম' : 'Khoroch 2.0 • Intelligent Bilingual Fintech Engine'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Hero Title & Value Proposition */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.12]">
            <span>{locale === 'bn' ? 'দৈনন্দিন খরচের সম্পূর্ণ হিসাব — ' : 'Master Your Expenses in Seconds with '}</span>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #10b981 0%, #f59e0b 50%, #10b981 100%)',
              }}
            >
              {locale === 'bn' ? 'এআই ভয়েস ও রসিদ স্ক্যানারে' : 'Voice AI & Vision OCR'}
            </span>
          </h1>

          <p
            className="text-base sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {locale === 'bn'
              ? 'কথা বলে বা রসিদের ছবি তুলে চোখের পলকে খরচ লিপিবদ্ধ করুন। বিদ্যুৎ-গ্যাস-ইন্টারনেট বিল, সাবস্ক্রিপশন ও ধার-দেনার নিখুঁত হিসাব এক প্ল্যাটফর্মে।'
              : 'Designed for modern Bangladesh and global workflows. Log expenses naturally in spoken Bangla or English, manage utility bills, track memberships, and settle debts with one click.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-black text-white shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-103 hover:shadow-xl cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #d97706 100%)',
                boxShadow: '0 10px 30px -8px rgba(16, 185, 129, 0.45)',
              }}
            >
              <span>{locale === 'bn' ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন' : 'Start Tracking for Free'}</span>
              <ArrowRight size={18} weight="bold" />
            </Link>

            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl text-base font-extrabold border flex items-center justify-center gap-2.5 transition-all hover:border-amber-500/60 shadow-xs cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'rgba(217, 119, 6, 0.35)',
                color: 'var(--text-primary)',
              }}
            >
              <Microphone size={19} weight="fill" className="text-red-500 animate-pulse" />
              <span>{locale === 'bn' ? 'লাইভ ভয়েস ট্রাই করুন' : 'Try Live Voice Demo'}</span>
            </button>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-extrabold" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-2">
              <CheckCircle size={17} weight="fill" className="text-emerald-500" />
              <span>{locale === 'bn' ? '১০০% ফ্রি ও ওপেন সোর্স' : '100% Free & Open Source'}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} weight="fill" className="text-amber-500" />
              <span>{locale === 'bn' ? 'সম্পূর্ণ এনক্রিপ্টেড ডেটা' : 'Private & JWT Secured'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lightning size={17} weight="fill" className="text-teal-500" />
              <span>{locale === 'bn' ? '০.৩ সেকেন্ড দ্রুত পার্সিং' : '0.3s Instant AI Extraction'}</span>
            </div>
          </div>
        </div>

        {/* ─── 2. Interactive Live Showcase Widget (Gold-Trimmed Glass Frame) ─── */}
        <div className="mt-14 sm:mt-18 relative max-w-5xl mx-auto">
          {/* Golden Outer Glow Ring */}
          <div
            className="absolute -inset-1.5 rounded-3xl opacity-60 blur-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 50%, #059669 100%)',
            }}
          />

          {/* Main Card Container */}
          <div
            className="relative rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-xl"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(13, 18, 30, 0.92)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: 'rgba(245, 158, 11, 0.4)',
            }}
          >
            {/* Widget Header Toolbar */}
            <div
              className="px-6 py-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(9, 13, 22, 0.8)' : 'rgba(248, 250, 252, 0.9)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {/* Window Controls & Live Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider pl-2" style={{ color: '#d97706' }}>
                  Interactive Simulator
                </span>
              </div>

              {/* Module Tabs */}
              <div
                className="flex items-center gap-1 p-1 rounded-2xl border"
                style={{
                  backgroundColor: 'var(--bg-surface-sunken)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                {[
                  { id: 'voice', label: locale === 'bn' ? 'ভয়েস এআই' : 'Voice AI', icon: Microphone },
                  { id: 'ocr', label: locale === 'bn' ? 'রসিদ ওসিআর' : 'Receipt OCR', icon: Receipt },
                  { id: 'bills', label: locale === 'bn' ? 'ইউটিলিটি বিল' : 'Utility Bills', icon: Lightning },
                  { id: 'ledger', label: locale === 'bn' ? 'ধার ও দেনা' : 'Debt Ledger', icon: ArrowsLeftRight },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setSimulatedParsed(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'hover:text-emerald-500 text-slate-400'
                      }`}
                    >
                      <Icon size={14} weight="bold" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Preview Canvas */}
            <div className="p-6 sm:p-8">
              {activeTab === 'voice' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        {locale === 'bn' ? 'ভয়েস এন্ট্রি সিমুলেটর (Bangla & English)' : 'Live Spoken Expense Parser'}
                      </h3>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {locale === 'bn' ? 'যেকোনো একটি নমুনা বাক্যে ক্লিক করুন এবং এআই ফলাফল দেখুন:' : 'Click any spoken sample to test the instant extraction pipeline:'}
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full font-black border"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        color: '#059669',
                      }}
                    >
                      Gemini Flash Powered
                    </span>
                  </div>

                  {/* Sample Phrases Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {voiceSamples.map((sample, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedVoiceSample(idx);
                          setSimulatedParsed(true);
                        }}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                          selectedVoiceSample === idx
                            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5'
                            : 'hover:border-emerald-500/50 hover:bg-emerald-500/5'
                        }`}
                        style={{
                          backgroundColor: selectedVoiceSample === idx ? undefined : 'var(--bg-surface-sunken)',
                          borderColor: selectedVoiceSample === idx ? '#f59e0b' : 'var(--border-subtle)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500">
                            {sample.localeLabel}
                          </span>
                          <Microphone size={14} weight="fill" className="text-amber-500" />
                        </div>
                        <p className="text-xs font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                          "{sample.phrase}"
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Real-time Parsed Results Box */}
                  <div
                    className="p-5 rounded-2xl border space-y-3"
                    style={{
                      backgroundColor: 'var(--bg-surface-sunken)',
                      borderColor: 'rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={18} weight="fill" className="text-emerald-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
                          {locale === 'bn' ? 'এআই পার্সড আইটেম সমূহ' : 'AI Extracted Transactions'}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-amber-500 font-mono">
                        Latency: 280ms
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {voiceSamples[selectedVoiceSample].parsedItems.map((item, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl border flex items-center justify-between shadow-2xs"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-subtle)',
                          }}
                        >
                          <div className="space-y-0.5">
                            <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                              {item.merchant}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                              <span>{locale === 'bn' ? item.categoryBn : item.category}</span>
                              <span>•</span>
                              <span className="text-emerald-600 font-extrabold">{item.method}</span>
                            </div>
                          </div>
                          <p className="text-base font-black text-emerald-600 font-mono">
                            {locale === 'bn' ? `${toBengaliNumber(item.amount)} ৳` : `${item.amount} ৳`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ocr' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                      Receipt Vision OCR
                    </span>
                    <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      {locale === 'bn' ? 'যেকোনো রসিদের ছবি থেকে স্বয়ংক্রিয় এন্ট্রি' : 'Instant Multi-Item Receipt Breakdown'}
                    </h3>
                    <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {locale === 'bn'
                        ? 'সুপারশপ, রেস্তোরাঁ কিংবা ফার্মেসির রসিদ ড্রপ করলেই জেমিনি ভিশন প্রতিটি আইটেমের মূল্য, ভ্যাট এবং ডিসকাউন্ট সহ নিখুঁতভাবে সংরক্ষণ করে।'
                        : 'Simply snap a photo of any printed receipt or invoice. Khoroch extracts itemized lists, taxes, discounts, and uploads proof directly to secure cloud storage.'}
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="px-3 py-1.5 rounded-xl text-xs font-extrabold border bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                        {locale === 'bn' ? 'আইটেমাইজড ব্রেকডাউন' : 'Itemized Lines'}
                      </div>
                      <div className="px-3 py-1.5 rounded-xl text-xs font-extrabold border bg-amber-500/10 text-amber-600 border-amber-500/30">
                        {locale === 'bn' ? 'ক্লাউড ব্যাকআপ' : 'Cloudinary Backup'}
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-5 rounded-2xl border space-y-3 font-mono text-xs shadow-sm"
                    style={{
                      backgroundColor: 'var(--bg-surface-sunken)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    <div className="border-b pb-2 flex justify-between font-bold" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span>Shwapno Superstore #402</span>
                      <span className="text-emerald-500">PAID (bKash)</span>
                    </div>
                    <div className="space-y-1.5 text-[12px]">
                      <div className="flex justify-between">
                        <span>1x Fresh Milk 1L</span>
                        <span className="font-bold">95.00 ৳</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2x ACI Pure Salt 1kg</span>
                        <span className="font-bold">80.00 ৳</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1x Farm Eggs (Dozen)</span>
                        <span className="font-bold">155.00 ৳</span>
                      </div>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-black text-sm text-amber-500" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span>TOTAL BILLED</span>
                      <span>330.00 ৳</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bills' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { provider: 'DESCO Electricity', month: 'Aug 2026', amount: 2450, status: 'unpaid', due: '25 Aug', icon: Lightning, color: '#f59e0b' },
                    { provider: 'Dot Internet Fiber', month: 'Aug 2026', amount: 1200, status: 'paid', due: '10 Aug', icon: Globe, color: '#10b981' },
                    { provider: 'Dhaka WASA Water', month: 'Aug 2026', amount: 680, status: 'paid', due: '15 Aug', icon: Buildings, color: '#0ea5e9' },
                  ].map((bill, idx) => (
                    <div
                      key={idx}
                      className="p-4.5 rounded-2xl border space-y-3 shadow-2xs"
                      style={{
                        backgroundColor: 'var(--bg-surface-sunken)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: `${bill.color}20`, color: bill.color }}
                        >
                          <bill.icon size={18} weight="bold" />
                        </div>
                        <span
                          className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            bill.status === 'paid'
                              ? 'bg-emerald-500/15 text-emerald-600'
                              : 'bg-rose-500/15 text-rose-600'
                          }`}
                        >
                          {bill.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{bill.provider}</h4>
                        <p className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Due: {bill.due}</p>
                      </div>
                      <div className="pt-2 border-t flex items-center justify-between font-mono" style={{ borderColor: 'var(--border-subtle)' }}>
                        <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Amount</span>
                        <span className="text-base font-black text-emerald-600">{bill.amount} ৳</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'ledger' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div>
                      <h4 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>
                        {locale === 'bn' ? 'ধার ও দেনার হিসাব বিবরণী (Lend & Borrow)' : 'Unified Debt & Lending Ledger'}
                      </h4>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {locale === 'bn' ? 'কারও কাছে টাকা পাওনা বা পরিশোধের নিখুঁত ট্র্যাকিং' : 'One-click settlements with automated wallet adjustments'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                        Net: +12,500 ৳
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div
                      className="p-4 rounded-xl border flex items-center justify-between"
                      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 flex items-center justify-center font-bold text-xs">
                          Lent
                        </div>
                        <div>
                          <p className="font-extrabold text-xs" style={{ color: 'var(--text-primary)' }}>Rafiqul Islam</p>
                          <p className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Emergency medical loan</p>
                        </div>
                      </div>
                      <p className="text-base font-black font-mono text-rose-500">+15,000 ৳</p>
                    </div>

                    <div
                      className="p-4 rounded-xl border flex items-center justify-between"
                      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-600 flex items-center justify-center font-bold text-xs">
                          Borrow
                        </div>
                        <div>
                          <p className="font-extrabold text-xs" style={{ color: 'var(--text-primary)' }}>Tanvir Ahmed</p>
                          <p className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Office lunch bill share</p>
                        </div>
                      </div>
                      <p className="text-base font-black font-mono text-sky-500">-2,500 ৳</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Core Feature Pillars (Green & Gold Accents) ─── */}
      <section id="features" className="py-20 border-t relative" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border"
              style={{
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                borderColor: 'rgba(217, 119, 6, 0.3)',
                color: '#d97706',
              }}
            >
              Engineered for Speed
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {locale === 'bn' ? 'খরচ কেন সবার চেয়ে আলাদা?' : 'Why Modern Teams & Individuals Choose Khoroch'}
            </h2>
            <p className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn'
                ? 'জটিল স্প্রেডশিট আর বিরক্তিকর ম্যানুয়াল এন্ট্রির দিন শেষ। আধুনিক ফিনটেক এআই আপনার আর্থিক নিয়ন্ত্রণ সহজ করে।'
                : 'No more clumsy spreadsheets or manual math. Effortlessly bridge daily cashflow with automated intelligence.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {/* Pillar 1: Voice AI */}
            <div
              className="p-8 rounded-3xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'rgba(16, 185, 129, 0.35)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#ffffff',
                }}
              >
                <Microphone size={28} weight="bold" />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
                {locale === 'bn' ? '১০০% লোকাল ভয়েস এআই' : 'Zero-Effort Voice Capture'}
              </h3>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'bn'
                  ? 'চলতি বাংলা, ইংরেজি বা বাংলিশ যেভাবেই কথা বলুন না কেন, তাৎক্ষণিক ক্যাটাগরি, মার্চেন্ট ও টাকার অংক আলাদা হয়ে রেকর্ড হয়ে যাবে।'
                  : 'Speak natural mixed sentences on the go. Khoroch automatically identifies transaction intent, amounts, and payment methods.'}
              </p>
            </div>

            {/* Pillar 2: Receipt OCR */}
            <div
              className="p-8 rounded-3xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'rgba(245, 158, 11, 0.35)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
                  color: '#ffffff',
                }}
              >
                <Receipt size={28} weight="bold" />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
                {locale === 'bn' ? 'স্মার্ট রসিদ স্ক্যানার' : 'Intelligent Receipt Vision'}
              </h3>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'bn'
                  ? 'কাগজের রসিদের ছবি তুলুন; জেমিনি ভিশন মডেল প্রতিটি পণ্যের নাম ও দাম আলাদা করে আপনার হিসাবে যুক্ত করবে।'
                  : 'Snap a photo of grocery, restaurant, or electronics receipts. Extract itemized breakdowns with automatic tax and discount parsing.'}
              </p>
            </div>

            {/* Pillar 3: Complete Local Ecosystem */}
            <div
              className="p-8 rounded-3xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group"
              style={{
                backgroundColor: 'var(--bg-surface-sunken)',
                borderColor: 'rgba(16, 185, 129, 0.35)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  color: '#ffffff',
                }}
              >
                <Wallet size={28} weight="bold" />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
                {locale === 'bn' ? 'বাংলাদেশি ফিনটেক ইকোসিস্টেম' : 'Full Bangladeshi Ecosystem'}
              </h3>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'bn'
                  ? 'বিকাশ, নগদ, রকেট, ব্যাংক কার্ড ও ক্যাশ সহ ডেপ্থ সাপোর্ট। ডেসকো, নেসকো, ওয়াসা, তিতাস গ্যাস ও ব্রডব্যান্ড বিলের ডেডিকেটেড ট্র্যাকার।'
                  : 'Native support for bKash, Nagad, Rocket, local cards, and cash. Track utilities like DESCO, DPDC, WASA, Titas Gas with one click.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Modules Deep Dive (Bills, Subscriptions & Loans) ─── */}
      <section id="modules" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-black uppercase tracking-wider"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#059669',
              }}
            >
              Complete Command Center
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {locale === 'bn' ? 'ইউটিলিটি বিল, সাবস্ক্রিপশন ও ঋণ — সব এক ছাদের নিচে' : 'Manage Recurring Obligations with Precision'}
            </h2>
            <p className="text-sm sm:text-base font-semibold leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn'
                ? 'মাসিক বিদ্যুৎ বা ইন্টারনেট বিল বাকি পড়লে নোটিফিকেশন পান। নেটফ্লিক্স বা ক্লাউড সাবস্ক্রিপশন অটো-রিনিউ হওয়ার আগেই সতর্ক থাকুন। কারও সাথে ধার-দেনার হিসাব নিয়ে আর কোন ভুল বোঝাবুঝি নয়।'
                : 'Stay ahead of monthly utility deadlines and software auto-renewals. Keep transparent, timestamped records for all lent and borrowed amounts.'}
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <p className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'বিল পরিশোধ করার সাথে সাথে এক ক্লিকে ওয়ালেট ব্যালেন্স সমন্বয়' : '1-Click budget deduction upon marking utility bills as paid'}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <p className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'সাপ্তাহিক, মাসিক ও বার্ষিক সাবস্ক্রিপশন ক্যাটাগরি ও রিনিউয়াল অ্যালার্ট' : 'Categorized billing cycles for Spotify, Netflix, ChatGPT, AWS, & Domains'}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <p className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'ধার ও দেনার নিখুঁত হিসাব ও অটোমেটিক নেট ব্যালেন্স হিসেব' : 'Real-time Net Debt position across all friends and family'}
                </p>
              </div>
            </div>
          </div>

          {/* Graphical Mock Display */}
          <div
            className="p-7 rounded-3xl border shadow-xl relative overflow-hidden space-y-4"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'rgba(217, 119, 6, 0.3)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <p className="text-xs font-black uppercase text-amber-500 tracking-wider">Monthly Breakdown</p>
                <h4 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Budget Utilization</h4>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 font-mono">
                74% Pace Normal
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-surface-sunken)', borderColor: 'var(--border-subtle)' }}>
                <p className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>Active Subscriptions</p>
                <p className="text-2xl font-black text-emerald-600 font-mono mt-1">8 Services</p>
                <p className="text-[11px] font-bold text-amber-500 mt-1">4,850 ৳ / month</p>
              </div>
              <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-surface-sunken)', borderColor: 'var(--border-subtle)' }}>
                <p className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>Utility Bills Due</p>
                <p className="text-2xl font-black text-rose-500 font-mono mt-1">1 Unpaid</p>
                <p className="text-[11px] font-bold text-slate-400 mt-1">DESCO (Due in 3d)</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-surface-sunken)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-500 flex items-center justify-center font-black">
                  ৳
                </div>
                <div>
                  <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>Net Lending Position</p>
                  <p className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>3 Settled this month</p>
                </div>
              </div>
              <span className="text-base font-black text-emerald-600 font-mono">+12,500 ৳</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. Security & Data Architecture ─── */}
      <section id="security" className="py-20 border-t" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#059669',
              }}
            >
              Enterprise Security
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {locale === 'bn' ? 'আপনার আর্থিক তথ্যের পূর্ণ গোপনীয়তা' : 'Your Financial Sovereignty & Data Privacy'}
            </h2>
            <p className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn'
                ? 'আমরা গ্রাহকের আর্থিক তথ্যের সুরক্ষাকে সর্বোচ্চ অগ্রাধিকার দিই। ক্লাউড বা সেলফ-হোস্টেড যেকোনো পরিবেশে নিরাপদ।'
                : 'Every token, query, and receipt is protected with industry-standard cryptographic principles.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { title: locale === 'bn' ? 'পোস্টগ্রেস এসিড স্থায়িত্ব' : 'PostgreSQL Durability', desc: locale === 'bn' ? 'প্রতিটি লেনদেন রিলেশনাল ডেটাবেসে নির্ভরযোগ্যভাবে সংরক্ষিত হয়।' : 'Full transactional consistency with composite indexes for lightning speed.', icon: ShieldCheck },
              { title: locale === 'bn' ? 'জেডাব্লিউটি টোকেন অথেনটিকেশন' : 'JWT Stateless Auth', desc: locale === 'bn' ? 'পাসপোর্ট ও বিসিআরওয়াইপিটি এনক্রিপশন দ্বারা অ্যাকাউন্ট সুরক্ষিত।' : 'Bcrypt-hashed passwords with cryptographic session token validation.', icon: LockKey },
              { title: locale === 'bn' ? 'জিরো ট্র্যাকার বা সেল' : 'Zero Data Selling', desc: locale === 'bn' ? 'কোনো তৃতীয় পক্ষের ট্র্যাকার বা ডেটা বিক্রির সুযোগ নেই।' : 'No ads, no data broker selling, and zero third-party telemetry.', icon: CheckCircle },
              { title: locale === 'bn' ? 'ওপেন সোর্স সক্ষমতা' : 'Self-Host Ready', desc: locale === 'bn' ? 'সম্পূর্ণ সোর্স কোড উন্মুক্ত; চাইলে নিজের সার্ভারেও চালাতে পারেন।' : 'Deploy on your own VPS or private infrastructure in minutes.', icon: Sparkle },
            ].map((sec, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border space-y-2 shadow-2xs"
                style={{
                  backgroundColor: 'var(--bg-surface-sunken)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-3">
                  <sec.icon size={22} weight="bold" />
                </div>
                <h4 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{sec.title}</h4>
                <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. Frequently Asked Questions Accordion ─── */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-500">FAQ</span>
          <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {locale === 'bn' ? 'সাধারণ জিজ্ঞাসাসমূহ' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border transition-all overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: isOpen ? '#f59e0b' : 'var(--border-subtle)',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-sm sm:text-base cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span>{faq.q}</span>
                  <CaretDown
                    size={18}
                    weight="bold"
                    className={`shrink-0 transition-transform text-amber-500 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm font-semibold leading-relaxed border-t pt-3" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 7. High-Conversion Emerald & Gold Call to Action ─── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl border"
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 45%, #b45309 100%)',
            borderColor: 'rgba(245, 158, 11, 0.4)',
          }}
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {locale === 'bn'
                ? 'আজই আপনার দৈনন্দিন খরচের পূর্ণ নিয়ন্ত্রণ নিন'
                : 'Ready to Experience the Future of Expense Tracking?'}
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 font-semibold leading-relaxed">
              {locale === 'bn'
                ? 'কোন ক্রেডিট কার্ড লাগবে না। ৩০ সেকেন্ডে অ্যাকাউন্ট খুলে আজই শুরু করুন আধুনিক এআই ফিনটেক অভিজ্ঞতা।'
                : 'Create your account in 30 seconds. 100% free, full bilingual voice recognition, and infinite financial clarity.'}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-9 py-4 rounded-2xl text-base font-black text-emerald-950 shadow-xl bg-white transition-all hover:scale-105 hover:bg-emerald-50 cursor-pointer"
              >
                {locale === 'bn' ? 'বিনামূল্যে শুরু করুন' : 'Get Started for Free'}
              </Link>
              <button
                onClick={handleCopyInstall}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl text-base font-extrabold border border-white/30 text-white flex items-center justify-center gap-2 transition-all hover:bg-white/10 cursor-pointer"
              >
                {copiedCode ? <Check size={18} weight="bold" /> : <Copy size={18} weight="bold" />}
                <span>{locale === 'bn' ? 'গিট ক্লোন কমান্ড' : 'Clone on GitHub'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. Modern Minimal Footer ─── */}
      <footer className="border-t py-12" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo-smooth-rounded.svg" alt="খরচ" className="h-8 w-auto object-contain" />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              © {new Date().getFullYear()} Khoroch (খরচ). Built with Next.js 15, React 19 & NestJS.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-extrabold" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/login" className="hover:text-emerald-500 transition-colors">{t.login}</Link>
            <Link href="/register" className="hover:text-emerald-500 transition-colors">{t.register}</Link>
            <a
              href="https://github.com/tarek-codes/Khoroch-AI-Powered-Expense-Tracker"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-500 transition-colors"
            >
              GitHub Repo
            </a>
          </div>
        </div>
      </footer>

      {/* Voice Modal for Live Demo */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSuccess={() => {
          setIsVoiceModalOpen(false);
          toast.success(locale === 'bn' ? 'ভয়েস সফলভাবে প্রসেস হয়েছে!' : 'Voice successfully processed!');
        }}
        categories={[]}
        paymentMethods={[]}
      />
    </div>
  );
}
