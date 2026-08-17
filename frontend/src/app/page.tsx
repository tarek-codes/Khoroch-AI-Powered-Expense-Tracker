'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Tag,
  Camera,
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

  // Interactive quick expense demo state
  const [demoAmount, setDemoAmount] = useState('450');
  const [demoCategory, setDemoCategory] = useState('Food & Dining');
  const [demoMethod, setDemoMethod] = useState('bKash');

  const voiceDemos = {
    bn: {
      label: 'বাংলা',
      text: 'রিকশা ভাড়া ৫০ টাকা এবং কাঁচাবাজারে ৮৫০ টাকা বিকাশে দিলাম',
      parsed: [
        { name: 'Kacha Bazar', category: 'Groceries', amount: 850, method: 'bKash' },
        { name: 'Rickshaw', category: 'Transportation', amount: 50, method: 'Cash' },
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

  const handleCopy = () => {
    navigator.clipboard.writeText('git clone https://github.com/tarek-codes/Khoroch-AI-Powered-Expense-Tracker.git');
    setCopiedInstall(true);
    toast.success(locale === 'bn' ? 'গিট ক্লোন কমান্ড কপি হয়েছে!' : 'Clone command copied to clipboard!');
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  return (
    <div
      className="min-h-screen text-[#171717] selection:bg-[#179B51] selection:text-white"
      style={{
        backgroundColor: '#FAFAF7',
        fontFamily: 'var(--font-jakarta), var(--font-sans), Inter, sans-serif',
      }}
    >
      {/* ─── Navigation Bar ─── */}
      <header className="w-full border-b-2 border-[#171717] bg-[#FAFAF7] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo-smooth-rounded.svg" alt="খরচ" className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-103" />
            <span className="hidden sm:inline-block font-mono text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[4px] border-2 border-[#171717] bg-[#FBC02B] shadow-[2px_2px_0px_#171717]">
              Fintech
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-[#171717]">
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
            <button
              onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-bold border-2 border-[#171717] bg-[#FFFFFF] shadow-[2px_2px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
              title="Toggle Language"
            >
              <Globe size={14} weight="bold" className="text-[#179B51]" />
              <span>{locale === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {isHydrated && user ? (
              <Link
                href="/dashboard"
                className="px-4.5 py-2 rounded-[6px] text-xs font-extrabold text-white bg-[#179B51] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                {locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
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
                  className="px-4.5 py-2 rounded-[6px] text-xs font-extrabold text-white bg-[#179B51] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  {locale === 'bn' ? 'শুরু করুন' : 'Get Started'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FBC02B] border-2 border-[#171717] rounded-[6px] shadow-[2px_2px_0px_#171717]">
              <Sparkle size={14} weight="fill" className="text-[#171717]" />
              <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#171717]">
                {locale === 'bn' ? 'বাংলা ও ইংরেজি খরচ ট্র্যাকার' : 'Bilingual Personal Finance'}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-[#171717]">
              {locale === 'bn' ? (
                <>
                  দৈনন্দিন খরচের ওপর সম্পূর্ণ{' '}
                  <span className="inline-block bg-[#179B51] text-white px-3 py-0.5 rounded-[6px] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] -rotate-1">
                    নিয়ন্ত্রণ
                  </span>{' '}
                  নিন।
                </>
              ) : (
                <>
                  Take control of your everyday{' '}
                  <span className="inline-block bg-[#179B51] text-white px-3 py-0.5 rounded-[6px] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] -rotate-1">
                    spending
                  </span>.
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-[#666666] font-medium leading-relaxed max-w-[46ch]">
              {locale === 'bn'
                ? 'দৈনন্দিন খরচ ট্র্যাক করুন, মাসিক বাজেট নিয়ন্ত্রণ করুন এবং জানুন আপনার টাকা কোথায় যায়।'
                : 'Track expenses, manage your monthly budget, and understand where your money goes.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <Link
                href="/register"
                className="px-7 py-3.5 rounded-[6px] text-base font-black text-white bg-[#179B51] border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-center flex items-center justify-center gap-2"
              >
                <span>{locale === 'bn' ? 'বিনামূল্যে শুরু করুন' : 'Get Started Free'}</span>
                <ArrowRight size={16} weight="bold" />
              </Link>

              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="px-6 py-3.5 rounded-[6px] text-base font-extrabold text-[#171717] bg-[#FFFFFF] border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <Microphone size={18} weight="fill" className="text-red-500" />
                <span>{locale === 'bn' ? 'ভয়েস ট্রাই করুন' : 'Try Voice AI'}</span>
              </button>
            </div>

            {/* Trust Mini-Boxes */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="p-3 bg-[#FFFFFF] border-2 border-[#171717] rounded-[6px] shadow-[2px_2px_0px_#171717] text-center">
                <p className="font-mono text-lg font-black text-[#179B51]">৳ 0</p>
                <p className="text-[11px] font-bold text-[#666666]">{locale === 'bn' ? '১০০% ফ্রি' : 'Platform Fee'}</p>
              </div>
              <div className="p-3 bg-[#FFFFFF] border-2 border-[#171717] rounded-[6px] shadow-[2px_2px_0px_#171717] text-center">
                <p className="font-mono text-lg font-black text-[#d97706]">&lt; 300ms</p>
                <p className="text-[11px] font-bold text-[#666666]">{locale === 'bn' ? 'এআই গতি' : 'Parse Latency'}</p>
              </div>
              <div className="p-3 bg-[#FFFFFF] border-2 border-[#171717] rounded-[6px] shadow-[2px_2px_0px_#171717] text-center">
                <p className="font-mono text-lg font-black text-[#171717]">100%</p>
                <p className="text-[11px] font-bold text-[#666666]">{locale === 'bn' ? 'এনক্রিপ্টেড' : 'Private & Open'}</p>
              </div>
            </div>
          </div>

          {/* Right Column Product Preview */}
          <div className="lg:col-span-6">
            <div className="bg-[#FFFFFF] border-3 border-[#171717] rounded-[10px] shadow-[8px_8px_0px_#171717] p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ef4444] border border-[#171717]" />
                    <span className="w-3 h-3 rounded-full bg-[#FBC02B] border border-[#171717]" />
                    <span className="w-3 h-3 rounded-full bg-[#179B51] border border-[#171717]" />
                  </div>
                  <span className="font-black text-sm text-[#171717] ml-1.5">Khoroch Live Dashboard</span>
                </div>
                <span className="text-xs font-black bg-[#FBC02B] text-[#171717] px-2.5 py-0.5 rounded-[4px] border-2 border-[#171717]">
                  August 2026
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-[#666666] uppercase tracking-wider font-mono">Remaining Balance</p>
                <p className="text-3xl sm:text-4xl font-black text-[#171717] font-mono tracking-tight">
                  {locale === 'bn' ? '৳ ১৮,৪৫০' : '৳ 18,450'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#FAFAF7] border-2 border-[#171717] rounded-[8px]">
                <div>
                  <p className="text-[11px] font-bold text-[#666666]">Monthly Target</p>
                  <p className="text-base font-black text-[#171717] font-mono">৳ 30,000</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#666666]">Total Spent</p>
                  <p className="text-base font-black text-[#179B51] font-mono">৳ 11,550</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-extrabold text-[#171717]">
                  <span>Pace: Normal</span>
                  <span>38.5% spent</span>
                </div>
                <div className="w-full h-3.5 bg-[#FAFAF7] border-2 border-[#171717] rounded-[4px] overflow-hidden p-0.5">
                  <div className="h-full bg-[#179B51] rounded-[2px]" style={{ width: '38.5%' }} />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold text-[#666666] uppercase tracking-wider font-mono">Recent Transactions</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-[#FAFAF7] border-2 border-[#171717] rounded-[6px] shadow-[2px_2px_0px_#171717]">
                    <div className="flex items-center gap-2.5">
                      <PaymentMethodLogo name="bKash" size={22} />
                      <div>
                        <p className="text-xs font-bold text-[#171717]">Lunch & Cafe</p>
                        <p className="text-[10px] font-semibold text-[#666666]">Food • bKash</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-black text-[#171717]">-৳ 350</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#FAFAF7] border-2 border-[#171717] rounded-[6px] shadow-[2px_2px_0px_#171717]">
                    <div className="flex items-center gap-2.5">
                      <PaymentMethodLogo name="Nagad" size={22} />
                      <div>
                        <p className="text-xs font-bold text-[#171717]">Uber Ride</p>
                        <p className="text-[10px] font-semibold text-[#666666]">Transport • Nagad</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-black text-[#171717]">-৳ 420</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#FAFAF7] border-2 border-[#171717] rounded-[6px] shadow-[2px_2px_0px_#171717]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5.5 h-5.5 rounded-[4px] bg-[#179B51] text-white flex items-center justify-center text-[10px] font-black border border-[#171717]">
                        ৳
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#171717]">Kacha Bazar</p>
                        <p className="text-[10px] font-semibold text-[#666666]">Groceries • Cash</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-black text-[#171717]">-৳ 1,850</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Value Strip ─── */}
      <div className="w-full border-y-2 border-[#171717] bg-[#FBC02B] py-3.5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center font-black text-xs sm:text-sm text-[#171717] uppercase tracking-wider font-mono">
            {locale === 'bn'
              ? 'খরচ ট্র্যাক  •  বাজেট নিয়ন্ত্রণ  •  রসিদ স্ক্যান  •  ঋণ খাতা  •  ইনসাইটস'
              : 'Track expenses  •  Manage budgets  •  Scan receipts  •  Debt ledger  •  Spending insights'}
          </p>
        </div>
      </div>

      {/* ─── Problem Statement Box ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-[#FFFFFF] border-3 border-[#171717] rounded-[10px] shadow-[6px_6px_0px_#171717] p-8 sm:p-12 text-center space-y-4">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-[#179B51] bg-[#179B51]/10 px-3 py-1 rounded border border-[#171717]">
            Core Financial Problem
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#171717]">
            {locale === 'bn' ? (
              <>
                আপনার টাকা আসলে{' '}
                <span className="bg-[#FBC02B] px-2 py-0.5 rounded border border-[#171717]">কোথায় যায়?</span>
              </>
            ) : (
              <>
                Where does your money{' '}
                <span className="bg-[#FBC02B] px-2 py-0.5 rounded border border-[#171717]">actually go?</span>
              </>
            )}
          </h2>
          <p className="text-base sm:text-lg text-[#666666] font-medium leading-relaxed max-w-[62ch] mx-auto">
            {locale === 'bn'
              ? 'প্রতিদিনের ছোট ছোট খরচ দ্রুত জমা হয়ে যায়। খরচ আপনাকে প্রতিটি ব্যয়ের নিখুঁত হিসাব রাখতে, আর্থিক অভ্যাস বুঝতে এবং কত টাকা বাকি আছে তা পরিষ্কার দেখতে সাহায্য করে।'
              : 'Small expenses add up quickly. Khoroch helps you keep track of your spending, understand your habits, and know exactly how much money you have left.'}
          </p>
        </div>
      </section>

      {/* ─── 3 Key Product Showcase Cards ─── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12 pb-16">
        {/* Feature Card 1: Instant Expense Entry */}
        <div className="bg-[#FFFFFF] border-3 border-[#171717] rounded-[10px] shadow-[8px_8px_0px_#171717] p-7 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#179B51] bg-[#179B51]/10 px-2.5 py-0.5 rounded border border-[#171717]">
                01. Instant Entry
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-[#171717]">
                {locale === 'bn' ? 'প্রতিটি খরচের দ্রুত ও নির্ভুল হিসাব।' : 'Track every expense effortlessly.'}
              </h3>
              <p className="text-base text-[#666666] font-medium leading-relaxed">
                {locale === 'bn'
                  ? 'ম্যানুয়ালি হিসাব মেলাতে আর কোনো ঝামেলা নেই। কোথায় কত টাকা খরচ হচ্ছে তা কয়েক সেকেন্ডে রেকর্ড করুন।'
                  : 'Know where every taka goes without manually piecing everything together at the end of the month.'}
              </p>
              <div className="space-y-2 pt-2 text-xs font-bold text-[#171717]">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-[#179B51]" />
                  <span>{locale === 'bn' ? 'বিকাশ, নগদ ও ব্যাংক কার্ডের সাপোর্ট' : 'Direct bKash, Nagad, and Card wallet support'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-[#179B51]" />
                  <span>{locale === 'bn' ? 'কাস্টম ক্যাটাগরি ও ট্যাগিং সুবিধা' : 'Custom categories, tags, and date filters'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#FAFAF7] border-2 border-[#171717] rounded-[8px] p-6 space-y-3">
              <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2 font-black text-sm">
                <span>Interactive Logger</span>
                <span className="font-mono text-xs text-[#179B51]">BDT ৳</span>
              </div>
              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="text-[#666666] block mb-1">Amount (৳)</label>
                  <input
                    type="number"
                    value={demoAmount}
                    onChange={(e) => setDemoAmount(e.target.value)}
                    className="w-full p-2 bg-[#FFFFFF] border-2 border-[#171717] rounded-[6px] font-mono font-black text-base"
                  />
                </div>
                <div>
                  <label className="text-[#666666] block mb-1">Category</label>
                  <select
                    value={demoCategory}
                    onChange={(e) => setDemoCategory(e.target.value)}
                    className="w-full p-2 bg-[#FFFFFF] border-2 border-[#171717] rounded-[6px] font-bold"
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Utility Bills">Utility Bills</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#666666] block mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['bKash', 'Nagad', 'Card'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDemoMethod(m)}
                        className={`p-2 rounded-[6px] border-2 border-[#171717] flex items-center justify-center gap-1.5 cursor-pointer ${
                          demoMethod === m ? 'bg-[#179B51] text-white shadow-[2px_2px_0px_#171717]' : 'bg-[#FFFFFF] text-[#171717]'
                        }`}
                      >
                        <PaymentMethodLogo name={m} size={16} />
                        <span>{m}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success(locale === 'bn' ? `৳${demoAmount} খরচ সংরক্ষিত হয়েছে!` : `৳${demoAmount} expense logged!`)}
                  className="w-full py-2.5 bg-[#179B51] text-white font-black text-xs rounded-[6px] border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer mt-1"
                >
                  Save Entry (৳ {demoAmount})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Card 2: Voice AI Intelligence */}
        <div id="voice" className="bg-[#FFFFFF] border-3 border-[#171717] rounded-[10px] shadow-[8px_8px_0px_#171717] p-7 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#179B51] bg-[#179B51]/10 px-2.5 py-0.5 rounded border border-[#171717]">
                02. Voice AI Capture
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-[#171717]">
                {locale === 'bn' ? 'শুধু বলুন আপনি কী খরচ করেছেন।' : 'Just say what you spent.'}
              </h3>
              <p className="text-base text-[#666666] font-medium leading-relaxed">
                {locale === 'bn'
                  ? 'বাংলা, ইংরেজি বা চলতি বাংলিশে কথা বলুন। এআই স্বয়ংক্রিয়ভাবে ক্যাটাগরি, মার্চেন্ট ও টাকার পরিমাণ আলাদা করে সনাক্ত করবে।'
                  : 'Speak naturally in conversational Bangla, English, or mixed phrases. Khoroch parses the vendor and amount automatically.'}
              </p>

              <div className="flex items-center gap-2 pt-2">
                {(['bn', 'mixed', 'en'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveVoiceTab(tab)}
                    className={`px-3 py-1.5 rounded-[6px] border-2 border-[#171717] font-bold text-xs cursor-pointer transition-all ${
                      activeVoiceTab === tab
                        ? 'bg-[#FBC02B] text-[#171717] shadow-[2px_2px_0px_#171717]'
                        : 'bg-[#FFFFFF] text-[#666666]'
                    }`}
                  >
                    {voiceDemos[tab].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#FAFAF7] border-2 border-[#171717] rounded-[8px] p-6 space-y-3">
              <div className="p-3 bg-[#FFFFFF] border-2 border-[#171717] rounded-[6px] flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-[#171717]">
                  "{voiceDemos[activeVoiceTab].text}"
                </span>
                <div className="p-2 rounded-[6px] bg-[#179B51] text-white border border-[#171717] shrink-0">
                  <Microphone size={16} weight="fill" />
                </div>
              </div>

              <div className="text-center font-mono font-bold text-xs text-[#666666]">
                ↓ Extracted Breakdown
              </div>

              <div className="space-y-2">
                {voiceDemos[activeVoiceTab].parsed.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-[#FFFFFF] border-2 border-[#171717] rounded-[6px] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#171717]">{item.name}</p>
                      <p className="text-[10px] font-semibold text-[#666666]">{item.category} • {item.method}</p>
                    </div>
                    <span className="font-mono text-sm font-black text-[#179B51]">৳ {item.amount}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="flex-1 py-2 bg-[#FFFFFF] text-[#171717] font-bold text-xs rounded-[4px] border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-slate-100 cursor-pointer"
                >
                  Test Microphone
                </button>
                <button
                  type="button"
                  onClick={() => toast.success(locale === 'bn' ? 'ভয়েস খরচ নিশ্চিত হয়েছে!' : 'Voice expense confirmed!')}
                  className="flex-1 py-2 bg-[#179B51] text-white font-bold text-xs rounded-[4px] border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#148344] cursor-pointer"
                >
                  Confirm All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Card 3: Receipt Vision OCR */}
        <div className="bg-[#FFFFFF] border-3 border-[#171717] rounded-[10px] shadow-[8px_8px_0px_#171717] p-7 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#179B51] bg-[#179B51]/10 px-2.5 py-0.5 rounded border border-[#171717]">
                03. Vision OCR
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-[#171717]">
                {locale === 'bn' ? 'রসিদের ছবি থেকে সরাসরি খরচ।' : 'Turn receipts into expenses.'}
              </h3>
              <p className="text-base text-[#666666] font-medium leading-relaxed">
                {locale === 'bn'
                  ? 'কাগজের রসিদের ছবি তুলুন। মার্চেন্টের নাম, মোট টাকা ও প্রতিটি আইটেম স্বয়ংক্রিয়ভাবে এক্সট্র্যাক্ট হয়ে যাবে।'
                  : 'Snap a photo of printed supermarket or pharmacy receipts. Extract merchant, date, VAT, and line items in seconds.'}
              </p>

              <div className="flex items-center gap-2 text-xs font-bold text-[#666666]">
                <span className="px-2 py-1 bg-[#FAFAF7] border-2 border-[#171717] rounded">Receipt</span>
                <span>→</span>
                <span className="px-2 py-1 bg-[#FAFAF7] border-2 border-[#171717] rounded">Scan</span>
                <span>→</span>
                <span className="px-2 py-1 bg-[#FAFAF7] border-2 border-[#171717] rounded">Extract</span>
                <span>→</span>
                <span className="px-2 py-1 bg-[#179B51] text-white border-2 border-[#171717] rounded">Confirm</span>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#FAFAF7] border-2 border-[#171717] rounded-[8px] p-6 space-y-3">
              <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2 font-black text-sm">
                <span>Receipt Extracted</span>
                <span className="text-xs font-mono font-bold bg-[#179B51] text-white px-2 py-0.5 rounded border border-[#171717]">
                  17 Aug 2026
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-dashed border-[#171717]">
                  <span className="font-bold text-[#666666]">Merchant</span>
                  <span className="font-bold text-[#171717]">Shwapno Superstore</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-[#171717]">
                  <span className="font-bold text-[#666666]">Category</span>
                  <span className="font-bold text-[#171717]">Groceries</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-[#171717]">
                  <span className="font-bold text-[#666666]">Items Detected</span>
                  <span className="font-bold text-[#171717]">3 Line Items</span>
                </div>
                <div className="flex justify-between py-2 pt-3 font-bold text-sm border-t-2 border-[#171717]">
                  <span className="text-[#171717]">Total Amount</span>
                  <span className="font-mono text-base font-black text-[#179B51]">৳ 1,850.00</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.success(locale === 'bn' ? 'রসিদ সংরক্ষিত হয়েছে!' : 'Receipt confirmed and saved!')}
                className="w-full py-2.5 bg-[#179B51] text-white font-black text-xs rounded-[6px] border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
              >
                Confirm & Save Receipt
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Monthly Budget Section ─── */}
      <section id="budget" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t-2 border-[#171717]">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-[#179B51]">04. Budgeting Target</span>
          <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-[#171717]">
            {locale === 'bn' ? 'মাসিক বাজেটের ওপর পূর্ণ নিয়ন্ত্রণ।' : 'Stay on top of your monthly budget.'}
          </h3>
          <p className="text-base text-[#666666] font-medium">
            {locale === 'bn'
              ? 'মাসের শুরুতে টার্গেট বাজেট নির্ধারণ করুন এবং কত খরচ হয়েছে ও কত বাকি আছে তা লাইভ ট্র্যাক করুন।'
              : 'Set a starting target, track daily pacing, and avoid unexpected end-of-month budget shocks.'}
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-[#FFFFFF] border-3 border-[#171717] rounded-[8px] shadow-[8px_8px_0px_#171717] p-7 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3">
            <div>
              <span className="text-xs font-bold text-[#666666]">Target Budget</span>
              <p className="text-2xl font-black text-[#171717] font-mono">৳ 30,000</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#666666]">Remaining</span>
              <p className="text-2xl font-black text-[#179B51] font-mono">৳ 18,450</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-extrabold text-[#171717]">
              <span>Spent: ৳ 11,550</span>
              <span>38.5% spent</span>
            </div>
            <div className="w-full h-4 bg-[#FAFAF7] border-2 border-[#171717] rounded-[4px] overflow-hidden p-0.5">
              <div className="h-full bg-[#179B51] rounded-[2px]" style={{ width: '38.5%' }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-bold">
            <div className="p-2.5 bg-[#FAFAF7] border-2 border-[#171717] rounded-[6px]">
              <p className="text-[#666666] text-[10px]">Daily Avg</p>
              <p className="font-mono text-[#171717] font-black">৳ 679</p>
            </div>
            <div className="p-2.5 bg-[#FAFAF7] border-2 border-[#171717] rounded-[6px]">
              <p className="text-[#666666] text-[10px]">Pace Status</p>
              <p className="text-[#179B51] font-black">Healthy</p>
            </div>
            <div className="p-2.5 bg-[#FAFAF7] border-2 border-[#171717] rounded-[6px]">
              <p className="text-[#666666] text-[10px]">Days Left</p>
              <p className="font-mono text-[#171717] font-black">14 Days</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Yellow Brand Breakout ─── */}
      <section className="w-full bg-[#FBC02B] border-y-2 border-[#171717] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#171717]">
            {locale === 'bn' ? 'সচেতনভাবে খরচ করুন। নিজের টাকা বুঝুন।' : 'Spend intentionally. Understand your money.'}
          </h2>
          <p className="text-base sm:text-lg text-[#171717] font-semibold max-w-[50ch] mx-auto">
            {locale === 'bn'
              ? 'খরচ আপনার দৈনন্দিন খরচের হিসাবকে করে তোলে পানির মতো সহজ ও পরিপাটি।'
              : 'Khoroch makes everyday expense tracking simple, fast, and completely stress-free.'}
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-block px-8 py-3.5 rounded-[6px] text-base font-black text-[#171717] bg-[#FFFFFF] border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              {locale === 'bn' ? 'ট্র্যাকিং শুরু করুন' : 'Start Tracking'}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Spending Insights ─── */}
      <section id="insights" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-[#171717]">
            {locale === 'bn' ? 'কোথায় কত খরচ হচ্ছে তার পরিষ্কার চিত্র' : 'Where your money goes'}
          </h3>
          <p className="text-base text-[#666666] font-medium">
            {locale === 'bn'
              ? 'ক্যাটাগরি অনুযায়ী খরচের বিশ্লেষণ দেখে বুঝে নিন কোন খাতে বেশি খরচ হচ্ছে।'
              : 'Simple, clear financial analytics without complicated or confusing graphs.'}
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-[#FFFFFF] border-3 border-[#171717] rounded-[8px] shadow-[8px_8px_0px_#171717] p-7 space-y-5">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-black text-[#171717] mb-1">
                <span>Food & Dining</span>
                <span className="font-mono">৳ 4,200</span>
              </div>
              <div className="w-full h-3.5 bg-[#FAFAF7] border-2 border-[#171717] rounded-[3px] overflow-hidden">
                <div className="h-full bg-[#179B51]" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-black text-[#171717] mb-1">
                <span>Utility Bills</span>
                <span className="font-mono">৳ 3,200</span>
              </div>
              <div className="w-full h-3.5 bg-[#FAFAF7] border-2 border-[#171717] rounded-[3px] overflow-hidden">
                <div className="h-full bg-[#179B51]" style={{ width: '48%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-black text-[#171717] mb-1">
                <span>Groceries & Shopping</span>
                <span className="font-mono">৳ 2,300</span>
              </div>
              <div className="w-full h-3.5 bg-[#FAFAF7] border-2 border-[#171717] rounded-[3px] overflow-hidden">
                <div className="h-full bg-[#FBC02B]" style={{ width: '35%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-black text-[#171717] mb-1">
                <span>Transportation</span>
                <span className="font-mono">৳ 1,850</span>
              </div>
              <div className="w-full h-3.5 bg-[#FAFAF7] border-2 border-[#171717] rounded-[3px] overflow-hidden">
                <div className="h-full bg-[#171717]" style={{ width: '28%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t-2 border-[#171717]">
        <div className="max-w-2xl mb-12 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171717]">
            {locale === 'bn' ? 'সহজ চার ধাপে সম্পূর্ণ নিয়ন্ত্রণ' : 'How Khoroch Works'}
          </h2>
          <p className="text-base text-[#666666] font-medium">
            {locale === 'bn'
              ? 'কোনো জটিলতা ছাড়া চার ধাপে আপনার পার্সোনাল ফাইন্যান্স সাজিয়ে নিন।'
              : 'Four straightforward steps to achieve daily clarity.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[4px_4px_0px_#171717] space-y-3 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all">
            <span className="text-3xl font-black text-[#179B51] font-mono block">01</span>
            <h4 className="font-black text-lg text-[#171717]">
              {locale === 'bn' ? 'বাজেট সেট করুন' : 'Set your budget'}
            </h4>
            <p className="text-xs text-[#666666] font-medium leading-relaxed">
              {locale === 'bn'
                ? 'মাসের শুরুতে স্টার্টিং ব্যালেন্স ও খরচের লিমিট নির্ধারণ করুন।'
                : 'Define your starting monthly target and spending boundary.'}
            </p>
          </div>

          <div className="p-6 bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[4px_4px_0px_#171717] space-y-3 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all">
            <span className="text-3xl font-black text-[#179B51] font-mono block">02</span>
            <h4 className="font-black text-lg text-[#171717]">
              {locale === 'bn' ? 'খরচ রেকর্ড করুন' : 'Track expenses'}
            </h4>
            <p className="text-xs text-[#666666] font-medium leading-relaxed">
              {locale === 'bn'
                ? 'ভয়েস ইনপুট, রসিদ স্ক্যান বা কুইক ফর্মের মাধ্যমে সহজে রেকর্ড করুন।'
                : 'Log expenses in seconds via voice capture, receipt camera scan, or form.'}
            </p>
          </div>

          <div className="p-6 bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[4px_4px_0px_#171717] space-y-3 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all">
            <span className="text-3xl font-black text-[#179B51] font-mono block">03</span>
            <h4 className="font-black text-lg text-[#171717]">
              {locale === 'bn' ? 'অভ্যাস বুঝুন' : 'Understand habits'}
            </h4>
            <p className="text-xs text-[#666666] font-medium leading-relaxed">
              {locale === 'bn'
                ? 'ক্যাটাগরি ও পেমেন্ট চ্যানেল ভিত্তিক হিসাব দেখে খরচ অপ্টিমাইজ করুন।'
                : 'See where money flows across bKash, Nagad, cards, and cash.'}
            </p>
          </div>

          <div className="p-6 bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[4px_4px_0px_#171717] space-y-3 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#171717] transition-all">
            <span className="text-3xl font-black text-[#179B51] font-mono block">04</span>
            <h4 className="font-black text-lg text-[#171717]">
              {locale === 'bn' ? 'নিয়ন্ত্রণে থাকুন' : 'Stay in control'}
            </h4>
            <p className="text-xs text-[#666666] font-medium leading-relaxed">
              {locale === 'bn'
                ? 'ইউটিলিটি বিল, সাবস্ক্রিপশন ও ধার-দেনার নিখুঁত ব্যালেন্স বজায় রাখুন।'
                : 'Keep utility bills, memberships, and peer loans settled on time.'}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Final Call to Action ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-[#179B51] text-white border-3 border-[#171717] rounded-[8px] shadow-[8px_8px_0px_#171717] p-8 sm:p-14 text-center space-y-5">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {locale === 'bn'
              ? 'খরচের হিসাব সাজাতে আপনি প্রস্তুত?'
              : 'Ready to take control of your spending?'}
          </h2>
          <p className="text-base sm:text-lg text-emerald-100 font-medium max-w-[48ch] mx-auto leading-relaxed">
            {locale === 'bn'
              ? 'আজই শুরু করুন সম্পূর্ণ বিনামূল্যে। কোনো ক্রেডিট কার্ডের প্রয়োজন নেই।'
              : 'Start tracking your expenses with Khoroch. Free and open source.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-[6px] text-base font-black text-[#171717] bg-[#FBC02B] border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
            >
              {locale === 'bn' ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন' : 'Get Started Free'}
            </Link>
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-6 py-3.5 rounded-[6px] text-base font-bold text-white bg-[#171717] border-2 border-[#171717] shadow-[4px_4px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
            >
              {copiedInstall ? 'Command Copied' : 'Clone on GitHub'}
            </button>
          </div>
        </div>
      </section>

      {/* ─── Clean Dark Minimal Footer ─── */}
      <footer className="w-full bg-[#171717] text-[#FAFAF7] border-t-2 border-[#171717] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <img src="/logo-smooth-rounded.svg" alt="খরচ" className="h-7 w-auto object-contain bg-white rounded p-0.5" />
              <span className="font-black text-base text-[#FAFAF7]">Khoroch</span>
            </div>
            <p className="text-xs text-[#999999] font-medium">
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

          <div className="text-xs text-[#666666] font-mono">
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
