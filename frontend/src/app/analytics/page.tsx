'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChartBar,
  TrendUp,
  ChartPie,
  CreditCard,
  CalendarBlank,
  Plus,
} from '@phosphor-icons/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { translations, formatMoney, toBengaliNumber } from '@/lib/i18n';
import { Sidebar } from '@/components/Sidebar';
import { HeaderControls } from '@/components/HeaderControls';
import { VoiceModal } from '@/components/VoiceModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { PaymentMethodLogo } from '@/components/PaymentMethodLogo';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isHydrated, locale, theme } = useAppStore();
  const t = translations[locale];

  const [period, setPeriod] = useState<'daily' | 'monthly'>('monthly');
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchAnalytics();
  }, [user, isHydrated, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [trendRes, catRes, pmRes, categoriesRes, pmsRes]: any = await Promise.all([
        api.get(`/analytics/trends?period=${period}`),
        api.get('/analytics/breakdown?groupBy=category'),
        api.get('/analytics/breakdown?groupBy=payment_method'),
        api.get('/categories'),
        api.get('/payment-methods'),
      ]);

      setTrendsData(trendRes.data || []);
      setCategoryBreakdown(catRes.data || []);
      setPaymentBreakdown(pmRes.data || []);
      setCategories(categoriesRes.data || []);
      setPaymentMethods(pmsRes.data || []);
    } catch (err) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const totalTracked = categoryBreakdown.reduce((sum, item) => sum + item.amount, 0);

  const chartAxisColor = theme === 'dark' ? '#71717a' : '#94a3b8';
  const chartTooltipBg = theme === 'dark' ? '#18181c' : '#ffffff';
  const chartTooltipBorder = theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
  const chartTooltipText = theme === 'dark' ? '#f8fafc' : '#0f172a';

  // Human-readable date formatting (e.g., '14 May 2026' or 'May 2026' instead of ISO strings)
  const formatDateLabel = (periodStr: string) => {
    if (!periodStr) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(periodStr)) {
      const d = new Date(periodStr);
      if (isNaN(d.getTime())) return periodStr;
      return d.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
    if (/^\d{4}-\d{2}$/.test(periodStr)) {
      const [year, m] = periodStr.split('-');
      const monthNum = parseInt(m, 10);
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthsBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
      const name = locale === 'bn' ? monthsBn[monthNum - 1] : monthsEn[monthNum - 1];
      const yr = locale === 'bn' ? toBengaliNumber(year) : year;
      return `${name} ${yr}`;
    }
    return periodStr;
  };

  const formatTooltipLabel = (periodStr: string) => {
    if (!periodStr) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(periodStr)) {
      const d = new Date(periodStr);
      if (isNaN(d.getTime())) return periodStr;
      return d.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    if (/^\d{4}-\d{2}$/.test(periodStr)) {
      const [year, m] = periodStr.split('-');
      const monthNum = parseInt(m, 10);
      const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthsBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
      const name = locale === 'bn' ? monthsBn[monthNum - 1] : monthsEn[monthNum - 1];
      const yr = locale === 'bn' ? toBengaliNumber(year) : year;
      return `${name} ${yr}`;
    }
    return periodStr;
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
      <Sidebar
        onOpenVoiceModal={() => setIsVoiceOpen(true)}
        onOpenReceiptModal={() => setIsReceiptOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-6 lg:p-8 space-y-6 max-w-[1520px] w-full mx-auto dashboard-scaled-text">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  <ChartBar size={20} weight="bold" />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {t.analytics}
                </h1>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Deep financial intelligence, category distributions, and spending trends
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              {/* Timeframe switch */}
              <div
                className="flex items-center gap-1.5 p-1.5 rounded-2xl text-xs font-extrabold border shadow-2xs transition-colors"
                style={{ backgroundColor: 'var(--bg-surface-sunken)', borderColor: 'var(--border-subtle)' }}
              >
                <button
                  onClick={() => setPeriod('daily')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    period === 'daily'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'hover:bg-white dark:hover:bg-zinc-800'
                  }`}
                  style={{
                    color: period === 'daily' ? '#ffffff' : 'var(--text-primary)',
                  }}
                >
                  {t.daily}
                </button>
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    period === 'monthly'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'hover:bg-white dark:hover:bg-zinc-800'
                  }`}
                  style={{
                    color: period === 'monthly' ? '#ffffff' : 'var(--text-primary)',
                  }}
                >
                  {t.monthly}
                </button>
              </div>

              <button
                onClick={() => setIsAddOpen(true)}
                className="btn-accent flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl"
              >
                <Plus size={14} weight="bold" />
                <span>{t.addExpense}</span>
              </button>

              <HeaderControls />
            </div>
          </div>

          {/* Top Summary Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="surface-card p-5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {t.totalSpendingTracked}
              </span>
              <p
                className="text-2xl lg:text-[26px] font-extrabold tracking-tight tabular-nums"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}
              >
                {formatMoney(totalTracked, locale)}
              </p>
              <p className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>
                {t.calculatedFromConfirmed}
              </p>
            </div>

            <div className="surface-card p-5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {t.activeCategories}
              </span>
              <p
                className="text-2xl lg:text-[26px] font-extrabold tracking-tight tabular-nums"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}
              >
                {locale === 'bn' ? toBengaliNumber(categoryBreakdown.length) : categoryBreakdown.length}
              </p>
              <p className="text-[11px] font-medium" style={{ color: 'var(--success-text)' }}>
                {locale === 'bn' ? 'শীর্ষ ক্যাটাগরি:' : 'Top category:'} {categoryBreakdown[0] ? (locale === 'bn' ? (categoryBreakdown[0]?.nameBn || categoryBreakdown[0]?.name) : categoryBreakdown[0]?.name) : (locale === 'bn' ? 'নেই' : 'None')}
              </p>
            </div>

            <div className="surface-card p-5 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                {t.paymentChannels}
              </span>
              <p
                className="text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}
              >
                {paymentBreakdown.length}
              </p>
              <p className="text-xs font-bold" style={{ color: 'var(--info)' }}>
                Primary method: {paymentBreakdown[0]?.name || 'None'}
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Trends Bar Chart (7 Cols) */}
            <div className="lg:col-span-7 surface-card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <TrendUp size={20} weight="bold" style={{ color: 'var(--accent)' }} />
                    <h3 className="text-base font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      {t.spendingTrends}
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)' }}>
                    {period === 'daily' ? (locale === 'bn' ? 'দৈনিক খরচ' : 'Daily Velocity') : (locale === 'bn' ? 'মাসিক খরচ' : 'Monthly Spending')}
                  </span>
                </div>

                <div className="h-64 w-full">
                  {trendsData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                      {locale === 'bn' ? 'কোনো ট্রেন্ড তথ্য পাওয়া যায়নি' : 'No trend data available'}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendsData} barSize={period === 'daily' ? 20 : 36}>
                        <XAxis
                          dataKey="period"
                          stroke={chartAxisColor}
                          fontSize={12}
                          fontWeight={600}
                          tickLine={false}
                          axisLine={{ stroke: chartAxisColor, opacity: 0.3 }}
                          tickFormatter={formatDateLabel}
                        />
                        <YAxis
                          stroke={chartAxisColor}
                          fontSize={12}
                          fontWeight={600}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => locale === 'bn' ? `${toBengaliNumber(v >= 1000 ? `${Math.round(v / 1000)}k` : v)} ৳` : `৳${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
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
                          labelFormatter={formatTooltipLabel}
                          cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                          formatter={(val: any) => [formatMoney(val, locale), locale === 'bn' ? 'খরচ' : 'Spent']}
                        />
                        <Bar
                          dataKey="total"
                          fill={theme === 'dark' ? '#10b981' : '#059669'}
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Category Distribution Breakdown (5 Cols) */}
            <div className="lg:col-span-5 surface-card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <ChartPie size={20} weight="bold" style={{ color: 'var(--success)' }} />
                    <h3 className="text-base font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      {t.categoryBreakdown}
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)' }}>
                    {locale === 'bn' ? 'শতকরা হার' : 'Share %'}
                  </span>
                </div>

                <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                  {categoryBreakdown.length === 0 ? (
                    <div className="text-center py-10 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                      {locale === 'bn' ? 'কোনো ক্যাটাগরি তথ্য নেই' : 'No category breakdown data'}
                    </div>
                  ) : (
                    categoryBreakdown.map((cat, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                          <span
                            className="tabular-nums"
                            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}
                          >
                            {formatMoney(cat.amount, locale)}{' '}
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              ({locale === 'bn' ? toBengaliNumber(Math.round(cat.percentage)) : Math.round(cat.percentage)}%)
                            </span>
                          </span>
                        </div>
                        <div
                          className="w-full h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'var(--bg-surface-sunken)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color || 'var(--accent)' }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Distribution: Minimal & Compact Grid */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <CreditCard size={17} weight="bold" style={{ color: 'var(--accent)' }} />
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'bn' ? 'পেমেন্ট মাধ্যমের শতকরা হার' : 'Payment Method Share'}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {locale === 'bn' ? toBengaliNumber(paymentBreakdown.length) : paymentBreakdown.length} {locale === 'bn' ? 'টি মাধ্যম সক্রিয়' : 'Active Channels'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {paymentBreakdown.map((pm, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl flex items-center justify-between gap-2.5 transition-all hover:bg-slate-100/60 dark:hover:bg-zinc-800/40"
                  style={{
                    backgroundColor: 'var(--bg-surface-sunken)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PaymentMethodLogo name={pm.name} size={30} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
                        {pm.name}
                      </p>
                      <p className="text-[10px] font-medium leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {locale === 'bn' ? `${toBengaliNumber(Math.round(pm.percentage))}% শেয়ার` : `${Math.round(pm.percentage)}% share`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className="text-xs font-extrabold tabular-nums"
                      style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono), monospace' }}
                    >
                      {formatMoney(pm.amount, locale)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSuccess={fetchAnalytics}
        categories={categories}
        paymentMethods={paymentMethods}
      />
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onSuccess={fetchAnalytics}
        categories={categories}
        paymentMethods={paymentMethods}
      />
      <AddExpenseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchAnalytics}
        categories={categories}
        paymentMethods={paymentMethods}
      />
    </div>
  );
}
