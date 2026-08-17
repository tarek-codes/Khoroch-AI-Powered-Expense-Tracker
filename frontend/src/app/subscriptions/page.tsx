'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkle,
  Plus,
  CheckCircle,
  Clock,
  Trash,
  MagnifyingGlass,
  Check,
  CalendarBlank,
  CreditCard,
  FilmStrip,
  MusicNotes,
  Cpu,
  Barbell,
  BookOpen,
  CloudCheck,
  ArrowsClockwise,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { translations, formatMoney, toBengaliNumber } from '@/lib/i18n';
import { Sidebar } from '@/components/Sidebar';
import { HeaderControls } from '@/components/HeaderControls';
import { toast } from 'sonner';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { user, isHydrated, locale } = useAppStore();
  const t = translations[locale];

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalSubsAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    paidCount: 0,
    unpaidCount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Add Subscription Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    category: 'Entertainment',
    amount: '',
    billingMonth: new Date().toISOString().slice(0, 7),
    billingCycle: 'monthly',
    renewalDate: '',
    notes: '',
  });

  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchSubscriptions();
  }, [user, isHydrated, selectedMonth, activeTab]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params: any = {
        month: selectedMonth,
      };
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      if (search) {
        params.search = search;
      }
      const res: any = await api.get('/subscriptions', { params });
      setSubscriptions(res.data?.items || []);
      setSummary(res.data?.summary || {});
    } catch (err: any) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubscriptions();
  };

  const handleCreateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceName || !formData.amount) {
      toast.error(locale === 'bn' ? 'অনুগ্রহ করে সার্ভিসের নাম ও টাকার পরিমাণ দিন' : 'Please enter service name and amount');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/subscriptions', {
        serviceName: formData.serviceName,
        category: formData.category,
        amount: parseFloat(formData.amount),
        billingMonth: formData.billingMonth,
        billingCycle: formData.billingCycle,
        renewalDate: formData.renewalDate || undefined,
        notes: formData.notes || undefined,
      });

      toast.success(locale === 'bn' ? 'সাবস্ক্রিপশন যোগ করা হয়েছে' : 'Subscription added successfully');
      setIsAddOpen(false);
      setFormData({
        serviceName: '',
        category: 'Entertainment',
        amount: '',
        billingMonth: selectedMonth,
        billingCycle: 'monthly',
        renewalDate: '',
        notes: '',
      });
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePay = async (sub: any) => {
    try {
      const res: any = await api.patch(`/subscriptions/${sub.id}/pay`, {});
      if (sub.status === 'unpaid') {
        toast.success(
          locale === 'bn'
            ? `সাবস্ক্রিপশন ফি পরিশোধিত! ৳${toBengaliNumber(sub.amount)} ব্যালেন্স থেকে কাটা হয়েছে`
            : `Subscription paid! ৳${sub.amount} deducted from budget balance`
        );
      } else {
        toast.info(locale === 'bn' ? 'সাবস্ক্রিপশনটি বকেয়া হিসেবে চিহ্নিত করা হয়েছে' : 'Subscription marked as unpaid');
      }
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update subscription status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'bn' ? 'আপনি কি এই সাবস্ক্রিপশনটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this subscription?')) return;
    try {
      await api.delete(`/subscriptions/${id}`);
      toast.success(locale === 'bn' ? 'সাবস্ক্রিপশন মুছে ফেলা হয়েছে' : 'Subscription deleted');
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete subscription');
    }
  };

  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const getServiceIcon = (serviceName: string, categoryName: string) => {
    const s = serviceName?.toLowerCase() || '';
    const c = categoryName?.toLowerCase() || '';
    if (s.includes('netflix') || s.includes('prime') || s.includes('disney') || s.includes('chorki') || s.includes('hoichoi') || c.includes('stream') || c.includes('movie')) {
      return <FilmStrip size={16} weight="bold" className="text-red-500" />;
    }
    if (s.includes('spotify') || s.includes('apple music') || s.includes('youtube') || c.includes('music')) {
      return <MusicNotes size={16} weight="bold" className="text-emerald-500" />;
    }
    if (s.includes('chatgpt') || s.includes('openai') || s.includes('claude') || s.includes('midjourney') || c.includes('ai') || c.includes('software')) {
      return <Cpu size={16} weight="bold" className="text-purple-500" />;
    }
    if (s.includes('gym') || s.includes('fitness') || c.includes('health')) {
      return <Barbell size={16} weight="bold" className="text-orange-500" />;
    }
    if (s.includes('github') || s.includes('aws') || s.includes('cloud') || s.includes('domain') || s.includes('hosting')) {
      return <CloudCheck size={16} weight="bold" className="text-blue-500" />;
    }
    if (c.includes('edu') || s.includes('coursera') || s.includes('udemy')) {
      return <BookOpen size={16} weight="bold" className="text-amber-500" />;
    }
    return <Sparkle size={16} weight="bold" className="text-teal-500" />;
  };

  return (
    <div
      className="min-h-screen flex transition-colors duration-150"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-6 lg:p-8 space-y-6 max-w-[1520px] w-full mx-auto dashboard-scaled-text">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  <Sparkle size={22} weight="bold" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {t.recurringSubscriptions || 'Subscriptions & Memberships'}
                </h1>
                <span
                  className="text-xs px-3 py-1 rounded-full font-extrabold tabular-nums shadow-2xs"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent-text)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {locale === 'bn' ? toBengaliNumber(summary.totalCount || 0) : summary.totalCount || 0} {locale === 'bn' ? 'টি সাবস্ক্রিপশন' : 'Active'}
                </span>
              </div>
              <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
                {locale === 'bn'
                  ? 'Netflix, Spotify, ChatGPT, Gym ও ক্লাউড সাবস্ক্রিপশন ট্র্যাক করুন এবং ১-ক্লিকে পেইড করে ব্যালেন্স সমন্বয় করুন'
                  : 'Track and manage recurring digital subscriptions with renewal dates and 1-click balance deduction'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Month selector */}
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none shadow-2xs cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />

              <button
                onClick={() => setIsAddOpen(true)}
                className="btn-accent flex items-center gap-2 text-xs font-extrabold px-4.5 py-2.5 rounded-xl shadow-xs cursor-pointer"
              >
                <Plus size={15} weight="bold" />
                <span>{t.addSubscription || 'Add Subscription'}</span>
              </button>
              <HeaderControls />
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Subscriptions Cost */}
            <div
              className="p-5 rounded-2xl border shadow-xs transition-all flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {t.totalSubscriptions || 'Total Subscriptions'} ({selectedMonth})
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Sparkle size={18} weight="bold" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {formatMoney(summary.totalSubsAmount || 0, locale)}
                </div>
                <div className="text-[11px] font-bold mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {locale === 'bn' ? toBengaliNumber(summary.totalCount || 0) : summary.totalCount || 0} {locale === 'bn' ? 'টি সাবস্ক্রিপশন মোট' : 'total items'}
                </div>
              </div>
            </div>

            {/* Unpaid / Upcoming */}
            <div
              className="p-5 rounded-2xl border shadow-xs transition-all flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: summary.unpaidAmount > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500">
                  {t.unpaidSubscriptions || 'Unpaid / Due This Month'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Clock size={18} weight="bold" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tracking-tight text-rose-500">
                  {formatMoney(summary.unpaidAmount || 0, locale)}
                </div>
                <div className="text-[11px] font-bold mt-1 text-rose-400">
                  {locale === 'bn' ? toBengaliNumber(summary.unpaidCount || 0) : summary.unpaidCount || 0} {locale === 'bn' ? 'টি সাবস্ক্রিপশন বকেয়া রয়েছে' : 'pending payment'}
                </div>
              </div>
            </div>

            {/* Paid & Deducted */}
            <div
              className="p-5 rounded-2xl border shadow-xs transition-all flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                  {t.paidSubscriptions || 'Paid & Deducted'}
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle size={18} weight="bold" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tracking-tight text-emerald-500">
                  {formatMoney(summary.paidAmount || 0, locale)}
                </div>
                <div className="text-[11px] font-bold mt-1 text-emerald-600">
                  {locale === 'bn' ? toBengaliNumber(summary.paidCount || 0) : summary.paidCount || 0} {locale === 'bn' ? 'টি পরিশোধিত' : 'renewed & paid'}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Toolbar & Table Card */}
          <div
            className="rounded-2xl border overflow-hidden shadow-xs"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {/* Toolbar Header */}
            <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
              {/* Tab Filters */}
              <div
                className="flex items-center gap-1 p-1 rounded-2xl transition-colors shadow-2xs"
                style={{
                  backgroundColor: 'var(--bg-surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {[
                  { key: 'all', label: locale === 'bn' ? 'সকল সাবস্ক্রিপশন' : 'All Subscriptions', count: summary.totalCount },
                  { key: 'unpaid', label: locale === 'bn' ? 'বকেয়া' : 'Unpaid', count: summary.unpaidCount },
                  { key: 'paid', label: locale === 'bn' ? 'পরিশোধিত' : 'Paid', count: summary.paidCount },
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'hover:bg-slate-200/50 dark:hover:bg-zinc-700/40'
                      }`}
                      style={{
                        color: isActive ? '#ffffff' : 'var(--text-primary)',
                      }}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {locale === 'bn' ? toBengaliNumber(tab.count || 0) : tab.count || 0}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
                <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={locale === 'bn' ? 'সার্ভিস বা নোট খুঁজুন...' : 'Search Netflix, Spotify, cloud...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl text-xs font-bold outline-none border transition-all"
                  style={{
                    backgroundColor: 'var(--bg-surface-sunken)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </form>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-surface-sunken)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <th className="py-3 px-4 font-extrabold">{t.serviceName || 'Service / App'}</th>
                    <th className="py-3 px-4 font-extrabold">{t.category}</th>
                    <th className="py-3 px-4 font-extrabold">{t.billingCycle || 'Billing Cycle'}</th>
                    <th className="py-3 px-4 font-extrabold">{t.amount}</th>
                    <th className="py-3 px-4 font-extrabold">{locale === 'bn' ? 'রিনিউয়াল তারিখ' : 'Renewal Date'}</th>
                    <th className="py-3 px-4 font-extrabold">{t.status}</th>
                    <th className="py-3 px-4 font-extrabold text-right">{t.action || 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Sparkle size={32} weight="duotone" className="opacity-40" />
                          <p className="font-bold text-xs">
                            {locale === 'bn' ? 'এই মাসে কোনো সাবস্ক্রিপশন পাওয়া যায়নি' : 'No subscriptions found for this month'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    subscriptions.slice((page - 1) * pageSize, page * pageSize).map((sub) => {
                      const isPaid = sub.status === 'paid';
                      return (
                        <tr
                          key={sub.id}
                          className="border-b transition-colors"
                          style={{
                            borderColor: 'var(--border-subtle)',
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {/* Service Name & Notes */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: 'var(--bg-surface-sunken)' }}
                              >
                                {getServiceIcon(sub.serviceName, sub.category)}
                              </div>
                              <div>
                                <p className="font-extrabold text-[13px]" style={{ color: 'var(--text-primary)' }}>
                                  {sub.serviceName}
                                </p>
                                {sub.notes && (
                                  <p className="text-[11px] font-semibold mt-0.5 truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
                                    {sub.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4 font-bold" style={{ color: 'var(--text-secondary)' }}>
                            {sub.category}
                          </td>

                          {/* Billing Cycle */}
                          <td className="py-3.5 px-4 font-bold uppercase text-[11px] tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
                              style={{ backgroundColor: 'var(--bg-surface-sunken)' }}
                            >
                              <ArrowsClockwise size={11} weight="bold" />
                              <span>{sub.billingCycle}</span>
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-black text-[13px]" style={{ color: 'var(--text-primary)' }}>
                            {formatMoney(sub.amount, locale)}
                          </td>

                          {/* Renewal Date */}
                          <td className="py-3.5 px-4 font-bold" style={{ color: 'var(--text-muted)' }}>
                            {sub.renewalDate ? (
                              <span className="flex items-center gap-1.5">
                                <CalendarBlank size={13} weight="bold" />
                                {locale === 'bn' ? toBengaliNumber(sub.renewalDate) : sub.renewalDate}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {isPaid ? (
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black"
                                style={{
                                  backgroundColor: 'var(--success-subtle)',
                                  color: 'var(--success-text)',
                                  border: '1px solid rgba(16, 185, 129, 0.25)',
                                }}
                              >
                                <CheckCircle size={12} weight="fill" />
                                <span>{t.paidStatus || 'Paid'}</span>
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black"
                                style={{
                                  backgroundColor: 'var(--destructive-subtle)',
                                  color: 'var(--destructive)',
                                  border: '1px solid rgba(239, 68, 68, 0.25)',
                                }}
                              >
                                <Clock size={12} weight="fill" />
                                <span>{t.unpaidStatus || 'Unpaid'}</span>
                              </span>
                            )}
                          </td>

                          {/* Action Buttons: 1-Click Pay & Delete */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleTogglePay(sub)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 ${
                                  isPaid
                                    ? 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-300 dark:hover:bg-zinc-700'
                                    : 'btn-accent'
                                }`}
                                title={
                                  isPaid
                                    ? locale === 'bn'
                                      ? 'বকেয়া হিসেবে চিহ্নিত করুন'
                                      : 'Mark as Unpaid'
                                    : locale === 'bn'
                                      ? 'পরিশোধ করুন ও ব্যালেন্স থেকে কাটুন'
                                      : 'Pay Subscription (Deducts from Balance)'
                                }
                              >
                                {isPaid ? (
                                  <span>{locale === 'bn' ? 'পুনরায় বকেয়া' : 'Mark Unpaid'}</span>
                                ) : (
                                  <>
                                    <Check size={13} weight="bold" />
                                    <span>{locale === 'bn' ? 'পরিশোধ করুন' : 'Pay Now'}</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleDelete(sub.id)}
                                className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Delete Subscription"
                              >
                                <Trash size={15} weight="bold" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {subscriptions.length > pageSize && (
              <div
                className="p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
                style={{ backgroundColor: 'var(--bg-surface-sunken)', borderColor: 'var(--border-subtle)' }}
              >
                <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  {locale === 'bn'
                    ? `মোট ${toBengaliNumber(subscriptions.length)} টির মধ্যে ${toBengaliNumber(Math.min((page - 1) * pageSize + 1, subscriptions.length))} থেকে ${toBengaliNumber(Math.min(page * pageSize, subscriptions.length))} দেখানো হচ্ছে`
                    : `Showing ${Math.min((page - 1) * pageSize + 1, subscriptions.length)} to ${Math.min(page * pageSize, subscriptions.length)} of ${subscriptions.length} subscriptions`}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl text-xs font-bold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    title="Previous page"
                  >
                    <CaretLeft size={16} weight="bold" />
                  </button>

                  {Array.from({ length: Math.ceil(subscriptions.length / pageSize) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        page === p
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'border hover:bg-white dark:hover:bg-zinc-800'
                      }`}
                      style={{
                        borderColor: page === p ? 'transparent' : 'var(--border-subtle)',
                        color: page === p ? '#ffffff' : 'var(--text-primary)',
                      }}
                    >
                      {locale === 'bn' ? toBengaliNumber(p) : p}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage((p) => Math.min(Math.ceil(subscriptions.length / pageSize), p + 1))}
                    disabled={page >= Math.ceil(subscriptions.length / pageSize)}
                    className="p-2 rounded-xl text-xs font-bold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    title="Next page"
                  >
                    <CaretRight size={16} weight="bold" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Subscription Modal */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 border shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Sparkle size={18} weight="bold" />
                </div>
                <h3 className="font-extrabold text-base">{t.addSubscription || 'Add Subscription'}</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSub} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {t.serviceName || 'Service / Platform Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Spotify, ChatGPT Plus, YouTube Premium"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none shadow-2xs"
                  style={{
                    backgroundColor: 'var(--bg-surface-sunken)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {t.category} *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-bold border outline-none shadow-2xs"
                    style={{
                      backgroundColor: 'var(--bg-surface-sunken)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="Streaming & Video">Streaming (Netflix, Chorki)</option>
                    <option value="Music & Audio">Music (Spotify, Apple)</option>
                    <option value="AI & Software">AI & Software (ChatGPT, Claude)</option>
                    <option value="Cloud & Hosting">Cloud & Hosting (Vercel, AWS)</option>
                    <option value="Gym & Fitness">Gym & Fitness</option>
                    <option value="Gaming & Apps">Gaming (PlayStation, Steam)</option>
                    <option value="Education">Education (Coursera, Udemy)</option>
                    <option value="Other">Other Subscription</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {t.billingCycle || 'Billing Cycle'}
                  </label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-bold border outline-none shadow-2xs"
                    style={{
                      backgroundColor: 'var(--bg-surface-sunken)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="monthly">Monthly (মাসিক)</option>
                    <option value="yearly">Yearly (বাৎসরিক)</option>
                    <option value="weekly">Weekly (সাপ্তাহিক)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {t.amount} (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none shadow-2xs"
                    style={{
                      backgroundColor: 'var(--bg-surface-sunken)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'bn' ? 'রিনিউয়াল তারিখ' : 'Renewal Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.renewalDate}
                    onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-bold border outline-none shadow-2xs cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-surface-sunken)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {t.notes}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4 screens shared, Auto-renewal on card..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border outline-none shadow-2xs"
                  style={{
                    backgroundColor: 'var(--bg-surface-sunken)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-accent px-5 py-2 rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5"
                >
                  {submitting ? '...' : t.save || 'Save Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
