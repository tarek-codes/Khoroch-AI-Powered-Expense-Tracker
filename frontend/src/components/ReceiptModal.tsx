'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as Dialog from '@radix-ui/react-dialog';
import { X, UploadSimple, Check, Lightning, Image } from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { translations, formatMoney, toBengaliNumber } from '@/lib/i18n';
import { toast } from 'sonner';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: any[];
  paymentMethods: any[];
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  paymentMethods,
}) => {
  const { locale } = useAppStore();
  const t = translations[locale];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [aiLogId, setAiLogId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [amount, setAmount] = useState<number>(0);
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [items, setItems] = useState<any[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScannedData(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error('Please upload an image first.');
      return;
    }

    try {
      setIsScanning(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res: any = await api.post('/ai/receipts/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const payload = res?.data?.data || res?.data || res;
      if (payload) {
        setScannedData(payload);
        setReceiptId(payload.receiptId || null);
        setAiLogId(payload.aiLogId || null);

        const extracted = payload.extractedData || {};
        setAmount(extracted.totalAmount || 0);
        setMerchant(extracted.merchantName || extracted.merchant || '');
        setDescription(extracted.merchantName || extracted.merchant ? `Receipt from ${extracted.merchantName || extracted.merchant}` : 'Receipt Expense');
        setExpenseDate(extracted.date || new Date().toISOString().split('T')[0]);
        setItems(extracted.items || []);

        const matchedCat = categories.find(
          (c) =>
            c.name.toLowerCase() === (extracted.categorySuggested || extracted.categoryName || '').toLowerCase() ||
            (c.nameBn && (c.nameBn === extracted.categorySuggested || c.nameBn === extracted.categoryName)),
        );
        setCategoryId(matchedCat?.id || categories[0]?.id || '');
        if (extracted.paymentMethodId) {
          setPaymentMethodId(extracted.paymentMethodId);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to scan receipt image');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!amount || amount <= 0) {
      toast.error('Invalid receipt total amount.');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a category for this receipt.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        aiLogId,
        source: 'receipt',
        expenses: [
          {
            amount: parseFloat(amount.toString()),
            currency: 'BDT',
            categoryId,
            paymentMethodId: paymentMethodId || null,
            description: description || 'Scanned Receipt',
            merchant: merchant || null,
            expenseDate: expenseDate || new Date().toISOString().split('T')[0],
            receiptId: receiptId || null,
            items: items.map((item) => ({
              itemName: item.name || 'Item',
              quantity: item.quantity || 1,
              unitPrice: item.price || item.total || 0,
              totalPrice: item.total || item.price || 0,
            })),
          },
        ],
      };

      await api.post('/expenses/batch-confirm', payload);
      toast.success('Receipt verified and added to expenses!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm receipt');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50" style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(4px)' }} />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-[14px] p-6 shadow-xl focus:outline-none max-h-[90vh] overflow-y-auto"
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

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center"
              style={{ backgroundColor: 'var(--info-subtle)', color: 'var(--info)' }}
            >
              <UploadSimple size={20} weight="bold" />
            </div>
            <div>
              <Dialog.Title className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                {t.uploadReceipt}
                <span
                  className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent-text)',
                    border: '1px solid var(--accent)',
                    opacity: 0.8,
                  }}
                >
                  OCR & AI
                </span>
              </Dialog.Title>
              <Dialog.Description className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {t.receiptAcceptedTypes}
              </Dialog.Description>
            </div>
          </div>

          {/* Dropzone */}
          {!scannedData && (
            <div
              {...getRootProps()}
              className="border-2 border-dashed rounded-[10px] p-8 text-center cursor-pointer transition-colors"
              style={{
                borderColor: isDragActive ? 'var(--accent)' : 'var(--border-primary)',
                backgroundColor: isDragActive ? 'var(--accent-subtle)' : 'var(--bg-surface-sunken)',
              }}
            >
              <input {...getInputProps()} />
              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Receipt Preview"
                    className="max-h-48 rounded-lg object-contain mb-3 shadow"
                    style={{ border: '1px solid var(--border-primary)' }}
                  />
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedFile?.name}</p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Click or drag another image to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Image size={40} weight="light" style={{ color: 'var(--text-muted)' }} className="mb-3" />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{t.dragReceiptHere}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t.receiptAcceptedTypes}</p>
                </div>
              )}
            </div>
          )}

          {/* Scan Button */}
          {!scannedData && selectedFile && (
            <div className="flex justify-end mt-4">
              <button onClick={handleScan} disabled={isScanning} className="btn-accent flex items-center gap-2">
                <Lightning size={16} weight="fill" />
                <span>{isScanning ? t.processingAi : (locale === 'bn' ? 'এআই দিয়ে স্ক্যান ও এক্সট্র্যাক্ট করুন' : 'Scan & Extract with AI')}</span>
              </button>
            </div>
          )}

          {/* Scanned Data Review */}
          {scannedData && (
            <div className="mt-4 space-y-4">
              <div
                className="p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
                style={{ backgroundColor: 'var(--bg-surface-sunken)', border: '1px solid var(--border-primary)' }}
              >
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t.totalSpent} (৳)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="input-base w-full font-extrabold text-base"
                    style={{ color: 'var(--accent-text)', fontFamily: 'var(--font-geist-mono), monospace' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t.merchant}</label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="input-base w-full font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t.category}</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="input-base w-full font-bold cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {locale === 'bn' ? (c.nameBn || c.name) : c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t.paymentMethod}</label>
                  <select
                    value={paymentMethodId}
                    onChange={(e) => setPaymentMethodId(e.target.value)}
                    className="input-base w-full font-bold cursor-pointer"
                  >
                    <option value="">{locale === 'bn' ? 'ডিফল্ট পেমেন্ট' : 'Default Payment'}</option>
                    {paymentMethods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {locale === 'bn' ? (p.nameBn || p.name) : p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line Items */}
              {items.length > 0 && (
                <div className="rounded-[10px] overflow-hidden" style={{ border: '1px solid var(--border-primary)' }}>
                  <div className="px-4 py-2 text-xs font-semibold" style={{ backgroundColor: 'var(--bg-surface-sunken)', color: 'var(--text-secondary)' }}>
                    {locale === 'bn' ? `রসিদের আইটেম সমূহ (${toBengaliNumber(items.length)})` : `Extracted Receipt Items (${items.length})`}
                  </div>
                  <div className="max-h-40 overflow-y-auto text-xs" style={{ borderTop: '1px solid var(--border-primary)' }}>
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 flex items-center justify-between"
                        style={{ borderBottom: idx < items.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>{item.name || (locale === 'bn' ? `আইটেম #${toBengaliNumber(idx + 1)}` : `Item #${idx + 1}`)}</span>
                        <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                          {formatMoney(item.totalPrice || item.total || item.price || item.unitPrice || 0, locale)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={onClose} className="btn-secondary">
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReceipt}
                  disabled={isSaving}
                  className="btn-accent flex items-center gap-2"
                >
                  <Check size={16} weight="bold" />
                  <span>{isSaving ? (locale === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (locale === 'bn' ? 'রসিদ সেভ করুন' : 'Confirm & Save Receipt')}</span>
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
