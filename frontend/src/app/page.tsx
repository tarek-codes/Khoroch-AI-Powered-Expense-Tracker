'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import {
  Microphone,
  Receipt,
  ArrowRight,
  Globe,
  Plus,
  TrendUp,
  Sliders,
  Play,
  Pause,
} from '@phosphor-icons/react';
import { useAppStore } from '@/store/appStore';
import { translations } from '@/lib/i18n';
import { PaymentMethodLogo } from '@/components/PaymentMethodLogo';
import { toast } from 'sonner';

export default function LandingPage() {
  const { user, isHydrated, locale, setLocale } = useAppStore();
  const t = translations[locale];

  // Scroll Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [copiedInstall, setCopiedInstall] = useState(false);
  const [activeVoiceTab, setActiveVoiceTab] = useState<'bn' | 'mixed' | 'en'>('bn');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Interactive Live Budget Slider
  const [interactiveBudget, setInteractiveBudget] = useState(35000);
  const [interactiveSpent, setInteractiveSpent] = useState(14850);

  // Live Hero Transaction Stream
  const [heroExpenses, setHeroExpenses] = useState([
    { id: 1, name: 'Lunch & Cafe', category: 'Food & Dining', amount: 350, method: 'bKash', time: '12:30 PM' },
    { id: 2, name: 'Uber Ride', category: 'Transportation', amount: 420, method: 'Nagad', time: '09:15 AM' },
    { id: 3, name: 'Kacha Bazar', category: 'Groceries', amount: 1850, method: 'Cash', time: 'Yesterday' },
  ]);

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

  const handleCopy = () => {
    navigator.clipboard.writeText('git clone https://github.com/tarek-codes/Khoroch-AI-Powered-Expense-Tracker.git');
    setCopiedInstall(true);
    toast.success(locale === 'bn' ? 'কমান্ড কপি হয়েছে!' : 'Clone command copied!');
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const remainingBalance = 30000 - heroExpenses.reduce((s, e) => s + e.amount, 9000);

  const toggleSimulatedAudio = () => {
    setIsPlayingAudio((prev) => !prev);
    if (!isPlayingAudio) {
      toast.info(locale === 'bn' ? 'ভয়েস অডিও ডেমো প্লে হচ্ছে...' : 'Playing voice demo simulation...');
    }
  };

  return (
    <div
      className="min-h-screen text-[#171717] selection:bg-[#179B51] selection:text-white relative overflow-x-hidden"
      style={{
        backgroundColor: '#FAFAF7',
        fontFamily: 'var(--font-jakarta), var(--font-sans), Inter, sans-serif',
      }}
    >
      {/* ─── Scroll Progress Bar ─── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#179B51] origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* ─── Navigation Bar with Large Logo ─── */}
      <header className="w-full bg-[#FAFAF7]/90 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Khoroch Brand Logo */}
          <Link href="/" className="flex items-center py-2 group">
            <img
              src="/logo-smooth-rounded.svg"
              alt="খরচ — Khoroch"
              className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-103"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-9 text-[15px] font-semibold text-[#171717]">
            <a href="#voice" className="hover:text-[#179B51] transition-colors">
              {locale === 'bn' ? 'ভয়েস এআই' : 'Voice AI'}
            </a>
            <a href="#vision" className="hover:text-[#179B51] transition-colors">
              {locale === 'bn' ? 'রসিদ স্ক্যান' : 'Receipt OCR'}
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

          {/* Action Area */}
          <div className="flex items-center gap-3.5">
            {/* Language Switch */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-neutral-300 bg-white shadow-2xs hover:border-[#179B51] transition-all cursor-pointer"
            >
              <Globe size={15} weight="bold" className="text-[#179B51]" />
              <span>{locale === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {isHydrated && user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#179B51] shadow-xs hover:bg-[#148344] hover:shadow-md transition-all flex items-center gap-1.5"
              >
                <span>{locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                <ArrowRight size={13} weight="bold" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold text-[#171717] hover:text-[#179B51] transition-colors"
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#179B51] shadow-xs hover:bg-[#148344] hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>{locale === 'bn' ? 'শুরু করুন' : 'Get Started'}</span>
                  <ArrowRight size={13} weight="bold" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── 1. Hero Section (Warm Background #FAFAF7) ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-7"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06] text-[#171717]">
              {locale === 'bn' ? (
                <>
                  দৈনন্দিন খরচের ওপর সম্পূর্ণ{' '}
                  <span className="text-[#179B51] underline decoration-[#FBC02B] decoration-4 underline-offset-6">
                    নিয়ন্ত্রণ
                  </span>{' '}
                  নিন।
                </>
              ) : (
                <>
                  Take control of your everyday{' '}
                  <span className="text-[#179B51] underline decoration-[#FBC02B] decoration-4 underline-offset-6">
                    spending
                  </span>.
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-[#555555] font-normal leading-relaxed max-w-[50ch]">
              {locale === 'bn'
                ? 'বাংলা বা ইংরেজিতে কথা বলে খরচ এন্ট্রি করুন, রসিদ স্ক্যান করুন এবং মাসিক বাজেট রাখুন সম্পূর্ণ নিয়ন্ত্রণে।'
                : 'Track expenses with natural voice, scan paper receipts with vision AI, and understand your cashflow in real time.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-xl text-base font-bold text-white bg-[#179B51] shadow-md hover:bg-[#148344] hover:shadow-lg transition-all text-center flex items-center justify-center gap-2 group"
                >
                  <span>{locale === 'bn' ? 'বিনামূল্যে শুরু করুন' : 'Get Started Free'}</span>
                  <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="#voice"
                  className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-bold text-[#171717] bg-white border border-neutral-300 shadow-2xs hover:border-[#179B51] hover:bg-neutral-50 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Microphone size={18} weight="fill" className="text-red-500" />
                  <span>{locale === 'bn' ? 'কীভাবে ভয়েস কাজ করে' : 'Explore Voice AI'}</span>
                </a>
              </motion.div>
            </div>

            {/* Metric Strip */}
            <div className="flex items-center gap-8 sm:gap-12 pt-6 border-t border-neutral-200/80">
              <div>
                <p className="font-mono text-2xl font-black text-[#179B51]">৳ 0</p>
                <p className="text-xs font-semibold text-[#777777] mt-0.5">{locale === 'bn' ? '১০০% ফ্রি' : 'Platform Fee'}</p>
              </div>
              <div className="w-px h-8 bg-neutral-200" />
              <div>
                <p className="font-mono text-2xl font-black text-[#d97706]">&lt; 300ms</p>
                <p className="text-xs font-semibold text-[#777777] mt-0.5">{locale === 'bn' ? 'এআই স্পিড' : 'AI Parse Speed'}</p>
              </div>
              <div className="w-px h-8 bg-neutral-200" />
              <div>
                <p className="font-mono text-2xl font-black text-[#171717]">100%</p>
                <p className="text-xs font-semibold text-[#777777] mt-0.5">{locale === 'bn' ? 'এনক্রিপ্টেড' : 'Private & Secure'}</p>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Brand Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col items-center justify-center text-center p-8 sm:p-12 relative"
          >
            {/* Ambient Brand Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#179B51]/10 via-[#FBC02B]/10 to-transparent rounded-3xl blur-2xl -z-10" />

            <div className="space-y-6 flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="cursor-pointer"
              >
                <img
                  src="/logo-smooth-rounded.svg"
                  alt="খরচ"
                  className="h-32 sm:h-44 w-auto object-contain drop-shadow-sm"
                />
              </motion.div>

              <div className="space-y-2 max-w-sm">
                <p className="text-lg sm:text-xl font-extrabold text-[#171717] tracking-tight">
                  {locale === 'bn' ? 'দৈনন্দিন খরচের আধুনিক ও নির্ভুল সমাধান' : 'Modern everyday financial clarity'}
                </p>
                <p className="text-xs sm:text-sm text-[#666666] font-medium leading-relaxed">
                  {locale === 'bn'
                    ? 'স্মার্ট ভয়েস ইনপুট ও ইনস্ট্যান্ট রসিদ স্ক্যানিংয়ের সাথে দ্রুত ও সহজ ট্র্যাকিং।'
                    : 'Smart expense tracking with natural voice AI and instant receipt OCR.'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 2. Infinite Scrolling Ticker (High Contrast Band) ─── */}
      <div className="w-full bg-[#171717] text-[#FAFAF7] py-5 overflow-hidden border-y border-neutral-800 relative shadow-inner">
        <motion.div
          animate={{ x: [0, -1035] }}
          transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
          className="flex items-center gap-10 whitespace-nowrap text-xs sm:text-sm font-bold uppercase tracking-wider font-mono shrink-0"
        >
          {[0, 1, 2].map((loop) => (
            <React.Fragment key={loop}>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#179B51]" /> Voice AI Capture</span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FBC02B]" /> Receipt Vision OCR</span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#179B51]" /> Monthly Budget Pacing</span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FBC02B]" /> Debt & Lending Ledger</span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#179B51]" /> bKash, Nagad & Bank Sync</span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FBC02B]" /> Spoken Bangla & English</span>
              <span className="text-neutral-600">•</span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* ─── 3. Problem Statement (White Section #FFFFFF) ─── */}
      <section className="w-full bg-white py-28 border-b border-neutral-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black tracking-tight text-[#171717]"
          >
            {locale === 'bn' ? (
              <>
                আপনার টাকা আসলে{' '}
                <span className="text-[#179B51] underline decoration-[#FBC02B] decoration-4 underline-offset-6">কোথায় যায়?</span>
              </>
            ) : (
              <>
                Where does your money{' '}
                <span className="text-[#179B51] underline decoration-[#FBC02B] decoration-4 underline-offset-6">actually go?</span>
              </>
            )}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-[#666666] font-normal leading-relaxed max-w-[62ch] mx-auto"
          >
            {locale === 'bn'
              ? 'প্রতিদিনের ছোট ছোট খরচ দ্রুত বড় অংকে পরিণত হয়। খরচ আপনাকে প্রতিটি ব্যয়ের হিসাব রাখতে, অভ্যাস বুঝতে এবং কত টাকা বাকি আছে তা পরিষ্কার দেখতে সাহায্য করে।'
              : 'Small everyday expenses add up quickly. Khoroch helps you keep track of your spending, understand your habits, and know exactly how much money you have left.'}
          </motion.p>
        </div>
      </section>

      {/* ─── 4. Feature 1: Spoken Voice AI (Warm Section #FAFAF7) ─── */}
      <section id="voice" className="w-full py-28 border-b border-neutral-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600">
                <Microphone size={26} weight="bold" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600">
                01. Conversational Voice AI
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171717]">
                {locale === 'bn' ? 'শুধু বলুন আপনি কী খরচ করেছেন।' : 'Just say what you spent.'}
              </h3>
              <p className="text-base text-[#666666] leading-relaxed">
                {locale === 'bn'
                  ? 'বাংলা, ইংরেজি বা চলতি বাংলিশে কথা বলুন। এআই স্বয়ংক্রিয়ভাবে ক্যাটাগরি, মার্চেন্ট ও টাকার পরিমাণ আলাদা করে সনাক্ত করবে।'
                  : 'Speak naturally in colloquial Bangla, English, or mixed phrases. Gemini LLM parses multiple line items in under 300ms.'}
              </p>

              <div className="flex items-center gap-2 pt-2">
                {(['bn', 'mixed', 'en'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveVoiceTab(tab)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                      activeVoiceTab === tab
                        ? 'bg-[#FBC02B] text-[#171717] shadow-xs'
                        : 'bg-neutral-200/70 text-[#666666] hover:bg-neutral-200'
                    }`}
                  >
                    {voiceDemos[tab].label}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 bg-white border border-neutral-200/90 rounded-3xl p-7 shadow-sm space-y-5"
            >
              <div className="p-4 bg-[#FAFAF7] rounded-2xl border border-neutral-200/60 flex items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider font-mono">Spoken Sentence Demo</span>
                  <p className="text-xs font-semibold text-[#171717] italic">
                    "{voiceDemos[activeVoiceTab].text}"
                  </p>
                </div>

                {/* Simulated Waveform */}
                <div className="flex items-center gap-1 h-7 shrink-0">
                  {[14, 24, 18, 28, 16, 26, 20, 12].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: isPlayingAudio ? [h, Math.max(6, (h * 1.8) % 28), h] : h }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                      className="w-1 bg-[#179B51] rounded-full"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {voiceDemos[activeVoiceTab].parsed.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-[#FAFAF7] rounded-xl border border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <PaymentMethodLogo name={item.method} size={22} />
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
                  onClick={toggleSimulatedAudio}
                  className="flex-1 py-3 bg-white text-[#171717] font-bold text-xs rounded-xl border border-neutral-300 shadow-2xs hover:bg-neutral-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isPlayingAudio ? <Pause size={14} weight="bold" /> : <Play size={14} weight="bold" className="text-[#179B51]" />}
                  <span>{isPlayingAudio ? 'Pause Simulation' : 'Play Audio Simulation'}</span>
                </button>
                <Link
                  href="/register"
                  className="flex-1 py-3 bg-[#179B51] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#148344] transition-all text-center"
                >
                  Try in Full App →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 5. Feature 2: Receipt Vision OCR (White Section #FFFFFF) ─── */}
      <section id="vision" className="w-full bg-white py-28 border-b border-neutral-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 space-y-6 lg:order-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 flex items-center justify-center text-sky-600">
                <Receipt size={26} weight="bold" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-sky-600">
                02. Receipt Vision OCR
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171717]">
                {locale === 'bn' ? 'রসিদের ছবি থেকে সরাসরি খরচ।' : 'Turn receipts into expenses.'}
              </h3>
              <p className="text-base text-[#666666] leading-relaxed">
                {locale === 'bn'
                  ? 'কাগজের রসিদের ছবি তুলুন। মার্চেন্টের নাম, মোট টাকা ও প্রতিটি আইটেম স্বয়ংক্রিয়ভাবে এক্সট্র্যাক্ট হয়ে যাবে।'
                  : 'Snap a photo of printed supermarket or dining receipts. Extract merchant, date, VAT, and line items in seconds.'}
              </p>

              <div className="flex items-center gap-2 text-xs font-bold text-[#666666]">
                <span className="px-3 py-1 bg-neutral-100 rounded-lg">Receipt Photo</span>
                <span>→</span>
                <span className="px-3 py-1 bg-neutral-100 rounded-lg">Vision Scan</span>
                <span>→</span>
                <span className="px-3 py-1 bg-neutral-100 rounded-lg">Itemized Extract</span>
                <span>→</span>
                <span className="px-3 py-1 bg-[#179B51] text-white rounded-lg">Save</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 bg-[#FAFAF7] border border-neutral-200 rounded-3xl p-7 shadow-sm space-y-4 lg:order-1"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
                <span className="font-bold text-sm">Receipt Extracted Preview</span>
                <span className="text-xs font-mono font-bold bg-[#179B51]/10 text-[#179B51] px-2.5 py-0.5 rounded-full">
                  17 Aug 2026
                </span>
              </div>

              <div className="space-y-2.5 text-xs bg-white p-4 rounded-2xl border border-neutral-200/60">
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

              <Link
                href="/register"
                className="w-full py-3 bg-[#179B51] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#148344] transition-all block text-center"
              >
                Scan Your Receipts in Full App →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 6. Feature 3: Interactive Budget Calculator (Warm #FAFAF7) ─── */}
      <section id="budget" className="w-full py-28 border-b border-neutral-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#179B51]/15 flex items-center justify-center text-[#179B51]">
                <Sliders size={26} weight="bold" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#179B51]">
                03. Interactive Monthly Budget
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171717]">
                {locale === 'bn' ? 'মাসিক বাজেটের ওপর পূর্ণ নিয়ন্ত্রণ।' : 'Stay on top of your monthly budget.'}
              </h3>
              <p className="text-base text-[#666666] leading-relaxed">
                {locale === 'bn'
                  ? 'মাসের শুরুতে টার্গেট বাজেট নির্ধারণ করুন এবং কত খরচ হয়েছে ও কত বাকি আছে তা লাইভ ট্র্যাক করুন।'
                  : 'Slide to adjust targets, observe spending pace, and prevent unexpected end-of-month budget shocks.'}
              </p>

              {/* Interactive Range Slider */}
              <div className="space-y-2 pt-2 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                <div className="flex justify-between text-xs font-bold text-[#555555]">
                  <span>Adjust Simulated Target:</span>
                  <span className="font-mono font-black text-[#171717]">৳ {interactiveBudget.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="80000"
                  step="5000"
                  value={interactiveBudget}
                  onChange={(e) => setInteractiveBudget(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#179B51]"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 bg-white border border-neutral-200/90 rounded-3xl p-7 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <span className="text-xs font-semibold text-[#777777]">Target Budget</span>
                  <p className="text-2xl font-black text-[#171717] font-mono">৳ {interactiveBudget.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-[#777777]">Remaining</span>
                  <p className="text-2xl font-black text-[#179B51] font-mono">
                    ৳ {(interactiveBudget - interactiveSpent).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#171717]">
                  <span>Spent: ৳ {interactiveSpent.toLocaleString()}</span>
                  <span>{Math.round((interactiveSpent / interactiveBudget) * 100)}% spent</span>
                </div>
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#179B51] rounded-full"
                    animate={{ width: `${Math.min(100, Math.round((interactiveSpent / interactiveBudget) * 100))}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-bold">
                <div className="p-3 bg-[#FAFAF7] rounded-xl border border-neutral-100">
                  <p className="text-[#888888] text-[10px]">Daily Average</p>
                  <p className="font-mono text-[#171717] font-bold text-sm">৳ {Math.round(interactiveSpent / 16)}</p>
                </div>
                <div className="p-3 bg-[#FAFAF7] rounded-xl border border-neutral-100">
                  <p className="text-[#888888] text-[10px]">Pace Status</p>
                  <p className="text-[#179B51] font-bold text-sm">Healthy</p>
                </div>
                <div className="p-3 bg-[#FAFAF7] rounded-xl border border-neutral-100">
                  <p className="text-[#888888] text-[10px]">Days Left</p>
                  <p className="font-mono text-[#171717] font-bold text-sm">14 Days</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 7. Yellow Brand Breakout (Slim & Compact) ─── */}
      <section className="w-full bg-[#FBC02B] py-12 sm:py-14 border-y border-[#d97706]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-black tracking-tight text-[#171717]"
          >
            {locale === 'bn' ? 'সচেতনভাবে খরচ করুন। নিজের টাকা বুঝুন।' : 'Spend intentionally. Understand your money.'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-[#171717]/85 font-medium max-w-[50ch] mx-auto"
          >
            {locale === 'bn'
              ? 'খরচ আপনার দৈনন্দিন খরচের হিসাবকে করে তোলে পানির মতো সহজ ও পরিপাটি।'
              : 'Khoroch makes everyday expense tracking simple, fast, and completely stress-free.'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="pt-1"
          >
            <Link
              href="/register"
              className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold text-[#171717] bg-white shadow-xs hover:bg-neutral-50 hover:shadow-md transition-all"
            >
              {locale === 'bn' ? 'ট্র্যাকিং শুরু করুন' : 'Start Tracking Now'}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── 8. Spending Insights (White Section #FFFFFF) ─── */}
      <section id="insights" className="w-full bg-white py-28 border-b border-neutral-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl space-y-3">
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171717]">
              {locale === 'bn' ? 'কোথায় কত খরচ হচ্ছে তার পরিষ্কার চিত্র' : 'Where your money goes'}
            </h3>
            <p className="text-base text-[#666666]">
              {locale === 'bn'
                ? 'ক্যাটাগরি অনুযায়ী খরচের বিশ্লেষণ দেখে বুঝে নিন কোন খাতে বেশি খরচ হচ্ছে।'
                : 'Clean, understandable category share without confusing visual clutter.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#171717]">
                <span>Food & Dining</span>
                <span className="font-mono">৳ 4,200 (35%)</span>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '65%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-[#179B51] rounded-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#171717]">
                <span>Utility Bills</span>
                <span className="font-mono">৳ 3,200 (26%)</span>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '48%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="h-full bg-[#179B51] rounded-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#171717]">
                <span>Groceries & Shopping</span>
                <span className="font-mono">৳ 2,300 (19%)</span>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '35%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full bg-[#FBC02B] rounded-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#171717]">
                <span>Transportation</span>
                <span className="font-mono">৳ 1,850 (15%)</span>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '28%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full bg-[#171717] rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. How It Works (Warm #FAFAF7) ─── */}
      <section id="how-it-works" className="w-full py-28 border-b border-neutral-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-16 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#171717]">
              {locale === 'bn' ? 'সহজ চার ধাপে সম্পূর্ণ নিয়ন্ত্রণ' : 'How Khoroch Works'}
            </h2>
            <p className="text-base text-[#666666]">
              {locale === 'bn'
                ? 'কোনো জটিলতা ছাড়া চার ধাপে আপনার পার্সোনাল ফাইন্যান্স সাজিয়ে নিন।'
                : 'Four straightforward steps to achieve daily clarity.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-3.5"
            >
              <span className="text-4xl font-black text-[#179B51] font-mono block">01</span>
              <h4 className="font-bold text-lg text-[#171717]">
                {locale === 'bn' ? 'বাজেট সেট করুন' : 'Set your budget'}
              </h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                {locale === 'bn'
                  ? 'মাসের শুরুতে স্টার্টিং ব্যালেন্স ও খরচের লিমিট নির্ধারণ করুন।'
                  : 'Define your starting monthly target and spending boundary.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-3.5"
            >
              <span className="text-4xl font-black text-[#179B51] font-mono block">02</span>
              <h4 className="font-bold text-lg text-[#171717]">
                {locale === 'bn' ? 'খরচ রেকর্ড করুন' : 'Track expenses'}
              </h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                {locale === 'bn'
                  ? 'ভয়েস ইনপুট, রসিদ স্ক্যান বা কুইক ফর্মের মাধ্যমে সহজে রেকর্ড করুন।'
                  : 'Log expenses in seconds via voice capture, receipt camera scan, or form.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-3.5"
            >
              <span className="text-4xl font-black text-[#179B51] font-mono block">03</span>
              <h4 className="font-bold text-lg text-[#171717]">
                {locale === 'bn' ? 'অভ্যাস বুঝুন' : 'Understand habits'}
              </h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                {locale === 'bn'
                  ? 'ক্যাটাগরি ও পেমেন্ট চ্যানেল ভিত্তিক হিসাব দেখে খরচ অপ্টিমাইজ করুন।'
                  : 'See where money flows across bKash, Nagad, cards, and cash.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-3.5"
            >
              <span className="text-4xl font-black text-[#179B51] font-mono block">04</span>
              <h4 className="font-bold text-lg text-[#171717]">
                {locale === 'bn' ? 'নিয়ন্ত্রণে থাকুন' : 'Stay in control'}
              </h4>
              <p className="text-xs text-[#666666] leading-relaxed">
                {locale === 'bn'
                  ? 'ইউটিলিটি বিল, সাবস্ক্রিপশন ও ধার-দেনার নিখুঁত ব্যালেন্স বজায় রাখুন।'
                  : 'Keep utility bills, memberships, and peer loans settled on time.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 10. Final Call to Action ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#179B51] text-white rounded-3xl p-8 sm:p-16 text-center space-y-6 shadow-xl"
        >
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
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-[#171717] bg-[#FBC02B] shadow-md hover:bg-amber-400 hover:shadow-lg transition-all cursor-pointer"
            >
              {locale === 'bn' ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন' : 'Get Started Free'}
            </Link>
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-semibold text-white bg-[#171717] shadow-md hover:bg-neutral-900 transition-all cursor-pointer"
            >
              {copiedInstall ? 'Command Copied' : 'Clone on GitHub'}
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─── 11. Dark Footer ─── */}
      <footer className="w-full bg-[#171717] text-[#FAFAF7] py-14 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <img src="/logo-smooth-rounded.svg" alt="খরচ" className="h-8 w-auto object-contain bg-white rounded p-0.5" />
              <span className="font-bold text-base text-[#FAFAF7]">Khoroch</span>
            </div>
            <p className="text-xs text-[#999999]">
              {locale === 'bn' ? 'নিজের খরচ ট্র্যাক করুন। টাকাকে বুঝুন।' : 'Track your spending. Understand your money.'}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-[#999999]">
            <a href="#voice" className="hover:text-[#FBC02B] transition-colors">{locale === 'bn' ? 'ভয়েস এআই' : 'Voice AI'}</a>
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
    </div>
  );
}
