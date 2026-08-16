'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Receipt,
  MagnifyingGlass,
  Trash,
  Microphone,
  UploadSimple,
  X,
  CaretLeft,
  CaretRight,
  Plus,
  ArrowClockwise,
  CreditCard,
  Eye,
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { translations, formatMoney, toBengaliNumber } from '@/lib/i18n';
import { Sidebar } from '@/components/Sidebar';
import { HeaderControls } from '@/components/HeaderControls';
import { VoiceModal } from '@/components/VoiceModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { CategoryIcon } from '@/components/CategoryIcon';
import { PaymentMethodLogo } from '@/components/PaymentMethodLogo';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { toast } from 'sonner';

export default function ExpensesPage() {
  const router = useRouter();
  const { user, locale } = useAppStore();
  const t = translations[locale];

  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Per page 7 records
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedSource, setSelectedSource] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [viewingExpense, setViewingExpense] = useState<any | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchFilters();
  }, [user]);

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user, page, selectedCategory, selectedPaymentMethod, selectedSource]);

  const fetchFilters = async () => {
    try {
      const [catRes, pmRes]: any = await Promise.all([
        api.get('/categories'),
        api.get('/payment-methods'),
      ]);
      setCategories(catRes.data || []);
      setPaymentMethods(pmRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '5'); // 5 records per page
      if (search) params.append('search', search);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedPaymentMethod) params.append('paymentMethodId', selectedPaymentMethod);
      if (selectedSource) params.append('source', selectedSource);

      const res: any = await api.get(`/expenses?${params.toString()}`);
      setExpenses(res.data.items || []);
      setTotalPages(res.data.meta?.totalPages || 1);
      setTotalItems(res.data.meta?.totalItems || 0);
    } catch (err: any) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchExpenses();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedPaymentMethod('');
    setSelectedSource('');
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense? This will restore your budget balance.')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense removed and balance restored');
      fetchExpenses();
      if (viewingExpense?.id === id) setViewingExpense(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete expense');
    }
  };

  if (!user) return null;

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
        <main className="p-6 lg:p-8 space-y-6 max-w-[1520px] w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  <Receipt size={22} weight="bold" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {t.expenses}
                </h1>
                <span
                  className="text-xs px-3 py-1 rounded-full font-extrabold tabular-nums shadow-2xs"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent)',
                  }}
                >
                  {locale === 'bn' ? toBengaliNumber(totalItems) : totalItems} {locale === 'bn' ? 'টি রেকর্ড' : 'Records'}
                </span>
              </div>
              <p className="text-xs mt-1.5 font-bold" style={{ color: 'var(--text-secondary)' }}>
                Full tabular transaction history, multi-filter auditing, and itemized receipts
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddOpen(true)}
                className="btn-accent flex items-center gap-2 text-xs font-extrabold px-4.5 py-2.5 rounded-xl shadow-xs"
              >
                <Plus size={15} weight="bold" />
                <span>{t.addExpense}</span>
              </button>
              <HeaderControls />
            </div>
          </div>

          {/* Compact Pro Filter Toolbar */}
          <div className="surface-card p-4 lg:p-4.5 shadow-sm border" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              {/* Search Box */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[280px]">
                <MagnifyingGlass
                  size={17}
                  weight="bold"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--accent)' }}
                />
                <input
                  type="text"
                  placeholder={t.searchExpenses}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl text-xs font-bold outline-none transition-all shadow-2xs"
                  style={{
                    backgroundColor: 'var(--bg-surface-sunken)',
                    border: '1.5px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setPage(1);
                    }}
                    className="absolute right-16 top-1/2 -translate-y-1/2 text-xs font-bold p-1 hover:opacity-75 transition-opacity"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <X size={14} weight="bold" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-extrabold text-white shadow-xs transition-transform active:scale-95 bg-emerald-600 hover:bg-emerald-700"
                >
                  Search
                </button>
              </form>

              {/* Inline Filter Dropdowns */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                {/* Category Dropdown */}
                <div className="relative min-w-[155px] flex-1 sm:flex-initial">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPage(1);
                    }}
                    className={`w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl text-xs font-extrabold outline-none cursor-pointer transition-all shadow-2xs border ${
                      selectedCategory
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
                        : 'bg-[var(--bg-surface-sunken)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-emerald-500/40'
                    }`}
                  >
                    <option value="">{t.allCategories}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {locale === 'bn' ? (c.nameBn || c.name) : c.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-60">
                    ▼
                  </div>
                </div>

                {/* Payment Method Dropdown */}
                <div className="relative min-w-[160px] flex-1 sm:flex-initial">
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => {
                      setSelectedPaymentMethod(e.target.value);
                      setPage(1);
                    }}
                    className={`w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl text-xs font-extrabold outline-none cursor-pointer transition-all shadow-2xs border ${
                      selectedPaymentMethod
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-800 dark:text-sky-200'
                        : 'bg-[var(--bg-surface-sunken)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-sky-500/40'
                    }`}
                  >
                    <option value="">{t.allPaymentMethods}</option>
                    {paymentMethods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {locale === 'bn' ? (p.nameBn || p.name) : p.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-60">
                    ▼
                  </div>
                </div>

                {/* Source Dropdown */}
                <div className="relative min-w-[145px] flex-1 sm:flex-initial">
                  <select
                    value={selectedSource}
                    onChange={(e) => {
                      setSelectedSource(e.target.value);
                      setPage(1);
                    }}
                    className={`w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl text-xs font-extrabold outline-none cursor-pointer transition-all shadow-2xs border ${
                      selectedSource
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-200'
                        : 'bg-[var(--bg-surface-sunken)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-amber-500/40'
                    }`}
                  >
                    <option value="">All Sources</option>
                    <option value="manual">Manual Entry</option>
                    <option value="voice">AI Voice Entry</option>
                    <option value="receipt">AI Receipt OCR</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-60">
                    ▼
                  </div>
                </div>

                {/* Reset Action */}
                {(search || selectedCategory || selectedPaymentMethod || selectedSource) && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-2xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/25 shrink-0"
                    title="Reset all filters"
                  >
                    <ArrowClockwise size={14} weight="bold" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabular Expenses Table Card (5 Records Per Page) */}
          <div className="surface-card overflow-hidden shadow-sm">
            <div className="p-5 lg:p-6 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Transactions Log
                </h3>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                  5 per page
                </span>
              </div>

              <div className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                Showing {expenses.length} of {totalItems} entries
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-surface-sunken)' }}>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Description & Merchant
                    </th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Category
                    </th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Payment Channel
                    </th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Date & Source
                    </th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-right" style={{ color: 'var(--text-secondary)' }}>
                      Amount
                    </th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-center" style={{ color: 'var(--text-secondary)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs font-bold animate-pulse" style={{ color: 'var(--text-secondary)' }}>
                        Loading transaction records...
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <Receipt size={44} weight="bold" style={{ color: 'var(--accent)' }} className="mx-auto mb-3 opacity-60" />
                        <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>No expenses found</p>
                        <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Try resetting filters or record a new expense.</p>
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr
                        key={exp.id}
                        onClick={() => setViewingExpense(exp)}
                        className="transition-colors border-b last:border-0 cursor-pointer"
                        style={{ borderColor: 'var(--border-subtle)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {/* Description & Merchant */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                              style={{ backgroundColor: `${exp.category?.color || '#10B981'}15` }}
                            >
                              <CategoryIcon name={exp.category?.name} color={exp.category?.color || '#10B981'} size={20} />
                            </div>
                            <div>
                              <p className="font-bold tracking-tight text-sm" style={{ color: 'var(--text-primary)' }}>
                                {exp.description || exp.category?.name || 'Expense'}
                              </p>
                              {exp.merchant && (
                                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                  {exp.merchant}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6 font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: `${exp.category?.color || '#10B981'}15`,
                              color: exp.category?.color || 'var(--accent)',
                            }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: exp.category?.color || 'var(--accent)' }} />
                            <span>{locale === 'bn' ? (exp.category?.nameBn || exp.category?.name) : exp.category?.name}</span>
                          </span>
                        </td>

                        {/* Payment Method */}
                        <td className="py-4 px-6">
                          <span
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
                            style={{ backgroundColor: 'var(--bg-surface-sunken)', color: 'var(--text-primary)' }}
                          >
                            <PaymentMethodLogo
                              name={exp.paymentMethod?.name || 'Cash'}
                              size={20}
                            />
                            <span>
                              {exp.paymentMethod
                                ? (locale === 'bn' ? (exp.paymentMethod?.nameBn || exp.paymentMethod?.name) : exp.paymentMethod?.name)
                                : 'Cash'}
                            </span>
                          </span>
                        </td>

                        {/* Date & Source */}
                        <td className="py-4 px-6">
                          <div className="space-y-1.5">
                            <span className="font-bold text-xs block" style={{ color: 'var(--text-primary)' }}>
                              {exp.expenseDate}
                            </span>
                            {exp.source === 'voice' && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full"
                                style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success-text)' }}
                              >
                                <Microphone size={11} weight="bold" /> Voice
                              </span>
                            )}
                            {exp.source === 'receipt' && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full"
                                style={{ backgroundColor: 'var(--info-subtle)', color: 'var(--info)' }}
                              >
                                <UploadSimple size={11} weight="bold" /> OCR
                              </span>
                            )}
                            {exp.source === 'manual' && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full"
                                style={{ backgroundColor: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)' }}
                              >
                                Manual
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-6 text-right">
                          <span
                            className="text-base font-extrabold tabular-nums tracking-tight"
                            style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono), monospace' }}
                          >
                            {formatMoney(exp.amount, locale)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewingExpense(exp)}
                              className="p-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                              style={{ color: 'var(--text-muted)' }}
                              title="View details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(exp.id)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--destructive)';
                                e.currentTarget.style.backgroundColor = 'var(--destructive-subtle)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              title="Delete expense"
                            >
                              <Trash size={16} />
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
              <div className="p-4 flex items-center justify-between border-t" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface-sunken)' }}>
                <span className="text-xs font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  Page {locale === 'bn' ? toBengaliNumber(page) : page} of {locale === 'bn' ? toBengaliNumber(totalPages) : totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-extrabold disabled:opacity-30 transition-all border shadow-2xs hover:bg-white dark:hover:bg-zinc-800"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <CaretLeft size={14} weight="bold" />
                    <span>Prev</span>
                  </button>

                  {/* Page Indicator Pills */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    const isCur = pageNum === page;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all ${
                          isCur
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'hover:bg-white dark:hover:bg-zinc-800'
                        }`}
                        style={{
                          color: isCur ? '#ffffff' : 'var(--text-primary)',
                        }}
                      >
                        {locale === 'bn' ? toBengaliNumber(pageNum) : pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-extrabold disabled:opacity-30 transition-all border shadow-2xs hover:bg-white dark:hover:bg-zinc-800"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span>Next</span>
                    <CaretRight size={14} weight="bold" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Expense Detail Modal */}
      <Dialog.Root open={!!viewingExpense} onOpenChange={(open) => { if (!open) setViewingExpense(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50" style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(4px)' }} />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-xl focus:outline-none"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-primary)' }}
          >
            <Dialog.Close asChild>
              <button
                className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </Dialog.Close>

            {viewingExpense && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    Expense Details
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Itemized confirmation and transaction record
                  </p>
                </div>

                <div className="p-4 rounded-xl space-y-2" style={{ backgroundColor: 'var(--bg-surface-sunken)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Amount</span>
                    <span className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                      {formatMoney(viewingExpense.amount, locale)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Description</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{viewingExpense.description || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Category</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{viewingExpense.category?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Merchant</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{viewingExpense.merchant || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{viewingExpense.paymentMethod?.name || 'Cash'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Date</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{viewingExpense.expenseDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Source</span>
                    <span className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{viewingExpense.source}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleDelete(viewingExpense.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                    style={{ backgroundColor: 'var(--destructive-subtle)', color: 'var(--destructive)' }}
                  >
                    Delete Expense
                  </button>
                  <button
                    onClick={() => setViewingExpense(null)}
                    className="btn-secondary text-xs px-4 py-2 rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSuccess={fetchExpenses}
        categories={categories}
        paymentMethods={paymentMethods}
      />
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onSuccess={fetchExpenses}
        categories={categories}
        paymentMethods={paymentMethods}
      />
      <AddExpenseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchExpenses}
        categories={categories}
        paymentMethods={paymentMethods}
      />
    </div>
  );
}
