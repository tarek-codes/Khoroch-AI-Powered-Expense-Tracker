'use client';

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Sliders, Check, X } from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { translations } from '@/lib/i18n';
import { toast } from 'sonner';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentBudget: number;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentBudget,
}) => {
  const { locale } = useAppStore();
  const t = translations[locale];

  const [startingBalance, setStartingBalance] = useState(currentBudget ? currentBudget.toString() : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startingBalance || parseFloat(startingBalance) < 0) {
      toast.error('Please enter a valid budget amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/budgets', {
        month: currentMonth,
        year: currentYear,
        startingBalance: parseFloat(startingBalance),
        currency: 'BDT',
      });

      toast.success('Monthly budget updated!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50" style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(4px)' }} />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[14px] p-6 shadow-xl focus:outline-none"
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
              style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)' }}
            >
              <Sliders size={20} weight="bold" />
            </div>
            <div>
              <Dialog.Title className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t.setBudget}
              </Dialog.Title>
              <Dialog.Description className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Target for Month {currentMonth}/{currentYear}
              </Dialog.Description>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t.startingBalance} (৳)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="50000.00"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className="input-base w-full text-2xl font-semibold"
                style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
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
