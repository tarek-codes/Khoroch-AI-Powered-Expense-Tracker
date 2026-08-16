'use client';

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Check, X } from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { translations } from '@/lib/i18n';
import { toast } from 'sonner';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: any[];
  paymentMethods: any[];
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  paymentMethods,
}) => {
  const { locale } = useAppStore();
  const t = translations[locale];

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id || '');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseTime, setExpenseTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid expense amount.');
      return;
    }
    if (!categoryId) {
      toast.error('Please select an expense category.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/expenses', {
        amount: parseFloat(amount),
        currency: 'BDT',
        categoryId,
        subcategoryId: subcategoryId || null,
        paymentMethodId: paymentMethodId || null,
        description: description || selectedCategory?.name || 'Expense',
        merchant: merchant || null,
        notes: notes || null,
        expenseDate,
        expenseTime: expenseTime ? `${expenseTime}:00` : null,
      });

      toast.success('Expense recorded successfully!');
      onSuccess();
      onClose();
      setAmount('');
      setDescription('');
      setMerchant('');
      setNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50" style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(4px)' }} />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[14px] p-6 shadow-xl focus:outline-none"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            animation: 'contentSlideIn 0.2s ease',
          }}
        >
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-2 rounded-[6px] transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <X size={18} />
            </button>
          </Dialog.Close>

          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
            >
              <Plus size={20} weight="bold" />
            </div>
            <div>
              <Dialog.Title className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t.addExpense}
              </Dialog.Title>
              <Dialog.Description className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Manual transaction entry
              </Dialog.Description>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t.amount} (৳) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-base w-full text-xl font-semibold"
                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {t.category} *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId(''); }}
                  className="input-base w-full"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {locale === 'bn' ? (c.nameBn || c.name) : c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {t.subcategory}
                </label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  disabled={subcategories.length === 0}
                  className="input-base w-full disabled:opacity-40"
                >
                  <option value="">None</option>
                  {subcategories.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {locale === 'bn' ? (s.nameBn || s.name) : s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {t.paymentMethod}
                </label>
                <select
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                  className="input-base w-full"
                >
                  {paymentMethods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {locale === 'bn' ? (p.nameBn || p.name) : p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {t.merchant}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shwapno, KFC"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="input-base w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {t.date}
                </label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {t.time}
                </label>
                <input
                  type="time"
                  value={expenseTime}
                  onChange={(e) => setExpenseTime(e.target.value)}
                  className="input-base w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t.description}
              </label>
              <input
                type="text"
                placeholder="What was this expense for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-base w-full"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                {t.cancel}
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-accent flex items-center gap-2">
                <Check size={16} weight="bold" />
                <span>{isSubmitting ? 'Saving...' : t.save}</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
