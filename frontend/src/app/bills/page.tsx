'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lightning,
  Plus,
  CheckCircle,
  Clock,
  Trash,
  MagnifyingGlass,
  Check,
  CalendarBlank,
  CreditCard,
  Building,
  HouseLine,
  WifiHigh,
  Flame,
  Drop,
  Phone,
  TrashSimple,
  Receipt,
  Sparkle,
  CaretLeft,
  CaretRight,
  FileText,
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { translations, formatMoney, toBengaliNumber } from '@/lib/i18n';
import { Sidebar } from '@/components/Sidebar';
import { HeaderControls } from '@/components/HeaderControls';
import { toast } from 'sonner';

export default function BillsPage() {
  const router = useRouter();
  const { user, isHydrated, locale } = useAppStore();
  const t = translations[locale];

  const [bills, setBills] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalBillsAmount: 0,
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

  // Add Bill Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    receiverName: '',
    category: 'Electricity',
    amount: '',
    billingMonth: new Date().toISOString().slice(0, 7),
    dueDate: '',
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
    fetchBills();
  }, [user, isHydrated, selectedMonth, activeTab]);

  const fetchBills = async () => {
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
      const res: any = await api.get('/bills', { params });
      setBills(res.data?.items || []);
      setSummary(res.data?.summary || {});
    } catch (err: any) {
      toast.error('Failed to load utility bills');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBills();
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.receiverName || !formData.amount) {
      toast.error(locale === 'bn' ? 'অনুগ্রহ করে প্রাপকের নাম ও টাকার পরিমাণ দিন' : 'Please enter receiver name and amount');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/bills', {
        receiverName: formData.receiverName,
        category: formData.category,
        amount: parseFloat(formData.amount),
        billingMonth: formData.billingMonth,
        dueDate: formData.dueDate || undefined,
        notes: formData.notes || undefined,
      });

      toast.success(locale === 'bn' ? 'ইউটিলিটি বিল যোগ করা হয়েছে' : 'Utility bill added successfully');
      setIsAddOpen(false);
      setFormData({
        receiverName: '',
        category: 'Electricity',
        amount: '',
        billingMonth: selectedMonth,
        dueDate: '',
        notes: '',
      });
      fetchBills();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add bill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePay = async (bill: any) => {
    try {
      const res: any = await api.patch(`/bills/${bill.id}/pay`, {});
      if (bill.status === 'unpaid') {
        toast.success(
          locale === 'bn'
            ? `বিল পরিশোধ সম্পন্ন! ৳${toBengaliNumber(bill.amount)} ব্যালেন্স থেকে কাটা হয়েছে`
            : `Bill paid! ৳${bill.amount} deducted from budget balance`
        );
      } else {
        toast.info(locale === 'bn' ? 'বিলটি বকেয়া হিসেবে চিহ্নিত করা হয়েছে' : 'Bill marked as unpaid');
      }
      fetchBills();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update bill payment status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'bn' ? 'আপনি কি এই বিলটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this bill?')) return;
    try {
      await api.delete(`/bills/${id}`);
      toast.success(locale === 'bn' ? 'বিল মুছে ফেলা হয়েছে' : 'Bill deleted');
      fetchBills();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete bill');
    }
  };

  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const getCategoryIcon = (categoryName: string) => {
    const cat = categoryName?.toLowerCase() || '';
    if (cat.includes('elect') || cat.includes('কারেন্ট') || cat.includes('বিদ্যুৎ')) return <Lightning size={16} weight="bold" className="text-amber-500" />;
    if (cat.includes('water') || cat.includes('পানি') || cat.includes('wasa')) return <Drop size={16} weight="bold" className="text-blue-500" />;
    if (cat.includes('gas') || cat.includes('গ্যাস') || cat.includes('titas')) return <Flame size={16} weight="bold" className="text-orange-500" />;
    if (cat.includes('inter') || cat.includes('wifi') || cat.includes('ইন্টারনেট')) return <WifiHigh size={16} weight="bold" className="text-indigo-500" />;
    if (cat.includes('phone') || cat.includes('mobile') || cat.includes('টেলিফোন')) return <Phone size={16} weight="bold" className="text-emerald-500" />;
    if (cat.includes('house') || cat.includes('rent') || cat.includes('ভাড়া')) return <HouseLine size={16} weight="bold" className="text-purple-500" />;
    if (cat.includes('waste') || cat.includes('ময়লা')) return <TrashSimple size={16} weight="bold" className="text-zinc-500" />;
    return <Building size={16} weight="bold" className="text-teal-500" />;
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
                  <Lightning size={22} weight="bold" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {t.utilityBills || 'Utility Bills'}
                </h1>
                <span
                  className="text-xs px-3 py-1 rounded-full font-extrabold tabular-nums shadow-2xs"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent-text)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {locale === 'bn' ? toBengaliNumber(summary.totalCount || 0) : summary.totalCount || 0} {locale === 'bn' ? 'টি বিল' : 'Bills'}
                </span>
              </div>
              <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
                {locale === 'bn'
                  ? 'মাসিক বিদ্যুৎ, পানি, গ্যাস, ইন্টারনেট বিল ট্র্যাক করুন এবং এক ক্লিকে ব্যালেন্স সমন্বয় করুন'
                  : 'Track and manage electricity, water, internet, and utility bills with 1-click balance deduction'}
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
                <span>{t.addBill || 'Add Bill'}</span>
              </button>
              <HeaderControls />
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Bills */}
            <div
              className="p-5 rounded-2xl border shadow-xs transition-all flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {t.totalBills || 'Total Bills'} ({selectedMonth})
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Lightning size={18} weight="bold" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {formatMoney(summary.totalBillsAmount || 0, locale)}
                </div>
                <div className="text-[11px] font-bold mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {locale === 'bn' ? toBengaliNumber(summary.totalCount || 0) : summary.totalCount || 0} {locale === 'bn' ? 'টি বিল মোট' : 'total items'}
                </div>
              </div>
            </div>

            {/* Unpaid Bills */}
            <div
              className="p-5 rounded-2xl border shadow-xs transition-all flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: summary.unpaidAmount > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500">
                  {t.unpaidBills || 'Unpaid / Due'}
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
                  {locale === 'bn' ? toBengaliNumber(summary.unpaidCount || 0) : summary.unpaidCount || 0} {locale === 'bn' ? 'টি বিল বকেয়া রয়েছে' : 'bills pending'}
                </div>
              </div>
            </div>

            {/* Paid Bills */}
            <div
              className="p-5 rounded-2xl border shadow-xs transition-all flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                  {t.paidBills || 'Paid & Deducted'}
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
                  {locale === 'bn' ? toBengaliNumber(summary.paidCount || 0) : summary.paidCount || 0} {locale === 'bn' ? 'টি পরিশোধিত' : 'bills cleared'}
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
                  { key: 'all', label: locale === 'bn' ? 'সকল বিল' : 'All Bills', count: summary.totalCount },
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
                  placeholder={locale === 'bn' ? 'বিল বা প্রাপকের নাম খুঁজুন...' : 'Search receiver, notes...'}
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
                    <th className="py-3 px-4 font-extrabold">{t.receiverName || 'Receiver / Provider'}</th>
                    <th className="py-3 px-4 font-extrabold">{t.category}</th>
                    <th className="py-3 px-4 font-extrabold">{t.amount}</th>
                    <th className="py-3 px-4 font-extrabold">{t.dueDate || 'Due Date'}</th>
                    <th className="py-3 px-4 font-extrabold">{t.status}</th>
                    <th className="py-3 px-4 font-extrabold text-right">{t.action || 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : bills.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Lightning size={32} weight="duotone" className="opacity-40" />
                          <p className="font-bold text-xs">
                            {locale === 'bn' ? 'এই মাসে কোনো বিলের রেকর্ড পাওয়া যায়নি' : 'No bills found for this month'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    bills.slice((page - 1) * pageSize, page * pageSize).map((bill) => {
                      const isPaid = bill.status === 'paid';
                      return (
                        <tr
                          key={bill.id}
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
                          {/* Receiver Name & Notes */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: 'var(--bg-surface-sunken)' }}
                              >
                                {getCategoryIcon(bill.category)}
                              </div>
                              <div>
                                <p className="font-extrabold text-[13px]" style={{ color: 'var(--text-primary)' }}>
                                  {bill.receiverName}
                                </p>
                                {bill.notes && (
                                  <p className="text-[11px] font-semibold mt-0.5 truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
                                    {bill.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4 font-bold" style={{ color: 'var(--text-secondary)' }}>
                            {bill.category}
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-black text-[13px]" style={{ color: 'var(--text-primary)' }}>
                            {formatMoney(bill.amount, locale)}
                          </td>

                          {/* Due Date */}
                          <td className="py-3.5 px-4 font-bold" style={{ color: 'var(--text-muted)' }}>
                            {bill.dueDate ? (
                              <span className="flex items-center gap-1.5">
                                <CalendarBlank size={13} weight="bold" />
                                {locale === 'bn' ? toBengaliNumber(bill.dueDate) : bill.dueDate}
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
                                onClick={() => handleTogglePay(bill)}
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
                                      : 'Pay Bill (Deducts from Balance)'
                                }
                              >
                                {isPaid ? (
                                  <span>{locale === 'bn' ? 'পুনরায় বকেয়া' : 'Mark Unpaid'}</span>
                                ) : (
                                  <>
                                    <Check size={13} weight="bold" />
                                    <span>{t.markPaid || 'Pay Bill'}</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleDelete(bill.id)}
                                className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Delete Bill"
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
            {bills.length > pageSize && (
              <div
                className="p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
                style={{ backgroundColor: 'var(--bg-surface-sunken)', borderColor: 'var(--border-subtle)' }}
              >
                <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  {locale === 'bn'
                    ? `মোট ${toBengaliNumber(bills.length)} টির মধ্যে ${toBengaliNumber(Math.min((page - 1) * pageSize + 1, bills.length))} থেকে ${toBengaliNumber(Math.min(page * pageSize, bills.length))} দেখানো হচ্ছে`
                    : `Showing ${Math.min((page - 1) * pageSize + 1, bills.length)} to ${Math.min(page * pageSize, bills.length)} of ${bills.length} bills`}
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

                  {Array.from({ length: Math.ceil(bills.length / pageSize) }, (_, i) => i + 1).map((p) => (
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
                    onClick={() => setPage((p) => Math.min(Math.ceil(bills.length / pageSize), p + 1))}
                    disabled={page >= Math.ceil(bills.length / pageSize)}
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

      {/* Add Bill Modal */}
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
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Lightning size={18} weight="bold" />
                </div>
                <h3 className="font-extrabold text-base">{t.addBill || 'Add Utility Bill'}</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {t.receiverName || 'Receiver / Company Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DESCO, DPDC, WASA, Titas, Dot Internet"
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
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
                    <option value="Electricity">Electricity (বিদ্যুৎ)</option>
                    <option value="Water">Water (পানি / WASA)</option>
                    <option value="Gas">Gas (গ্যাস)</option>
                    <option value="Internet">Internet (ব্রডব্যান্ড)</option>
                    <option value="Telephone">Telephone / Mobile</option>
                    <option value="House Rent">House Rent (বাসা ভাড়া)</option>
                    <option value="Service Charge">Service Charge</option>
                    <option value="Waste Management">Waste Management</option>
                    <option value="Other">Other Utility</option>
                  </select>
                </div>

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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {t.billingMonth || 'Billing Month'}
                  </label>
                  <input
                    type="month"
                    value={formData.billingMonth}
                    onChange={(e) => setFormData({ ...formData, billingMonth: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-bold border outline-none shadow-2xs cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-surface-sunken)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {t.dueDate || 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                  placeholder="e.g. Meter #, Customer ID, Notes..."
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
                  {submitting ? '...' : t.save || 'Save Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
