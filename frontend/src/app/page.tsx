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
  const [voiceInputSimulated, setVoiceInputSimulated] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('git clone https://github.com/tarek-codes/Khoroch-AI-Powered-Expense-Tracker.git');
    setCopiedInstall(true);
    toast.success(locale === 'bn' ? 'কমান্ড কপি হয়েছে' : 'Clone command copied');
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  return (
    <div
      className="min-h-screen text-[#171717] selection:bg-[#179B51] selection:text-white"
      style={{
        backgroundColor: '#FAFAF7',
        fontFamily: 'var(--font-sans), Inter, sans-serif',
      }}
    >
      {/* ─── 6. Navigation Bar ─── */}
      <header className="w-full border-b-2 border-[#171717] bg-[#FAFAF7] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo-smooth-rounded.svg" alt="খরচ" className="h-9 w-auto object-contain" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#171717]">
            <a href="#features" className="hover:text-[#179B51] transition-colors">
              {locale === 'bn' ? 'ফিচারসমূহ' : 'Features'}
            </a>
            <a href="#how-it-works" className="hover:text-[#179B51] transition-colors">
              {locale === 'bn' ? 'কীভাবে কাজ করে' : 'How It Works'}
            </a>
            <a href="#budget" className="hover:text-[#179B51] transition-colors">
              {locale === 'bn' ? 'বাজেট' : 'Budget'}
            </a>
            <a href="#insights" className="hover:text-[#179B51] transition-colors">
              {locale === 'bn' ? 'ইনসাইটস' : 'Insights'}
            </a>
          </nav>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
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
                className="px-4 py-2 rounded-[6px] text-xs font-bold text-white bg-[#179B51] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
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
                  className="px-4 py-2 rounded-[6px] text-xs font-bold text-white bg-[#179B51] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  {locale === 'bn' ? 'শুরু করুন' : 'Get Started'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── 7-10. Hero Section ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.02] text-[#171717]">
              {locale === 'bn' ? (
                <>
                  দৈনন্দিন খরচের ওপর সম্পূর্ণ{' '}
                  <span className="text-[#179B51] underline decoration-4 decoration-[#FBC02B]">নিয়ন্ত্রণ</span> নিন।
                </>
              ) : (
                <>
                  Take control of your everyday{' '}
                  <span className="text-[#179B51]">spending</span>.
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-[#666666] font-medium leading-relaxed max-w-[50ch]">
              {locale === 'bn'
                ? 'দৈনন্দিন খরচ ট্র্যাক করুন, মাসিক বাজেট নিয়ন্ত্রণ করুন এবং জানুন আপনার টাকা কোথায় যায়।'
                : 'Track expenses, manage your monthly budget, and understand where your money goes.'}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/register"
                className="px-6 py-3.5 rounded-[6px] text-base font-bold text-white bg-[#179B51] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-center"
              >
                {locale === 'bn' ? 'বিনামূল্যে শুরু করুন' : 'Get Started'}
              </Link>
              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-[6px] text-base font-bold text-[#171717] bg-[#FFFFFF] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-center"
              >
                {locale === 'bn' ? 'কীভাবে কাজ করে' : 'See How It Works'}
              </a>
            </div>
          </div>

          {/* Right Hero Product Preview (Real UI anchor per Section 9) */}
          <div className="lg:col-span-5">
            <div className="bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[6px_6px_0px_#171717] p-6 space-y-5">
              <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#179B51] inline-block border border-[#171717]" />
                  <span className="font-bold text-sm text-[#171717]">Khoroch Dashboard</span>
                </div>
                <span className="text-xs font-bold bg-[#FBC02B] text-[#171717] px-2 py-0.5 rounded border border-[#171717]">
                  August 2026
                </span>
              </div>

              {/* Remaining Balance */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#666666] uppercase tracking-wider">Remaining Balance</p>
                <p className="text-3xl font-extrabold text-[#171717] font-mono">
                  {locale === 'bn' ? '৳ ১৮,৪৫০' : '৳ 18,450'}
                </p>
              </div>

              {/* Monthly Budget Summary */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAFAF7] border-2 border-[#171717] rounded-[6px]">
                <div>
                  <p className="text-[11px] font-bold text-[#666666]">Monthly Budget</p>
                  <p className="text-sm font-bold text-[#171717] font-mono">৳ 30,000</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#666666]">Total Spent</p>
                  <p className="text-sm font-bold text-[#179B51] font-mono">৳ 11,550</p>
                </div>
              </div>

              {/* Recent Expenses List */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#666666] uppercase tracking-wider">Recent Expenses</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 bg-[#FFFFFF] border-2 border-[#171717] rounded-[6px]">
                    <div className="flex items-center gap-2">
                      <PaymentMethodLogo name="bKash" size={20} />
                      <span className="text-xs font-bold text-[#171717]">Lunch & Cafe</span>
                    </div>
                    <span className="font-mono text-xs font-extrabold text-[#171717]">-৳ 350</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#FFFFFF] border-2 border-[#171717] rounded-[6px]">
                    <div className="flex items-center gap-2">
                      <PaymentMethodLogo name="Nagad" size={20} />
                      <span className="text-xs font-bold text-[#171717]">Uber Transport</span>
                    </div>
                    <span className="font-mono text-xs font-extrabold text-[#171717]">-৳ 420</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#FFFFFF] border-2 border-[#171717] rounded-[6px]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#179B51] text-white flex items-center justify-center text-[10px] font-bold border border-[#171717]">
                        ৳
                      </span>
                      <span className="text-xs font-bold text-[#171717]">Kacha Bazar</span>
                    </div>
                    <span className="font-mono text-xs font-extrabold text-[#171717]">-৳ 1,850</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. Value Strip (Compact & Clean) ─── */}
      <div className="w-full border-y-2 border-[#171717] bg-[#FBC02B] py-3.5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center font-bold text-sm sm:text-base text-[#171717] tracking-tight">
            {locale === 'bn'
              ? 'খরচ ট্র্যাক করুন  •  বাজেট নিয়ন্ত্রণ করুন  •  রসিদ স্ক্যান করুন  •  আর্থিক বিশ্লেষণ জানুন'
              : 'Track expenses  •  Manage budgets  •  Scan receipts  •  Spending insights'}
          </p>
        </div>
      </div>

      {/* ─── 12. Problem Section ─── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#171717]">
          {locale === 'bn' ? 'আপনার টাকা আসলে কোথায় যায়?' : 'Where does your money actually go?'}
        </h2>
        <p className="text-base sm:text-lg text-[#666666] leading-relaxed max-w-[60ch] mx-auto">
          {locale === 'bn'
            ? 'প্রতিদিনের ছোট ছোট খরচ দ্রুত জমা হয়ে যায়। খরচ আপনাকে প্রতিটি ব্যয়ের নিখুঁত হিসাব রাখতে, অভ্যাস বুঝতে এবং কত টাকা বাকি আছে তা পরিষ্কার দেখতে সাহায্য করে।'
            : 'Small expenses add up quickly. Khoroch helps you keep track of your spending, understand your habits, and know exactly how much money you have left.'}
        </p>
      </section>

      {/* ─── 13. Feature 1 — Expense Tracking (Editorial Split Layout) ─── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t-2 border-[#171717]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#179B51]">01. Manual and Quick Entry</span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#171717]">
              {locale === 'bn' ? 'প্রতিটি খরচের হিসাব রাখুন।' : 'Track every expense.'}
            </h3>
            <p className="text-base text-[#666666] leading-relaxed max-w-[44ch]">
              {locale === 'bn'
                ? 'ম্যানুয়ালি হিসাব মেলাতে আর কোনো ঝামেলা নেই। কোথায় কত টাকা খরচ হচ্ছে তা পরিষ্কার রাখুন।'
                : 'Know where every taka goes without manually piecing everything together at the end of the month.'}
            </p>
          </div>

          {/* Product Interface Mock */}
          <div className="bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[4px_4px_0px_#171717] p-6 space-y-4 max-w-md mx-auto w-full">
            <div className="border-b-2 border-[#171717] pb-2 font-bold text-sm">
              {locale === 'bn' ? 'নতুন খরচ যোগ করুন' : 'New Expense Entry'}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#666666] block mb-1">Amount (৳)</label>
                <div className="w-full p-2.5 bg-[#FAFAF7] border-2 border-[#171717] rounded-[6px] font-mono font-bold text-base">
                  ৳ 450.00
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#666666] block mb-1">Category</label>
                <div className="w-full p-2.5 bg-[#FAFAF7] border-2 border-[#171717] rounded-[6px] font-bold text-sm">
                  Food & Dining
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#666666] block mb-1">Payment Method</label>
                <div className="flex items-center gap-2 p-2.5 bg-[#FAFAF7] border-2 border-[#171717] rounded-[6px]">
                  <PaymentMethodLogo name="bKash" size={20} />
                  <span className="font-bold text-sm">bKash Wallet</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.success(locale === 'bn' ? 'খরচ সংরক্ষিত হয়েছে!' : 'Expense saved successfully!')}
                className="w-full py-3 bg-[#179B51] text-white font-bold text-sm rounded-[6px] border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
              >
                {locale === 'bn' ? 'খরচ সংরক্ষণ করুন' : 'Save Expense'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 14. Feature 2 — Voice Expenses (Section 14) ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t-2 border-[#171717]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#179B51]">02. Voice Capture</span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#171717]">
              {locale === 'bn' ? 'শুধু বলুন আপনি কী খরচ করেছেন।' : 'Just say what you spent.'}
            </h3>
            <p className="text-base text-[#666666] leading-relaxed max-w-[44ch]">
              {locale === 'bn'
                ? 'বাংলা বা ইংরেজিতে স্বাভাবিকভাবে কথা বলুন। এআই স্বয়ংক্রিয়ভাবে ক্যাটাগরি, মার্চেন্ট ও টাকার পরিমাণ আলাদা করে সনাক্ত করবে।'
                : 'Speak in conversational Bangla, English, or mixed sentences. Khoroch detects the category, merchant, and amount with zero hassle.'}
            </p>
          </div>

          {/* Voice Workflow UI */}
          <div className="bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[4px_4px_0px_#171717] p-6 space-y-4 max-w-md mx-auto w-full">
            <div className="p-3 bg-[#FAFAF7] border-2 border-[#171717] rounded-[6px] flex items-center justify-between">
              <span className="text-sm font-semibold italic text-[#171717]">
                "I spent 350 taka on lunch via bKash."
              </span>
              <button
                type="button"
                onClick={() => {
                  setVoiceInputSimulated(true);
                  toast.success(locale === 'bn' ? 'ভয়েস প্রসেস হয়েছে!' : 'Voice detected and parsed!');
                }}
                className="p-2 rounded-[6px] bg-[#179B51] text-white border-2 border-[#171717] cursor-pointer hover:bg-[#148344]"
                title="Simulate Voice"
              >
                <Microphone size={16} weight="fill" />
              </button>
            </div>

            <div className="text-center font-bold text-xs text-[#666666]">
              ↓ Expense detected
            </div>

            <div className="p-4 bg-[#FAFAF7] border-2 border-[#171717] rounded-[6px] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#666666]">Category</span>
                <span className="text-xs font-extrabold text-[#171717] bg-[#FBC02B] px-2 py-0.5 rounded border border-[#171717]">
                  Food & Dining
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#666666]">Description</span>
                <span className="text-xs font-bold text-[#171717]">Lunch</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#666666]">Amount</span>
                <span className="font-mono text-sm font-extrabold text-[#179B51]">৳ 350.00</span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t-2 border-[#171717]">
                <button
                  type="button"
                  className="flex-1 py-1.5 bg-[#FFFFFF] text-[#171717] font-bold text-xs rounded border border-[#171717] hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => toast.success(locale === 'bn' ? 'নিশ্চিত করা হয়েছে!' : 'Confirmed!')}
                  className="flex-1 py-1.5 bg-[#179B51] text-white font-bold text-xs rounded border border-[#171717] hover:bg-[#148344]"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 15. Feature 3 — Receipt Scanning (Section 15) ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t-2 border-[#171717]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#179B51]">03. Vision Scanner</span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#171717]">
              {locale === 'bn' ? 'রসিদের ছবি থেকে সরাসরি খরচ।' : 'Turn receipts into expenses.'}
            </h3>
            <p className="text-base text-[#666666] leading-relaxed max-w-[44ch]">
              {locale === 'bn'
                ? 'কাগজের রসিদের ছবি ড্রপ করুন। মার্চেন্টের নাম, মোট টাকা ও প্রতিটি আইটেম স্বয়ংক্রিয়ভাবে এক্সট্র্যাক্ট হয়ে যাবে।'
                : 'Snap a photo of printed supermarket or pharmacy receipts. Extract merchant, date, VAT, and line items in seconds.'}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#666666]">
              <span className="px-2 py-1 bg-[#FAFAF7] border border-[#171717] rounded">Receipt</span>
              <span>→</span>
              <span className="px-2 py-1 bg-[#FAFAF7] border border-[#171717] rounded">Scan</span>
              <span>→</span>
              <span className="px-2 py-1 bg-[#FAFAF7] border border-[#171717] rounded">Extract</span>
              <span>→</span>
              <span className="px-2 py-1 bg-[#179B51] text-white border border-[#171717] rounded">Confirm</span>
            </div>
          </div>

          {/* Receipt Interface Card */}
          <div className="bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[4px_4px_0px_#171717] p-6 space-y-4 max-w-md mx-auto w-full">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
              <span className="font-bold text-sm">Receipt Extracted</span>
              <span className="text-xs font-bold text-[#179B51]">17 Aug 2026</span>
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
                <span className="font-bold text-[#666666]">Items Extracted</span>
                <span className="font-bold text-[#171717]">3 Line Items</span>
              </div>
              <div className="flex justify-between py-2 pt-3 font-bold text-sm">
                <span className="text-[#171717]">Total Amount</span>
                <span className="font-mono text-base font-extrabold text-[#179B51]">৳ 1,850.00</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toast.success(locale === 'bn' ? 'রসিদ সংরক্ষিত হয়েছে!' : 'Receipt confirmed!')}
              className="w-full py-2.5 bg-[#179B51] text-white font-bold text-xs rounded-[6px] border-2 border-[#171717] shadow-[2px_2px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
            >
              {locale === 'bn' ? 'রসিদ সংরক্ষণ করুন' : 'Confirm & Save Receipt'}
            </button>
          </div>
        </div>
      </section>

      {/* ─── 16. Monthly Budget Section (Section 16) ─── */}
      <section id="budget" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t-2 border-[#171717]">
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#179B51]">04. Budgeting Target</span>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#171717]">
            {locale === 'bn' ? 'মাসিক বাজেটের ওপর পূর্ণ নিয়ন্ত্রণ।' : 'Stay on top of your monthly budget.'}
          </h3>
          <p className="text-base text-[#666666]">
            {locale === 'bn'
              ? 'মাসের শুরুতে টার্গেট বাজেট নির্ধারণ করুন এবং কত খরচ হয়েছে ও কত বাকি আছে তা লাইভ ট্র্যাক করুন।'
              : 'Set a starting target, track daily pacing, and avoid unexpected end-of-month budget shocks.'}
          </p>
        </div>

        {/* Budget Neo-Brutalist Box */}
        <div className="max-w-xl mx-auto bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[6px_6px_0px_#171717] p-7 space-y-6">
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

          {/* Progress Bar (Flat, Restrained per Section 16) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#171717]">
              <span>Spent: ৳ 11,550</span>
              <span>38.5% spent</span>
            </div>
            <div className="w-full h-4 bg-[#FAFAF7] border-2 border-[#171717] rounded-[4px] overflow-hidden p-0.5">
              <div
                className="h-full bg-[#179B51] rounded-[2px]"
                style={{ width: '38.5%' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-bold">
            <div className="p-2 bg-[#FAFAF7] border border-[#171717] rounded">
              <p className="text-[#666666] text-[10px]">Daily Avg</p>
              <p className="font-mono text-[#171717]">৳ 679</p>
            </div>
            <div className="p-2 bg-[#FAFAF7] border border-[#171717] rounded">
              <p className="text-[#666666] text-[10px]">Pace Status</p>
              <p className="text-[#179B51]">Healthy</p>
            </div>
            <div className="p-2 bg-[#FAFAF7] border border-[#171717] rounded">
              <p className="text-[#666666] text-[10px]">Days Left</p>
              <p className="font-mono text-[#171717]">14 Days</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 17. Yellow Brand Breakout Section (Section 17) ─── */}
      <section className="w-full bg-[#FBC02B] border-y-2 border-[#171717] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#171717]">
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
              className="inline-block px-8 py-3.5 rounded-[6px] text-base font-bold text-[#171717] bg-[#FFFFFF] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              {locale === 'bn' ? 'ট্র্যাকিং শুরু করুন' : 'Start Tracking'}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 18. Spending Insights (Section 18) ─── */}
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

        {/* Flat Bars Breakdown */}
        <div className="max-w-2xl mx-auto bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[6px_6px_0px_#171717] p-7 space-y-5">
          <div className="space-y-4">
            {/* Food */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#171717] mb-1">
                <span>Food & Dining</span>
                <span className="font-mono">৳ 4,200</span>
              </div>
              <div className="w-full h-3 bg-[#FAFAF7] border border-[#171717] rounded-[3px] overflow-hidden">
                <div className="h-full bg-[#179B51]" style={{ width: '65%' }} />
              </div>
            </div>

            {/* Bills */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#171717] mb-1">
                <span>Utility Bills</span>
                <span className="font-mono">৳ 3,200</span>
              </div>
              <div className="w-full h-3 bg-[#FAFAF7] border border-[#171717] rounded-[3px] overflow-hidden">
                <div className="h-full bg-[#179B51]" style={{ width: '48%' }} />
              </div>
            </div>

            {/* Shopping */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#171717] mb-1">
                <span>Groceries & Shopping</span>
                <span className="font-mono">৳ 2,300</span>
              </div>
              <div className="w-full h-3 bg-[#FAFAF7] border border-[#171717] rounded-[3px] overflow-hidden">
                <div className="h-full bg-[#FBC02B]" style={{ width: '35%' }} />
              </div>
            </div>

            {/* Transport */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#171717] mb-1">
                <span>Transportation</span>
                <span className="font-mono">৳ 1,850</span>
              </div>
              <div className="w-full h-3 bg-[#FAFAF7] border border-[#171717] rounded-[3px] overflow-hidden">
                <div className="h-full bg-[#171717]" style={{ width: '28%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 19. How It Works (Numbered Editorial Layout per Section 19) ─── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t-2 border-[#171717]">
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
          <div className="p-6 bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[4px_4px_0px_#171717] space-y-3">
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

          <div className="p-6 bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[4px_4px_0px_#171717] space-y-3">
            <span className="text-3xl font-black text-[#179B51] font-mono block">02</span>
            <h4 className="font-bold text-lg text-[#171717]">
              {locale === 'bn' ? 'খরচ রেকর্ড করুন' : 'Track your expenses'}
            </h4>
            <p className="text-xs text-[#666666] leading-relaxed">
              {locale === 'bn'
                ? 'ভয়েস ইনপুট, রসিদ স্ক্যান বা কুইক ফর্মের মাধ্যমে সহজে রেকর্ড করুন।'
                : 'Log expenses in seconds via voice capture, receipt camera scan, or form.'}
            </p>
          </div>

          <div className="p-6 bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[4px_4px_0px_#171717] space-y-3">
            <span className="text-3xl font-black text-[#179B51] font-mono block">03</span>
            <h4 className="font-bold text-lg text-[#171717]">
              {locale === 'bn' ? 'অভ্যাস বুঝুন' : 'Understand spending'}
            </h4>
            <p className="text-xs text-[#666666] leading-relaxed">
              {locale === 'bn'
                ? 'ক্যাটাগরি ও পেমেন্ট চ্যানেল ভিত্তিক হিসাব দেখে খরচ অপ্টিমাইজ করুন।'
                : 'See where money flows across bKash, Nagad, cards, and cash.'}
            </p>
          </div>

          <div className="p-6 bg-[#FFFFFF] border-2 border-[#171717] rounded-[8px] shadow-[4px_4px_0px_#171717] space-y-3">
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

      {/* ─── 20. Final Call to Action (Section 20) ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-[#179B51] text-white border-2 border-[#171717] rounded-[8px] shadow-[6px_6px_0px_#171717] p-8 sm:p-14 text-center space-y-5">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {locale === 'bn'
              ? 'খরচের হিসাব সাজাতে আপনি প্রস্তুত?'
              : 'Ready to take control of your spending?'}
          </h2>
          <p className="text-base sm:text-lg text-emerald-100 max-w-[48ch] mx-auto leading-relaxed">
            {locale === 'bn'
              ? 'আজই শুরু করুন সম্পূর্ণ বিনামূল্যে। কোনো ক্রেডিট কার্ডের প্রয়োজন নেই।'
              : 'Start tracking your expenses with Khoroch. Free and open source.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-[6px] text-base font-bold text-[#171717] bg-[#FBC02B] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
            >
              {locale === 'bn' ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন' : 'Get Started'}
            </Link>
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-6 py-3.5 rounded-[6px] text-base font-bold text-white bg-[#171717] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
            >
              {copiedInstall ? 'Command Copied' : 'Clone on GitHub'}
            </button>
          </div>
        </div>
      </section>

      {/* ─── 21. Clean Dark Minimal Footer (Section 21) ─── */}
      <footer className="w-full bg-[#171717] text-[#FAFAF7] border-t-2 border-[#171717] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <img src="/logo-smooth-rounded.svg" alt="খরচ" className="h-7 w-auto object-contain bg-white rounded p-0.5" />
              <span className="font-extrabold text-base text-[#FAFAF7]">Khoroch</span>
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

          <div className="text-xs text-[#666666]">
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
