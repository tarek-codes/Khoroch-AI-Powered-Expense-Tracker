'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import {
  ArrowsLeftRight,
  HandCoins,
  Plus,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  Trash,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarBlank,
  User,
  CurrencyDollar,
  Sparkle,
  Wallet,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { translations, formatMoney, toBengaliNumber } from '@/lib/i18n';
import { Sidebar } from '@/components/Sidebar';
import { HeaderControls } from '@/components/HeaderControls';
import { toast } from 'sonner';

export default function LoansPage() {
  const router = useRouter();
  const { user, isHydrated, locale } = useAppStore();
  const t = translations[locale];

  const [loans, setLoans] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalLentPending: 0,
    totalBorrowedPending: 0,
    totalLentSettled: 0,
    totalBorrowedSettled: 0,
    netPending: 0,
    totalRecords: 0,
    pendingCount: 0,
    settledCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<string>('all'); // all | lend | borrow | settled
  const [search, setSearch] = useState('');

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'lend', // 'lend' | 'borrow'
    personName: '',
    amount: '',
    transactionDate: new Date().toISOString().slice(0, 16),
    dueDate: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, isHydrated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, sumRes]: any = await Promise.all([
        api.get('/loans'),
        api.get('/loans/summary'),
      ]);
      setLoans(loansRes.data || []);
      setSummary(sumRes.data || {});
    } catch (err: any) {
      toast.error('Failed to load lend/borrow records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personName || !formData.amount) {
      toast.error('Please enter person name and amount');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        type: formData.type,
        personName: formData.personName,
        amount: parseFloat(formData.amount),
        transactionDate: formData.transactionDate ? new Date(formData.transactionDate).toISOString() : new Date().toISOString(),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        notes: formData.notes || undefined,
      };

      const res: any = await api.post('/loans', payload);
      toast.success(
        formData.type === 'lend'
          ? `Lent ৳${formData.amount} to ${formData.personName} (deducted from balance)`
          : `Borrowed ৳${formData.amount} from ${formData.personName} (added to balance)`
      );
      setIsAddOpen(false);
      setFormData({
        type: 'lend',
        personName: '',
        amount: '',
        transactionDate: new Date().toISOString().slice(0, 16),
        dueDate: '',
        notes: '',
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettle = async (id: string, currentStatus: string, type: string, person: string, amount: number) => {
    try {
      const res: any = await api.patch(`/loans/${id}/settle`, {});
      if (currentStatus === 'pending') {
        toast.success(
          type === 'lend'
            ? `Paid Back: ৳${amount} received from ${person} (added back to balance)`
            : `Settled: ৳${amount} repaid to ${person} (deducted from balance)`
        );
      } else {
        toast.info('Marked as pending');
      }
      fetchData();
    } catch (err: any) {
      toast.error('Failed to update settlement status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/loans/${id}`);
      toast.success('Record deleted');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete record');
    }
  };

  // Pagination & Filtered loan list
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setPage(1);
  }, [filterType, search]);

  const filteredLoans = loans.filter((loan) => {
    if (filterType === 'lend') {
      if (loan.type !== 'lend' || loan.status !== 'pending') return false;
    } else if (filterType === 'borrow') {
      if (loan.type !== 'borrow' || loan.status !== 'pending') return false;
    } else if (filterType === 'settled') {
      if (loan.status !== 'settled') return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchPerson = loan.personName?.toLowerCase().includes(q);
      const matchNotes = loan.notes?.toLowerCase().includes(q);
      const matchAmount = loan.amount?.toString().includes(q);
      return matchPerson || matchNotes || matchAmount;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLoans.length / pageSize));
  const paginatedLoans = filteredLoans.slice((page - 1) * pageSize, page * pageSize);
  const startEntry = filteredLoans.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endEntry = Math.min(page * pageSize, filteredLoans.length);

  const formatDateTime = (d: string) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
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
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-6 lg:p-8 space-y-6 max-w-[1520px] w-full mx-auto dashboard-scaled-text">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  <ArrowsLeftRight size={24} weight="bold" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'bn' ? 'ধার ও দেনা হিসাব' : 'Lend & Borrow Tracker'}
                  </h1>
                  <p className="text-xs mt-1 font-bold" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'bn'
                      ? 'টাকা ধার দেওয়া এবং নেওয়ার স্বয়ংক্রিয় ব্যালেন্স ও পরিশোধ ট্র্যাকিং'
                      : 'Automatic balance adjustments, borrower logs, and 1-click settlement'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <HeaderControls />
            </div>
          </div>

          {/* 4 Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Lent (Pending) */}
            <div
              className="p-5 rounded-2xl border shadow-xs transition-all flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: summary.totalLentPending > 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-500 font-black">
                  <ArrowUpRight size={20} weight="bold" />
                </div>
                <span
                  className="text-xs font-extrabold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--destructive-subtle)',
                    color: 'var(--destructive)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                  }}
                >
                  {locale === 'bn' ? toBengaliNumber(summary.pendingCount) : summary.pendingCount} {locale === 'bn' ? 'টি চলমান' : 'Pending'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl lg:text-3xl font-black tabular-nums text-rose-500" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                  {formatMoney(summary.totalLentPending, locale)}
                </p>
                <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  {locale === 'bn' ? 'মোট ধার দিয়েছি (পাবো)' : 'Total Lent (Pending)'}
                </p>
              </div>
            </div>

            {/* Card 2: Total Borrowed (Pending) */}
            <div
              className="p-5 rounded-2xl border shadow-xs transition-all flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: summary.totalBorrowedPending > 0 ? 'rgba(14, 165, 233, 0.4)' : 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-sky-500/10 text-sky-500 font-black">
                  <ArrowDownLeft size={20} weight="bold" />
                </div>
                <span
                  className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/25"
                >
                  {locale === 'bn' ? 'দিতে হবে' : 'To Repay'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl lg:text-3xl font-black tabular-nums text-sky-500" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                  {formatMoney(summary.totalBorrowedPending, locale)}
                </p>
                <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  {locale === 'bn' ? 'মোট ধার নিয়েছি (দিতে হবে)' : 'Total Borrowed (To Repay)'}
                </p>
              </div>
            </div>

            {/* Card 3: Net Pending Difference */}
            <div
              className="p-5 rounded-2xl border shadow-xs transition-all flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: summary.netPending >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                    summary.netPending >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}
                >
                  <Wallet size={20} weight="bold" />
                </div>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                    summary.netPending >= 0
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/25'
                  }`}
                >
                  {summary.netPending >= 0 ? (locale === 'bn' ? 'উদ্বৃত্ত (পাবো)' : 'Net Receivable') : (locale === 'bn' ? 'দেনা (দিতে হবে)' : 'Net Payable')}
                </span>
              </div>
              <div className="space-y-1">
                <p
                  className={`text-2xl lg:text-3xl font-black tabular-nums ${
                    summary.netPending >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                  style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                  }}
                >
                  {summary.netPending > 0 ? '+' : ''}{formatMoney(summary.netPending, locale)}
                </p>
                <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  {locale === 'bn' ? 'ধার ও দেনার মোট পার্থক্য' : 'Combined wallet adjustment'}
                </p>
              </div>
            </div>

            {/* Card 4: Total Settled / Paid Back */}
            <div
              className="p-5 rounded-2xl border shadow-xs transition-all flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-500/10 text-teal-500 font-black">
                  <CheckCircle size={20} weight="bold" />
                </div>
                <span
                  className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-500 border border-teal-500/25"
                >
                  {locale === 'bn' ? toBengaliNumber(summary.settledCount) : summary.settledCount} {locale === 'bn' ? 'টি পরিশোধিত' : 'Settled'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl lg:text-3xl font-black tabular-nums text-teal-500" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                  {formatMoney(summary.totalLentSettled + summary.totalBorrowedSettled, locale)}
                </p>
                <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  {locale === 'bn' ? 'পরিশোধিত মোট লেনদেন' : 'Total settled transaction volume'}
                </p>
              </div>
            </div>
          </div>

          {/* Unified Ledger & Filter Toolbar Card */}
          <div className="surface-card overflow-hidden shadow-sm border rounded-2xl" style={{ borderColor: 'var(--border-subtle)' }}>
            {/* Single Unified Header Row: Title on Left, Controls on Right */}
            <div className="p-5 lg:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              {/* Left Side: Title & Description + Filter Type Tabs */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 shrink-0">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                    <ArrowsLeftRight size={19} weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      {locale === 'bn' ? 'ধার ও দেনার হিসাব তালিকা' : 'Lend & Borrow Ledger'}
                    </h3>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {locale === 'bn' ? 'প্যাজিনেটেড হিসাব বিবরণী' : 'Showing 5 transactions per page'}
                    </p>
                  </div>
                </div>

                {/* Filter Type Tabs next to title */}
                <div
                  className="flex items-center gap-1 p-1 rounded-2xl transition-colors shadow-2xs self-start md:self-center"
                  style={{
                    backgroundColor: 'var(--bg-surface-sunken)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    onClick={() => setFilterType('all')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      filterType === 'all'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'hover:bg-white dark:hover:bg-zinc-800'
                    }`}
                    style={{
                      color: filterType === 'all' ? '#ffffff' : 'var(--text-primary)',
                    }}
                  >
                    <span>{locale === 'bn' ? 'সকল লেনদেন' : 'All'}</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
                        filterType === 'all'
                          ? 'bg-white/25 text-white'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {locale === 'bn' ? toBengaliNumber(loans.length) : loans.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setFilterType('lend')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      filterType === 'lend'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'hover:bg-white dark:hover:bg-zinc-800'
                    }`}
                    style={{
                      color: filterType === 'lend' ? '#ffffff' : 'var(--text-primary)',
                    }}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${filterType === 'lend' ? 'bg-white' : 'bg-rose-600'}`} />
                    <span>{locale === 'bn' ? 'ধার দিয়েছি' : 'Lent'}</span>
                  </button>

                  <button
                    onClick={() => setFilterType('borrow')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      filterType === 'borrow'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'hover:bg-white dark:hover:bg-zinc-800'
                    }`}
                    style={{
                      color: filterType === 'borrow' ? '#ffffff' : 'var(--text-primary)',
                    }}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${filterType === 'borrow' ? 'bg-white' : 'bg-sky-600'}`} />
                    <span>{locale === 'bn' ? 'ধার নিয়েছি' : 'Borrowed'}</span>
                  </button>

                  <button
                    onClick={() => setFilterType('settled')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      filterType === 'settled'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'hover:bg-white dark:hover:bg-zinc-800'
                    }`}
                    style={{
                      color: filterType === 'settled' ? '#ffffff' : 'var(--text-primary)',
                    }}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${filterType === 'settled' ? 'bg-white' : 'bg-teal-600'}`} />
                    <span>{locale === 'bn' ? 'পরিশোধিত' : 'Settled'}</span>
                  </button>
                </div>
              </div>

              {/* Right Side: Add Button + Search Box */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Add Button */}
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="btn-accent flex items-center gap-2 text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-xs whitespace-nowrap"
                >
                  <Plus size={14} weight="bold" />
                  <span>{locale === 'bn' ? 'নতুন ধার / দেনা যোগ' : 'Add Lend / Borrow'}</span>
                </button>

                {/* Search Box */}
                <div className="relative min-w-[200px]">
                  <MagnifyingGlass
                    size={15}
                    weight="bold"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--accent)' }}
                  />
                  <input
                    type="text"
                    placeholder={locale === 'bn' ? 'নাম বা নোট দিয়ে খুঁজুন...' : 'Search person or note...'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs font-bold outline-none transition-all shadow-2xs"
                    style={{
                      backgroundColor: 'var(--bg-surface-sunken)',
                      border: '1.5px solid var(--accent)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className="text-[11px] font-extrabold uppercase tracking-wider"
                    style={{
                      backgroundColor: 'var(--bg-surface-sunken)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <th className="py-3 px-6">{locale === 'bn' ? 'ব্যক্তির নাম' : 'Person Name'}</th>
                    <th className="py-3 px-6">{locale === 'bn' ? 'ধরন' : 'Type'}</th>
                    <th className="py-3 px-6">{locale === 'bn' ? 'তারিখ ও সময়' : 'Date & Time'}</th>
                    <th className="py-3 px-6">{locale === 'bn' ? 'টাকার পরিমাণ' : 'Amount'}</th>
                    <th className="py-3 px-6">{locale === 'bn' ? 'অবস্থা' : 'Status'}</th>
                    <th className="py-3 px-6 text-center">{locale === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                        Loading records...
                      </td>
                    </tr>
                  ) : filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center space-y-2">
                        <ArrowsLeftRight size={32} weight="duotone" className="mx-auto text-emerald-600 opacity-60" />
                        <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                          {locale === 'bn' ? 'কোনো ধার/দেনা পাওয়া যায়নি' : 'No records found'}
                        </p>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {locale === 'bn' ? 'নতুন লেনদেন যোগ করতে উপরের বাটনে ক্লিক করুন।' : 'Click "+ Add Lend / Borrow" to record a new transaction.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedLoans.map((loan) => (
                      <tr
                        key={loan.id}
                        className="transition-colors border-0"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {/* Person Name & Notes */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                                loan.type === 'lend'
                                  ? 'bg-rose-500/10 text-rose-500'
                                  : 'bg-sky-500/10 text-sky-500'
                              }`}
                            >
                              {loan.personName?.[0]?.toUpperCase() || 'P'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                {loan.personName}
                              </p>
                              {loan.notes && (
                                <p className="text-xs font-medium truncate max-w-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                  {loan.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="py-3.5 px-6">
                          {loan.type === 'lend' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              <ArrowUpRight size={13} weight="bold" />
                              <span>{locale === 'bn' ? 'ধার দিয়েছি' : 'Lent (Spending)'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-sky-500/10 text-sky-500 border border-sky-500/20">
                              <ArrowDownLeft size={13} weight="bold" />
                              <span>{locale === 'bn' ? 'ধার নিয়েছি' : 'Borrowed (Inflow)'}</span>
                            </span>
                          )}
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-6">
                          <div className="space-y-0.5">
                            <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                              {formatDateTime(loan.transactionDate)}
                            </p>
                            {loan.dueDate && (
                              <p className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                                <Clock size={12} weight="bold" />
                                <span>{locale === 'bn' ? 'পরিশোধ:' : 'Due:'} {new Date(loan.dueDate).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US')}</span>
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-6">
                          <span
                            className={`text-sm font-black tabular-nums ${
                              loan.type === 'lend' ? 'text-rose-500' : 'text-sky-500'
                            }`}
                            style={{
                              fontFamily: 'var(--font-geist-mono), monospace',
                            }}
                          >
                            {formatMoney(loan.amount, locale)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-6">
                          {loan.status === 'settled' ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black"
                              style={{
                                backgroundColor: 'var(--success-subtle)',
                                color: 'var(--success-text)',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                              }}
                            >
                              <CheckCircle size={13} weight="fill" />
                              <span>{locale === 'bn' ? 'পরিশোধিত' : 'Paid Back / Settled'}</span>
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black"
                              style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.25)',
                              }}
                            >
                              <Clock size={13} weight="bold" />
                              <span>{locale === 'bn' ? 'চলমান (বাকি)' : 'Pending'}</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Paid Back / Settle Button */}
                            <button
                              onClick={() => handleSettle(loan.id, loan.status, loan.type, loan.personName, loan.amount)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                                loan.status === 'pending'
                                  ? 'btn-accent'
                                  : 'btn-secondary text-xs'
                              }`}
                              title={loan.status === 'pending' ? 'Click to mark as paid back and restore balance' : 'Reopen as pending'}
                            >
                              <CheckCircle size={14} weight="bold" />
                              <span>
                                {loan.status === 'pending'
                                  ? locale === 'bn'
                                    ? 'টাকা ফেরত পেয়েছি / দিয়েছি'
                                    : 'Paid Back'
                                  : locale === 'bn'
                                  ? 'পুনরায় চালু'
                                  : 'Reopen'}
                              </span>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(loan.id)}
                              className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 transition-colors"
                              title="Delete record"
                            >
                              <Trash size={15} weight="bold" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                className="p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3"
                style={{ backgroundColor: 'var(--bg-surface-sunken)' }}
              >
                <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  {locale === 'bn'
                    ? `মোট ${toBengaliNumber(filteredLoans.length)} টির মধ্যে ${toBengaliNumber(startEntry)} থেকে ${toBengaliNumber(endEntry)} দেখানো হচ্ছে`
                    : `Showing ${startEntry} to ${endEntry} of ${filteredLoans.length} entries`}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl text-xs font-bold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-zinc-800"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    title="Previous page"
                  >
                    <CaretLeft size={16} weight="bold" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all ${
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
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl text-xs font-bold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-zinc-800"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    title="Next page"
                  >
                    <CaretRight size={16} weight="bold" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Lend / Borrow Modal */}
          <Dialog.Root open={isAddOpen} onOpenChange={setIsAddOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50" style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(4px)' }} />
              <Dialog.Content
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl focus:outline-none border"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  animation: 'contentSlideIn 0.2s ease',
                }}
              >
                <div className="flex items-center justify-between mb-5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0"
                      style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
                    >
                      <ArrowsLeftRight size={20} weight="bold" />
                    </div>
                    <div>
                      <Dialog.Title className="text-base font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        {locale === 'bn' ? 'নতুন ধার / দেনা এন্ট্রি' : 'Record Lend or Borrow'}
                      </Dialog.Title>
                      <Dialog.Description className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {locale === 'bn'
                          ? 'ধার দিলে ব্যালেন্স কমবে, নিলে বাড়বে। টাকা ফেরত পেলে "Paid Back" চাপবেন।'
                          : 'Lend deducts from balance; Borrow adds to balance automatically.'}
                      </Dialog.Description>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                      <X size={18} weight="bold" />
                    </button>
                  </Dialog.Close>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  {/* Type Selector Segmented Control */}
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Transaction Type
                    </label>
                    <div
                      className="flex p-1 rounded-xl gap-1.5 border"
                      style={{
                        backgroundColor: 'var(--bg-surface-sunken)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'lend' })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-extrabold transition-all ${
                          formData.type === 'lend'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'hover:bg-white dark:hover:bg-zinc-800'
                        }`}
                        style={{
                          color: formData.type === 'lend' ? '#ffffff' : 'var(--text-primary)',
                        }}
                      >
                        <ArrowUpRight size={15} weight="bold" />
                        <span>{locale === 'bn' ? 'ধার দিয়েছি (আমি পাবো)' : 'I Lent Money'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'borrow' })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-extrabold transition-all ${
                          formData.type === 'borrow'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'hover:bg-white dark:hover:bg-zinc-800'
                        }`}
                        style={{
                          color: formData.type === 'borrow' ? '#ffffff' : 'var(--text-primary)',
                        }}
                      >
                        <ArrowDownLeft size={15} weight="bold" />
                        <span>{locale === 'bn' ? 'ধার নিয়েছি (দিতে হবে)' : 'I Borrowed Money'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Person Name */}
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      {locale === 'bn' ? 'ব্যক্তির নাম' : 'Person Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={locale === 'bn' ? 'যেমন: রহিম, তানভীর, রুমমেট' : 'e.g. Rahim, Tanvir, Boss, Roommate'}
                      value={formData.personName}
                      onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                      className="input-base w-full text-xs font-bold"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      {locale === 'bn' ? 'টাকার পরিমাণ (৳)' : 'Amount (৳)'} *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder={locale === 'bn' ? 'যেমন: ৫০০০' : 'e.g. 5000'}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="input-base w-full text-sm font-bold"
                      style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
                    />
                  </div>

                  {/* Transaction Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                        {locale === 'bn' ? 'লেনদেনের তারিখ ও সময়' : 'Date & Time'}
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.transactionDate}
                        onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                        className="input-base w-full text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                        {locale === 'bn' ? 'পরিশোধের সম্ভাব্য তারিখ' : 'Due Date (Optional)'}
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="input-base w-full text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      {locale === 'bn' ? 'মন্তব্য বা নোট' : 'Notes (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder={locale === 'bn' ? 'যেমন: জরুরি প্রয়োজনে, আগামী সপ্তাহে ফেরত দেবে' : 'e.g. For emergency hospital bill, will pay next week'}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="input-base w-full text-xs font-bold"
                    />
                  </div>

                  {/* Submit / Cancel */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      className="btn-secondary text-xs px-4 py-2.5 rounded-xl font-bold"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-accent text-xs px-5 py-2.5 rounded-xl font-extrabold shadow-sm flex items-center gap-1.5"
                    >
                      <Plus size={15} weight="bold" />
                      <span>{submitting ? 'Saving...' : locale === 'bn' ? 'নিশ্চিত করুন' : 'Confirm & Record'}</span>
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </main>
      </div>
    </div>
  );
}
