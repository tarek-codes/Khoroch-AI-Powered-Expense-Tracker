'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring } from 'motion/react';
import {
  Microphone,
  Receipt,
  ArrowRight,
  Globe,
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

  const voiceDemos = {
    bn: {
      label: 'বাংলা',
      text: 'রিকশা ভাড়া ৫০ টাকা এবং কাঁচাবাজারে ৮৫০ টাকা বিকাশে দিলাম',
      parsed: [
        { name: 'কাঁচাবাজার', category: 'Groceries', amount: 850, method: 'bKash' },
        { name: 'রিকশা ভাড়া', category: 'Transportation', amount: 50, method: 'Cash' },
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

  const toggleSimulatedAudio = () => {
    setIsPlayingAudio((prev) => !prev);
    if (!isPlayingAudio) {
      toast.info(locale === 'bn' ? 'ভয়েস অডিও ডেমো প্লে হচ্ছে...' : 'Playing voice demo simulation...');
    }
  };

  return (
    <div
      className="min-h-screen text-neutral-900 selection:bg-[#179B51] selection:text-white relative overflow-x-hidden bg-[#FAFAF8]"
      style={{
        fontFamily: 'var(--font-jakarta), var(--font-sans), Inter, sans-serif',
      }}
    >
      {/* ─── Scroll Progress Bar ─── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#179B51] origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* ─── Minimal Navigation Bar with Extra Large Logo ─── */}
      <header className="w-full bg-[#FAFAF8]/90 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200/50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-22 flex items-center justify-between">
          {/* Extra Large Brand Logo */}
          <Link href="/" className="flex items-center group py-1">
            <img
              src="/logo-smooth-rounded.svg"
              alt="খরচ — Khoroch"
              className="h-13 sm:h-14 md:h-16 w-auto object-contain transition-transform group-hover:scale-102"
            />
          </Link>

          {/* Clean Navigation Links */}
          <nav className="hidden md:flex items-center gap-10 text-[15px] font-medium text-neutral-600">
            <a href="#voice" className="hover:text-neutral-950 transition-colors">
              {locale === 'bn' ? 'ভয়েস এআই' : 'Voice AI'}
            </a>
            <a href="#vision" className="hover:text-neutral-950 transition-colors">
              {locale === 'bn' ? 'রসিদ স্ক্যান' : 'Receipt OCR'}
            </a>
            <a href="#budget" className="hover:text-neutral-950 transition-colors">
              {locale === 'bn' ? 'বাজেট' : 'Budget'}
            </a>
            <a href="#insights" className="hover:text-neutral-950 transition-colors">
              {locale === 'bn' ? 'ইনসাইটস' : 'Insights'}
            </a>
            <a href="#how-it-works" className="hover:text-neutral-950 transition-colors">
              {locale === 'bn' ? 'কীভাবে কাজ করে' : 'How It Works'}
            </a>
          </nav>

          {/* Minimal Action Area */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700 transition-all cursor-pointer shadow-2xs"
            >
              <Globe size={14} className="text-[#179B51]" />
              <span>{locale === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {isHydrated && user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#179B51] hover:bg-[#148344] transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span>{locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                <ArrowRight size={13} />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors"
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#179B51] hover:bg-[#148344] transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <span>{locale === 'bn' ? 'শুরু করুন' : 'Get Started'}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── 1. Hero Section (Centered Minimalist Layout) ─── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-28 lg:pt-28 lg:pb-36 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 flex flex-col items-center"
        >
          <div className="space-y-6 flex flex-col items-center">
            {/* Prominent Large Brand Logo */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="cursor-pointer"
            >
              <img
                src="/logo-smooth-rounded.svg"
                alt="খরচ"
                className="h-20 sm:h-28 md:h-36 w-auto object-contain drop-shadow-xs"
              />
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-neutral-950 max-w-[20ch] mx-auto">
              {locale === 'bn' ? (
                <>
                  দৈনন্দিন খরচের ওপর সম্পূর্ণ{' '}
                  <span className="text-[#179B51]">নিয়ন্ত্রণ</span> নিন।
                </>
              ) : (
                <>
                  Take control of your everyday{' '}
                  <span className="text-[#179B51]">spending</span>.
                </>
              )}
            </h1>
          </div>

          <p className="text-base sm:text-lg text-neutral-500 font-normal leading-relaxed max-w-[54ch] mx-auto">
            {locale === 'bn'
              ? 'বাংলা বা ইংরেজিতে কথা বলে খরচ এন্ট্রি করুন, রসিদ স্ক্যান করুন এবং মাসিক বাজেট রাখুন সম্পূর্ণ নিয়ন্ত্রণে।'
              : 'Track expenses with natural voice, scan paper receipts with vision AI, and understand your cashflow in real time.'}
          </p>

          {/* Minimalist CTA */}
          <div className="flex items-center justify-center pt-2">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-full text-base font-semibold text-white bg-[#179B51] hover:bg-[#148344] transition-all text-center flex items-center justify-center gap-2 group shadow-xs"
            >
              <span>{locale === 'bn' ? 'বিনামূল্যে শুরু করুন' : 'Get Started Free'}</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Minimal Metric Strip */}
          <div className="flex items-center justify-center gap-8 sm:gap-14 pt-8 border-t border-neutral-200/60 max-w-lg mx-auto w-full">
            <div>
              <p className="font-mono text-2xl font-bold text-neutral-900">৳ 0</p>
              <p className="text-xs text-neutral-500 mt-0.5">{locale === 'bn' ? '১০০% ফ্রি' : 'Platform Fee'}</p>
            </div>
            <div className="w-px h-7 bg-neutral-200" />
            <div>
              <p className="font-mono text-2xl font-bold text-[#179B51]">&lt; 300ms</p>
              <p className="text-xs text-neutral-500 mt-0.5">{locale === 'bn' ? 'এআই স্পিড' : 'AI Parse Speed'}</p>
            </div>
            <div className="w-px h-7 bg-neutral-200" />
            <div>
              <p className="font-mono text-2xl font-bold text-neutral-900">100%</p>
              <p className="text-xs text-neutral-500 mt-0.5">{locale === 'bn' ? 'এনক্রিপ্টেড' : 'Private & Secure'}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── 2. Minimal Scrolling Ticker ─── */}
      <div className="w-full bg-neutral-900 text-neutral-200 py-4.5 overflow-hidden border-y border-neutral-800">
        <motion.div
          animate={{ x: [0, -1035] }}
          transition={{ repeat: Infinity, duration: 26, ease: 'linear' }}
          className="flex items-center gap-10 whitespace-nowrap text-xs font-medium uppercase tracking-wider font-mono shrink-0"
        >
          {[0, 1, 2].map((loop) => (
            <React.Fragment key={loop}>
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#179B51]" /> Voice AI Capture</span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#FBC02B]" /> Receipt Vision OCR</span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#179B51]" /> Monthly Budget Pacing</span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#FBC02B]" /> Debt & Lending Ledger</span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#179B51]" /> bKash, Nagad & Bank Sync</span>
              <span className="text-neutral-600">•</span>
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#FBC02B]" /> Spoken Bangla & English</span>
              <span className="text-neutral-600">•</span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>



      {/* ─── 4. Feature 1: Spoken Voice AI ─── */}
      <section id="voice" className="w-full py-28 border-b border-neutral-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 space-y-6"
            >
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#179B51]">
                01. Conversational Voice AI
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
                {locale === 'bn' ? 'শুধু বলুন আপনি কী খরচ করেছেন।' : 'Just say what you spent.'}
              </h3>
              <p className="text-base text-neutral-500 leading-relaxed">
                {locale === 'bn'
                  ? 'বাংলা, ইংরেজি বা চলতি বাংলিশে কথা বলুন। এআই স্বয়ংক্রিয়ভাবে ক্যাটাগরি, মার্চেন্ট ও টাকার পরিমাণ আলাদা করে সনাক্ত করবে।'
                  : 'Speak naturally in colloquial Bangla, English, or mixed phrases. Gemini LLM parses multiple line items in under 300ms.'}
              </p>

              <div className="flex items-center gap-2 pt-1">
                {(['bn', 'mixed', 'en'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveVoiceTab(tab)}
                    className={`px-4 py-2 rounded-full font-medium text-xs cursor-pointer transition-all ${
                      activeVoiceTab === tab
                        ? 'bg-neutral-900 text-white shadow-2xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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
              className="lg:col-span-6 bg-white border border-neutral-200/80 rounded-2xl p-7 shadow-2xs space-y-5"
            >
              <div className="p-4 bg-[#FAFAF8] rounded-xl border border-neutral-100 flex items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <span className="text-[11px] font-medium text-neutral-400 font-mono">Spoken Demo</span>
                  <p className="text-xs font-medium text-neutral-800 italic">
                    "{voiceDemos[activeVoiceTab].text}"
                  </p>
                </div>

                {/* Waveform */}
                <div className="flex items-center gap-1 h-6 shrink-0">
                  {[12, 22, 16, 26, 14, 24, 18, 10].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: isPlayingAudio ? [h, Math.max(6, (h * 1.6) % 26), h] : h }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                      className="w-1 bg-[#179B51] rounded-full"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {voiceDemos[activeVoiceTab].parsed.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-[#FAFAF8] rounded-xl border border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <PaymentMethodLogo name={item.method} size={20} />
                      <div>
                        <p className="text-xs font-semibold text-neutral-800">{item.name}</p>
                        <p className="text-[10px] text-neutral-400">{item.category} • {item.method}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#179B51]">৳ {item.amount}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={toggleSimulatedAudio}
                  className="flex-1 py-2.5 bg-white text-neutral-700 font-medium text-xs rounded-full border border-neutral-200 hover:bg-neutral-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  {isPlayingAudio ? <Pause size={14} /> : <Play size={14} className="text-[#179B51]" />}
                  <span>{isPlayingAudio ? 'Pause Simulation' : 'Play Audio'}</span>
                </button>
                <Link
                  href="/register"
                  className="flex-1 py-2.5 bg-[#179B51] text-white font-medium text-xs rounded-full hover:bg-[#148344] transition-all text-center shadow-2xs"
                >
                  Try in Full App →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 5. Feature 2: Receipt Vision OCR ─── */}
      <section id="vision" className="w-full bg-white py-28 border-b border-neutral-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 space-y-6 lg:order-2"
            >
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-400">
                02. Receipt Vision OCR
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
                {locale === 'bn' ? 'রসিদের ছবি থেকে সরাসরি খরচ।' : 'Turn receipts into expenses.'}
              </h3>
              <p className="text-base text-neutral-500 leading-relaxed">
                {locale === 'bn'
                  ? 'কাগজের রসিদের ছবি তুলুন। মার্চেন্টের নাম, মোট টাকা ও প্রতিটি আইটেম স্বয়ংক্রিয়ভাবে এক্সট্র্যাক্ট হয়ে যাবে।'
                  : 'Snap a photo of printed supermarket or dining receipts. Extract merchant, date, VAT, and line items in seconds.'}
              </p>

              <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                <span className="px-3 py-1 bg-neutral-100 rounded-full">Photo</span>
                <span>→</span>
                <span className="px-3 py-1 bg-neutral-100 rounded-full">Vision Scan</span>
                <span>→</span>
                <span className="px-3 py-1 bg-neutral-100 rounded-full">Extract</span>
                <span>→</span>
                <span className="px-3 py-1 bg-[#179B51] text-white rounded-full">Save</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 bg-[#FAFAF8] border border-neutral-200/80 rounded-2xl p-7 shadow-2xs space-y-4 lg:order-1"
            >
              <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2.5">
                <span className="font-semibold text-xs text-neutral-600">Receipt Extracted Preview</span>
                <span className="text-xs font-mono font-medium text-[#179B51]">
                  17 Aug 2026
                </span>
              </div>

              <div className="space-y-2.5 text-xs bg-white p-4 rounded-xl border border-neutral-100">
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Merchant</span>
                  <span className="font-semibold text-neutral-800">Shwapno Superstore</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Category</span>
                  <span className="font-semibold text-neutral-800">Groceries</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Items Detected</span>
                  <span className="font-semibold text-neutral-800">3 Line Items (VAT Included)</span>
                </div>
                <div className="flex justify-between py-2 pt-3 font-semibold text-sm">
                  <span className="text-neutral-900">Total Amount</span>
                  <span className="font-mono font-bold text-[#179B51]">৳ 1,850.00</span>
                </div>
              </div>

              <Link
                href="/register"
                className="w-full py-2.5 bg-[#179B51] text-white font-medium text-xs rounded-full hover:bg-[#148344] transition-all block text-center shadow-2xs"
              >
                Scan Your Receipts in Full App →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 6. Feature 3: Interactive Budget Calculator ─── */}
      <section id="budget" className="w-full py-28 border-b border-neutral-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 space-y-6"
            >
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#179B51]">
                03. Interactive Monthly Budget
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
                {locale === 'bn' ? 'মাসিক বাজেটের ওপর পূর্ণ নিয়ন্ত্রণ।' : 'Stay on top of your monthly budget.'}
              </h3>
              <p className="text-base text-neutral-500 leading-relaxed">
                {locale === 'bn'
                  ? 'মাসের শুরুতে টার্গেট বাজেট নির্ধারণ করুন এবং কত খরচ হয়েছে ও কত বাকি আছে তা লাইভ ট্র্যাক করুন।'
                  : 'Slide to adjust targets, observe spending pace, and prevent unexpected end-of-month budget shocks.'}
              </p>

              {/* Slider */}
              <div className="space-y-2 pt-2 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                <div className="flex justify-between text-xs font-medium text-neutral-600">
                  <span>Adjust Simulated Target:</span>
                  <span className="font-mono font-bold text-neutral-900">৳ {interactiveBudget.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="80000"
                  step="5000"
                  value={interactiveBudget}
                  onChange={(e) => setInteractiveBudget(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#179B51]"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6 bg-white border border-neutral-200/80 rounded-2xl p-7 shadow-2xs space-y-5"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <span className="text-xs text-neutral-400 font-medium">Target Budget</span>
                  <p className="text-2xl font-bold text-neutral-900 font-mono">৳ {interactiveBudget.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-400 font-medium">Remaining</span>
                  <p className="text-2xl font-bold text-[#179B51] font-mono">
                    ৳ {(interactiveBudget - interactiveSpent).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-neutral-600">
                  <span>Spent: ৳ {interactiveSpent.toLocaleString()}</span>
                  <span>{Math.round((interactiveSpent / interactiveBudget) * 100)}% spent</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#179B51] rounded-full"
                    animate={{ width: `${Math.min(100, Math.round((interactiveSpent / interactiveBudget) * 100))}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-medium">
                <div className="p-3 bg-[#FAFAF8] rounded-xl border border-neutral-100">
                  <p className="text-neutral-400 text-[11px]">Daily Average</p>
                  <p className="font-mono text-neutral-800 font-bold text-sm">৳ {Math.round(interactiveSpent / 16)}</p>
                </div>
                <div className="p-3 bg-[#FAFAF8] rounded-xl border border-neutral-100">
                  <p className="text-neutral-400 text-[11px]">Pace Status</p>
                  <p className="text-[#179B51] font-bold text-sm">Healthy</p>
                </div>
                <div className="p-3 bg-[#FAFAF8] rounded-xl border border-neutral-100">
                  <p className="text-neutral-400 text-[11px]">Days Left</p>
                  <p className="font-mono text-neutral-800 font-bold text-sm">14 Days</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 7. Spending Insights ─── */}
      <section id="insights" className="w-full bg-white py-28 border-b border-neutral-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="max-w-xl space-y-2">
            <h3 className="text-3xl font-bold tracking-tight text-neutral-900">
              {locale === 'bn' ? 'কোথায় কত খরচ হচ্ছে তার পরিষ্কার চিত্র' : 'Where your money goes'}
            </h3>
            <p className="text-base text-neutral-500">
              {locale === 'bn'
                ? 'ক্যাটাগরি অনুযায়ী খরচের বিশ্লেষণ দেখে বুঝে নিন কোন খাতে বেশি খরচ হচ্ছে।'
                : 'Clean, understandable category share without confusing visual clutter.'}
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-neutral-700">
                <span>Food & Dining</span>
                <span className="font-mono font-semibold">৳ 4,200 (35%)</span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
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
              <div className="flex justify-between text-xs font-medium text-neutral-700">
                <span>Utility Bills</span>
                <span className="font-mono font-semibold">৳ 3,200 (26%)</span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
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
              <div className="flex justify-between text-xs font-medium text-neutral-700">
                <span>Groceries & Shopping</span>
                <span className="font-mono font-semibold">৳ 2,300 (19%)</span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
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
              <div className="flex justify-between text-xs font-medium text-neutral-700">
                <span>Transportation</span>
                <span className="font-mono font-semibold">৳ 1,850 (15%)</span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '28%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full bg-neutral-800 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. How It Works ─── */}
      <section id="how-it-works" className="w-full py-28 border-b border-neutral-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
              {locale === 'bn' ? 'সহজ চার ধাপে সম্পূর্ণ নিয়ন্ত্রণ' : 'How Khoroch Works'}
            </h2>
            <p className="text-base text-neutral-500">
              {locale === 'bn'
                ? 'কোনো জটিলতা ছাড়া চার ধাপে আপনার পার্সোনাল ফাইন্যান্স সাজিয়ে নিন।'
                : 'Four straightforward steps to achieve daily clarity.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <span className="text-3xl font-bold text-[#179B51] font-mono block">01</span>
              <h4 className="font-semibold text-base text-neutral-900">
                {locale === 'bn' ? 'বাজেট সেট করুন' : 'Set your budget'}
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {locale === 'bn'
                  ? 'মাসের শুরুতে স্টার্টিং ব্যালেন্স ও খরচের লিমিট নির্ধারণ করুন।'
                  : 'Define your starting monthly target and spending boundary.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <span className="text-3xl font-bold text-[#179B51] font-mono block">02</span>
              <h4 className="font-semibold text-base text-neutral-900">
                {locale === 'bn' ? 'খরচ রেকর্ড করুন' : 'Track expenses'}
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {locale === 'bn'
                  ? 'ভয়েস ইনপুট, রসিদ স্ক্যান বা কুইক ফর্মের মাধ্যমে সহজে রেকর্ড করুন।'
                  : 'Log expenses in seconds via voice capture, receipt camera scan, or form.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <span className="text-3xl font-bold text-[#179B51] font-mono block">03</span>
              <h4 className="font-semibold text-base text-neutral-900">
                {locale === 'bn' ? 'অভ্যাস বুঝুন' : 'Understand habits'}
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {locale === 'bn'
                  ? 'ক্যাটাগরি ও পেমেন্ট চ্যানেল ভিত্তিক হিসাব দেখে খরচ অপ্টিমাইজ করুন।'
                  : 'See where money flows across bKash, Nagad, cards, and cash.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <span className="text-3xl font-bold text-[#179B51] font-mono block">04</span>
              <h4 className="font-semibold text-base text-neutral-900">
                {locale === 'bn' ? 'নিয়ন্ত্রণে থাকুন' : 'Stay in control'}
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {locale === 'bn'
                  ? 'ইউটিলিটি বিল, সাবস্ক্রিপশন ও ধার-দেনার নিখুঁত ব্যালেন্স বজায় রাখুন।'
                  : 'Keep utility bills, memberships, and peer loans settled on time.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 9. Minimalist Final Call to Action ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#179B51] text-white rounded-3xl p-8 sm:p-16 text-center space-y-6 shadow-md"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            {locale === 'bn'
              ? 'খরচের হিসাব সাজাতে আপনি প্রস্তুত?'
              : 'Ready to take control of your spending?'}
          </h2>
          <p className="text-base text-emerald-100 font-normal max-w-[44ch] mx-auto leading-relaxed">
            {locale === 'bn'
              ? 'আজই শুরু করুন সম্পূর্ণ বিনামূল্যে। কোনো ক্রেডিট কার্ডের প্রয়োজন নেই।'
              : 'Start tracking your expenses with Khoroch. Free and open source.'}
          </p>
          <div className="pt-2 flex items-center justify-center">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-full text-base font-semibold text-neutral-950 bg-white hover:bg-neutral-100 transition-all cursor-pointer shadow-xs"
            >
              {locale === 'bn' ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন' : 'Get Started Free'}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── 10. Clean Minimal Footer ─── */}
      <footer className="w-full bg-white text-neutral-600 py-12 border-t border-neutral-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo-smooth-rounded.svg" alt="খরচ" className="h-8 w-auto object-contain" />
            <p className="text-xs text-neutral-400">
              {locale === 'bn' ? 'নিজের খরচ ট্র্যাক করুন। টাকাকে বুঝুন।' : 'Track your spending. Understand your money.'}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-neutral-500">
            <a href="#voice" className="hover:text-neutral-900 transition-colors">{locale === 'bn' ? 'ভয়েস এআই' : 'Voice AI'}</a>
            <a href="#how-it-works" className="hover:text-neutral-900 transition-colors">{locale === 'bn' ? 'কীভাবে কাজ করে' : 'How It Works'}</a>
            <Link href="/login" className="hover:text-neutral-900 transition-colors">{t.login}</Link>
            <Link href="/register" className="hover:text-neutral-900 transition-colors">{t.register}</Link>
            <a
              href="https://github.com/tarek-codes/Khoroch-AI-Powered-Expense-Tracker"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-900 transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="text-xs text-neutral-400 font-mono">
            © {new Date().getFullYear()} Khoroch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
