'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarBlank,
  Wallet,
  TrendDown,
  TrendUp,
  Plus,
  Lightning,
  CaretRight,
  CheckCircle,
  ArrowUpRight,
  Sparkle,
  Microphone,
  UploadSimple,
  Clock,
  Globe,
  Bell,
  Sun,
  Moon,
  Receipt,
} from '@phosphor-icons/react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { translations, formatMoney, toBengaliNumber } from '@/lib/i18n';
import { Sidebar } from '@/components/Sidebar';
import { VoiceModal } from '@/components/VoiceModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { BudgetModal } from '@/components/BudgetModal';
import { CategoryIcon } from '@/components/CategoryIcon';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, locale, setLocale, theme, setTheme } = useAppStore();
  const t = translations[locale];

  const [categories, setCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [dailyTrends, setDailyTrends] = useState<any[]>([]);
  const [trajectoryFilter, setTrajectoryFilter] = useState<'week' | '3m' | '6m' | 'year' | 'all'>('6m');
  const [transactionDays, setTransactionDays] = useState<'7' | '15' | '30'>('30');
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);

  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };
      setCurrentDateTime(now.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [locale]);

  const fetchTransactionCount = async (days: string) => {
    try {
      const now = new Date();
      const pastDate = new Date();
      pastDate.setDate(now.getDate() - parseInt(days, 10));
      const startDateStr = pastDate.toISOString().split('T')[0];
      const res: any = await api.get(`/expenses?startDate=${startDateStr}&limit=1`);
      setTransactionCount(res.data?.meta?.totalItems || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactionCount(transactionDays);
    }
  }, [user, transactionDays]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [catRes, pmRes, dashRes, monthlyTrendRes, dailyTrendRes]: any = await Promise.all([
        api.get('/categories'),
        api.get('/payment-methods'),
        api.get('/analytics/dashboard'),
        api.get('/analytics/trends?period=monthly'),
        api.get('/analytics/trends?period=daily'),
      ]);

      setCategories(catRes.data || []);
      setPaymentMethods(pmRes.data || []);
      setDashboardData(dashRes.data || null);
      setMonthlyTrends(monthlyTrendRes.data || []);
      setDailyTrends(dailyTrendRes.data || []);
      fetchTransactionCount(transactionDays);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTrendsData = () => {
    if (trajectoryFilter === 'week') {
      return dailyTrends.slice(-7);
    }
    if (trajectoryFilter === '3m') {
      return monthlyTrends.slice(-3);
    }
    if (trajectoryFilter === '6m') {
      return monthlyTrends.slice(-6);
    }
    if (trajectoryFilter === 'year') {
      return monthlyTrends.slice(-12);
    }
    return monthlyTrends;
  };

  const formatMonthLabel = (period: string) => {
    if (!period) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
      const d = new Date(period);
      return d.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
    }
    if (/^\d{4}-\d{2}$/.test(period)) {
      const monthNum = parseInt(period.split('-')[1], 10);
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthsBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
      if (monthNum >= 1 && monthNum <= 12) {
        return locale === 'bn' ? monthsBn[monthNum - 1] : monthsEn[monthNum - 1];
      }
    }
    return period;
  };

  const formatFullPeriodLabel = (period: string) => {
    if (!period) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
      const d = new Date(period);
      return d.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
    if (/^\d{4}-\d{2}$/.test(period)) {
      const [year, m] = period.split('-');
      const monthNum = parseInt(m, 10);
      const fullMonthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const fullMonthsBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
      const name = locale === 'bn' ? fullMonthsBn[monthNum - 1] : fullMonthsEn[monthNum - 1];
      const yr = locale === 'bn' ? toBengaliNumber(year) : year;
      return `${name} ${yr}`;
    }
    return period;
  };

  const formatRelativeDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!user) return null;

  const budget = dashboardData?.budget || {
    startingBalance: 0,
    totalSpent: 0,
    remainingBalance: 0,
    spendingPercentage: 0,
  };

  const topCategories = dashboardData?.topCategories || [];
  const recentExpenses = dashboardData?.recentExpenses || [];

  const PALETTE_COLORS = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

  const chartAxisColor = theme === 'dark' ? '#34d399' : '#059669';
  const chartTooltipBg = theme === 'dark' ? '#18181c' : '#ffffff';
  const chartTooltipBorder = theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
  const chartTooltipText = theme === 'dark' ? '#f8fafc' : '#0f172a';

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.firstName || '';
    if (locale === 'bn') {
      if (hour < 12) return `শুভ সকাল${name ? `, ${name}` : ''}`;
      if (hour < 17) return `শুভ অপরাহ্ন${name ? `, ${name}` : ''}`;
      return `শুভ সন্ধ্যা${name ? `, ${name}` : ''}`;
    }
    if (hour < 12) return `Good Morning${name ? `, ${name}` : ''}`;
    if (hour < 17) return `Good Afternoon${name ? `, ${name}` : ''}`;
    return `Good Evening${name ? `, ${name}` : ''}`;
  };

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = Math.max(1, new Date().getDate());
  const dailyAverage = Math.round((budget.totalSpent || 0) / currentDay);

  return (
    <div
      className="min-h-screen flex transition-colors duration-150"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      <Sidebar
        onOpenVoiceModal={() => setIsVoiceOpen(true)}
        onOpenReceiptModal={() => setIsReceiptOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-5 lg:p-7 space-y-5 max-w-[1640px] w-full mx-auto">
          {/* 1. Header Hero Card with Actions */}
          <div
            className="rounded-2xl p-5 lg:p-6 text-white shadow-xs relative overflow-hidden transition-all"
            style={{
              backgroundColor: theme === 'dark' ? '#064e3b' : '#065f46',
              border: '1px solid ' + (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              {/* Left: Avatar, Greeting, Voice Action & Date */}
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white font-extrabold text-xl shrink-0 shadow-xs transition-all hover:scale-105 hover:bg-white/25 group"
                  title="View User Profile"
                >
                  <span className="group-hover:scale-110 transition-transform">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </span>
                </Link>

                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                      {getGreeting()}
                    </h1>

                    {/* High-visibility Voice Entry Action Pill */}
                    <button
                      onClick={() => setIsVoiceOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm hover:bg-red-50 active:scale-95 ml-1"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#dc2626',
                        border: '1px solid rgba(220, 38, 38, 0.25)',
                      }}
                      title="Click to speak and automatically add an expense"
                    >
                      <Microphone size={14} weight="fill" className="text-red-600 animate-pulse" />
                      <span className="font-extrabold text-red-600">
                        {locale === 'bn' ? 'ভয়েস এন্ট্রি' : 'Voice Input'}
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-100/90 font-semibold">
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                    >
                      <CalendarBlank size={13} weight="bold" />
                      <span>{currentDateTime || 'Today'}</span>
                    </div>
                    <span className="opacity-40">•</span>
                    <span>
                      {locale === 'bn' ? 'এআই এক্সপেন্স ট্র্যাকার' : 'AI Powered Expense Tracker'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Controls & CTAs */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Language Switcher */}
                <button
                  onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-white border border-white/20 transition-all hover:bg-white/20 active:scale-95"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                  title="Switch Language"
                >
                  <Globe size={14} weight="bold" />
                  <span>{locale === 'en' ? 'বাংলা' : 'English'}</span>
                </button>

                {/* Notifications */}
                <button
                  onClick={() => toast.info('No new unread alerts.')}
                  className="p-2 rounded-full text-white border border-white/20 relative transition-all hover:bg-white/20 active:scale-95"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                  title="Notifications"
                >
                  <Bell size={15} weight="bold" />
                  <span className="w-1.5 h-1.5 rounded-full absolute top-1.5 right-1.5 bg-amber-300 ring-2 ring-emerald-800" />
                </button>

                {/* Light / Dark Mode Toggle */}
                <ToggleGroup.Root
                  type="single"
                  value={theme}
                  onValueChange={(value) => {
                    if (value) setTheme(value as 'light' | 'dark');
                  }}
                  className="flex p-0.5 rounded-full border border-white/20"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                >
                  <ToggleGroup.Item
                    value="light"
                    className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all"
                    style={{
                      backgroundColor: theme === 'light' ? '#ffffff' : 'transparent',
                      color: theme === 'light' ? '#065f46' : '#ffffff',
                    }}
                    title="Light Mode"
                  >
                    <Sun size={13} weight={theme === 'light' ? 'fill' : 'regular'} />
                    <span className="text-[11px]">Light</span>
                  </ToggleGroup.Item>
                  <ToggleGroup.Item
                    value="dark"
                    className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all"
                    style={{
                      backgroundColor: theme === 'dark' ? '#ffffff' : 'transparent',
                      color: theme === 'dark' ? '#064e3b' : '#ffffff',
                    }}
                    title="Dark Mode"
                  >
                    <Moon size={13} weight={theme === 'dark' ? 'fill' : 'regular'} />
                    <span className="text-[11px]">Dark</span>
                  </ToggleGroup.Item>
                </ToggleGroup.Root>

                {/* Upload Receipt */}
                <button
                  onClick={() => setIsReceiptOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-white border border-white/20 transition-all hover:bg-white/20 active:scale-95"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                >
                  <UploadSimple size={14} weight="bold" />
                  <span>{t.uploadReceipt}</span>
                </button>

                {/* Add Expense */}
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold shadow-sm transition-all hover:bg-emerald-50 active:scale-95"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#065f46',
                  }}
                >
                  <Plus size={14} weight="bold" />
                  <span>{t.addExpense}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Substantial 4-Card Metric Row */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 lg:gap-4">
            {/* Card 1: Total Confirmed Expenses */}
            <Link
              href="/expenses"
              className="surface-card p-4.5 lg:p-5 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md block group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-600 text-white shadow-xs">
                  <CalendarBlank size={22} weight="bold" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--accent)' }}>
                  <span>View All</span>
                  <ArrowUpRight size={12} weight="bold" />
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl lg:text-3xl font-extrabold tabular-nums tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                  {formatMoney(budget.totalSpent, locale)}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{t.totalSpent}</span>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--destructive-subtle)', color: 'var(--destructive)' }}
                  >
                    <TrendDown size={11} weight="bold" />
                    <span>{locale === 'bn' ? toBengaliNumber(budget.spendingPercentage) : budget.spendingPercentage}%</span>
                  </span>
                </div>
              </div>
            </Link>

            {/* Card 2: Monthly Budget Target */}
            <div
              onClick={() => setIsBudgetOpen(true)}
              className="surface-card p-4.5 lg:p-5 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-teal-600 text-white shadow-xs">
                  <Wallet size={22} weight="bold" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--success-text)' }}>
                  <span>Adjust</span>
                  <ArrowUpRight size={12} weight="bold" />
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl lg:text-3xl font-extrabold tabular-nums tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                  {formatMoney(budget.startingBalance, locale)}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{t.startingBalance}</span>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success-text)' }}
                  >
                    <TrendUp size={11} weight="bold" />
                    <span>Target</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Remaining Balance Pool */}
            <div className="surface-card p-4.5 lg:p-5 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-sky-600 text-white shadow-xs">
                  <Clock size={22} weight="bold" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-surface-sunken)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(0, 100 - budget.spendingPercentage)}%`,
                        backgroundColor: budget.remainingBalance < 0 ? 'var(--destructive)' : 'var(--success)',
                      }}
                    />
                  </div>
                  <span className="text-xs font-extrabold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'bn' ? toBengaliNumber(Math.max(0, 100 - budget.spendingPercentage)) : Math.max(0, 100 - budget.spendingPercentage)}%
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p
                  className="text-2xl lg:text-3xl font-extrabold tabular-nums tracking-tight"
                  style={{
                    color: budget.remainingBalance < 0 ? 'var(--destructive)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-geist-mono), monospace',
                  }}
                >
                  {formatMoney(budget.remainingBalance, locale)}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{t.remainingBalance}</span>
                  <span
                    className="text-xs font-extrabold"
                    style={{ color: budget.remainingBalance < 0 ? 'var(--destructive)' : 'var(--success)' }}
                  >
                    {budget.remainingBalance < 0 ? 'Exceeded' : 'Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Total Transactions with Range Filter */}
            <div className="surface-card p-4.5 lg:p-5 flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-amber-600 text-white shadow-xs">
                  <Receipt size={22} weight="bold" />
                </div>

                {/* Filter Dropdown */}
                <select
                  value={transactionDays}
                  onChange={(e) => setTransactionDays(e.target.value as any)}
                  className="text-xs font-extrabold px-2.5 py-1 rounded-lg outline-none cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-surface-sunken)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="7">Last 7d</option>
                  <option value="15">Last 15d</option>
                  <option value="30">Last 30d</option>
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-2xl lg:text-3xl font-extrabold tabular-nums tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                  {locale === 'bn' ? toBengaliNumber(transactionCount) : transactionCount}
                  <span className="text-xs font-bold ml-1.5 font-sans" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'bn' ? 'টি' : 'Records'}
                  </span>
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Recorded</span>
                  <span className="text-xs font-extrabold" style={{ color: 'var(--accent)' }}>
                    {transactionDays === '7' ? '7 Days' : transactionDays === '15' ? '15 Days' : '30 Days'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Two-Column Analytics Row (Category Breakdown & Spending Amount) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {/* Card 1: Category Breakdown (50% width) */}
            <div className="surface-card p-5 lg:p-6 flex flex-col justify-between min-h-[360px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Category Breakdown
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)' }}>
                    This Month
                  </span>
                </div>

                {/* Side-by-side Legend (Left) - Pie Chart (Center) - Legend (Right) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 my-2 min-h-[220px]">
                  {/* Left Side: First Half of Categories (snug against pie chart) */}
                  <div className="flex flex-col gap-3 justify-center items-start sm:items-end flex-1 max-w-[270px]">
                    {topCategories.slice(0, Math.ceil(topCategories.length / 2)).map((cat: any, idx: number) => {
                      const color = PALETTE_COLORS[idx % PALETTE_COLORS.length];
                      const name = locale === 'bn' ? (cat.categoryNameBn || cat.categoryName) : cat.categoryName;
                      return (
                        <div key={idx} className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <CategoryIcon
                              name={cat.categoryName}
                              color={color}
                              size={16}
                            />
                          </div>
                          <span className="font-extrabold text-[16px] tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                            {name} - <span className="tabular-nums font-extrabold text-[16px]" style={{ color: color }}>{cat.percentage}%</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Center: Pie Chart Canvas with Inside Percentage Labels */}
                  <div className="h-52 w-52 shrink-0 relative flex items-center justify-center">
                    {topCategories.length === 0 ? (
                      <div className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>No category data</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={topCategories}
                            cx="50%"
                            cy="50%"
                            outerRadius={84}
                            dataKey="totalSpent"
                            labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                              if (percent < 0.06) return null;
                              const radius = (outerRadius || 84) * 0.62;
                              const radian = Math.PI / 180;
                              const x = cx + radius * Math.cos(-midAngle * radian);
                              const y = cy + radius * Math.sin(-midAngle * radian);
                              return (
                                <text
                                  x={x}
                                  y={y}
                                  fill="#ffffff"
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.7))',
                                  }}
                                >
                                  {`${(percent * 100).toFixed(0)}%`}
                                </text>
                              );
                            }}
                          >
                            {topCategories.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={PALETTE_COLORS[index % PALETTE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: chartTooltipBg,
                              borderColor: chartTooltipBorder,
                              borderRadius: '14px',
                              fontSize: '13px',
                              fontWeight: '600',
                              color: chartTooltipText,
                              boxShadow: 'var(--shadow-md)',
                            }}
                            formatter={(val: any) => [formatMoney(val, locale), 'Spent']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Right Side: Second Half of Categories (snug against pie chart) */}
                  <div className="flex flex-col gap-3 justify-center items-start flex-1 max-w-[270px]">
                    {topCategories.slice(Math.ceil(topCategories.length / 2)).map((cat: any, idx: number) => {
                      const globalIdx = Math.ceil(topCategories.length / 2) + idx;
                      const color = PALETTE_COLORS[globalIdx % PALETTE_COLORS.length];
                      const name = locale === 'bn' ? (cat.categoryNameBn || cat.categoryName) : cat.categoryName;
                      return (
                        <div key={globalIdx} className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <CategoryIcon
                              name={cat.categoryName}
                              color={color}
                              size={16}
                            />
                          </div>
                          <span className="font-extrabold text-[16px] tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                            {name} - <span className="tabular-nums font-extrabold text-[16px]" style={{ color: color }}>{cat.percentage}%</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Spending Amount Trends (50% width) */}
            <div className="surface-card p-5 lg:p-6 flex flex-col justify-between min-h-[360px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Spending Amount
                  </h3>

                  {/* Range Dropdown Selector */}
                  <select
                    value={trajectoryFilter}
                    onChange={(e) => setTrajectoryFilter(e.target.value as any)}
                    className="text-xs font-extrabold px-3 py-1.5 rounded-xl outline-none cursor-pointer transition-colors shadow-2xs"
                    style={{
                      backgroundColor: 'var(--accent-subtle)',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent-text)',
                    }}
                  >
                    <option value="week">Past week</option>
                    <option value="3m">3 months</option>
                    <option value="6m">6 months</option>
                    <option value="year">Year</option>
                  </select>
                </div>

                {/* Bar Chart Canvas */}
                <div className="h-60 w-full my-2">
                  {getFilteredTrendsData().length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                      No trend records
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getFilteredTrendsData()}
                        barSize={32}
                        margin={{ top: 22, right: 10, left: -10, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="period"
                          stroke={chartAxisColor}
                          fontSize={11}
                          fontWeight={600}
                          tickLine={false}
                          axisLine={{ stroke: chartAxisColor, opacity: 0.3 }}
                          tickFormatter={formatMonthLabel}
                        />
                        <YAxis
                          stroke={chartAxisColor}
                          fontSize={11}
                          fontWeight={600}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `৳${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: chartTooltipBg,
                            borderColor: chartTooltipBorder,
                            borderRadius: '14px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: chartTooltipText,
                            boxShadow: 'var(--shadow-md)',
                          }}
                          labelFormatter={formatFullPeriodLabel}
                          cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                          formatter={(val: any) => [formatMoney(val, locale), 'Spent']}
                        />
                        <Bar
                          dataKey="total"
                          fill={theme === 'dark' ? '#10b981' : '#059669'}
                          radius={[6, 6, 0, 0]}
                        >
                          <LabelList
                            dataKey="total"
                            position="top"
                            formatter={(val: any) =>
                              val > 0
                                ? locale === 'bn'
                                  ? `৳${toBengaliNumber(val)}`
                                  : `৳${val}`
                                : ''
                            }
                            style={{
                              fill: theme === 'dark' ? '#ffffff' : '#090d16',
                              fontSize: '11px',
                              fontWeight: '800',
                              fontFamily: 'var(--font-geist-mono), monospace',
                            }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Full-Width Row 3: Recent Expenses Spanning Left to Right */}
          <div className="surface-card p-5 lg:p-6 border shadow-sm space-y-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Recent Expenses
                </h3>
                <span
                  className="text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs"
                  style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  {recentExpenses.length} Records
                </span>
              </div>

              <Link
                href="/expenses"
                className="text-xs font-bold inline-flex items-center gap-1 transition-colors hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                <span>{t.viewAll}</span>
                <CaretRight size={13} weight="bold" />
              </Link>
            </div>

            {/* Horizontal Left-to-Right Seamless Columns of Recent Expenses */}
            {recentExpenses.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                No expenses recorded yet
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-1">
                {recentExpenses.slice(0, 5).map((exp: any, idx: number) => {
                  const catName = exp.categoryName || exp.category?.name || 'General';
                  const catNameBn = exp.categoryNameBn || exp.category?.nameBn;
                  const catIcon = exp.categoryIcon || exp.category?.icon;
                  const catColor = exp.categoryColor || exp.category?.color || PALETTE_COLORS[idx % PALETTE_COLORS.length];

                  return (
                    <div
                      key={exp.id}
                      className="flex flex-col justify-between py-1 lg:pr-3 lg:border-r last:border-r-0"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                            style={{
                              backgroundColor: `${catColor}20`,
                              color: catColor,
                            }}
                          >
                            <CategoryIcon name={catName} icon={catIcon} color={catColor} size={17} />
                          </div>
                          <span className="text-xs font-extrabold truncate" style={{ color: 'var(--text-secondary)' }}>
                            {exp.merchant || (locale === 'bn' ? (catNameBn || catName) : catName)}
                          </span>
                        </div>
                        <span className="text-[10px] font-extrabold shrink-0 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                          {formatRelativeDate(exp.expenseDate)}
                        </span>
                      </div>

                      <div className="space-y-1 pl-1">
                        <p className="font-extrabold text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                          {exp.description}
                        </p>
                        <p className="font-extrabold text-base tabular-nums" style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                          {formatMoney(exp.amount, locale)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <VoiceModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} onSuccess={fetchDashboardData} categories={categories} paymentMethods={paymentMethods} />
      <ReceiptModal isOpen={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} onSuccess={fetchDashboardData} categories={categories} paymentMethods={paymentMethods} />
      <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchDashboardData} categories={categories} paymentMethods={paymentMethods} />
      <BudgetModal isOpen={isBudgetOpen} onClose={() => setIsBudgetOpen(false)} onSuccess={fetchDashboardData} currentBudget={budget.startingBalance} />
    </div>
  );
}
