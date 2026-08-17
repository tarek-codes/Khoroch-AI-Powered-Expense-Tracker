'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ShieldCheck,
  UsersThree,
  SquaresFour,
  CreditCard,
  Sliders,
  Plus,
  X,
  Pulse,
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { translations, formatMoney, formatUserName } from '@/lib/i18n';
import { Sidebar } from '@/components/Sidebar';
import { HeaderControls } from '@/components/HeaderControls';
import { VoiceModal } from '@/components/VoiceModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const { user, isHydrated, locale } = useAppStore();
  const t = translations[locale];

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [paymentMethodsList, setPaymentMethodsList] = useState<any[]>([]);
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // New Category Form Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameBn, setNewCatNameBn] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('tag');
  const [newCatColor, setNewCatColor] = useState('#10B981');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchAdminData();
  }, [user, tab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      if (tab === 'overview') {
        const res: any = await api.get('/admin/analytics/overview');
        setStats(res.data || null);
      } else if (tab === 'users') {
        const res: any = await api.get('/admin/users');
        setUsersList(res.data.items || []);
      } else if (tab === 'categories') {
        const res: any = await api.get('/admin/categories');
        setCategoriesList(res.data || []);
      } else if (tab === 'payments') {
        const res: any = await api.get('/admin/payment-methods');
        setPaymentMethodsList(res.data || []);
      } else if (tab === 'settings') {
        const res: any = await api.get('/admin/settings');
        setSettings(res.data || null);
      }
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      toast.success('User status updated');
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      await api.post('/admin/categories', {
        name: newCatName,
        nameBn: newCatNameBn || null,
        icon: newCatIcon,
        color: newCatColor,
        isEnabled: true,
      });
      toast.success('Category created');
      setIsCatModalOpen(false);
      setNewCatName('');
      setNewCatNameBn('');
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create category');
    }
  };

  if (!isHydrated || !user || user.role !== 'admin') {
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
        <main className="p-8 space-y-6 max-w-[1600px] w-full">
          <Tabs.Root value={tab} onValueChange={setTab} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <ShieldCheck size={22} weight="bold" style={{ color: 'var(--accent)' }} />
                  <span>{t.admin}</span>
                </h1>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Platform management, user controls, and system configuration
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                {/* Admin Tabs */}
                <Tabs.List className="radix-tabs-list flex-wrap">
                  {[
                    { key: 'overview', label: 'Overview', icon: Pulse },
                    { key: 'users', label: t.adminUsers, icon: UsersThree },
                    { key: 'categories', label: t.adminCategories, icon: SquaresFour },
                    { key: 'payments', label: t.adminPaymentMethods, icon: CreditCard },
                    { key: 'settings', label: 'Settings', icon: Sliders },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Tabs.Trigger
                        key={item.key}
                        value={item.key}
                        className="radix-tabs-trigger flex items-center gap-1.5"
                      >
                        <Icon size={14} weight="bold" style={{ color: tab === item.key ? 'var(--accent)' : 'inherit' }} />
                        <span>{item.label}</span>
                      </Tabs.Trigger>
                    );
                  })}
                </Tabs.List>

                {/* Header Controls */}
                <HeaderControls />
              </div>
            </div>

            {/* Tab 1: Overview */}
            <Tabs.Content value="overview">
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="surface-card p-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                      {t.totalUsers}
                    </span>
                    <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: 'var(--text-primary)' }}>
                      {stats.totalUsers}
                    </p>
                    <p className="text-[11px] font-medium mt-1" style={{ color: 'var(--success)' }}>
                      {stats.activeUsers} active
                    </p>
                  </div>

                  <div className="surface-card p-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                      {t.totalVolume}
                    </span>
                    <p
                      className="text-2xl font-bold tabular-nums mt-1"
                      style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono), monospace' }}
                    >
                      {formatMoney(stats.totalVolumeTracked, locale)}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      {stats.totalExpensesCount} recorded
                    </p>
                  </div>

                  <div className="surface-card p-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                      {t.aiVoiceUsage}
                    </span>
                    <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: 'var(--text-primary)' }}>
                      {stats.aiVoiceUsageCount}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      Speech analyses
                    </p>
                  </div>

                  <div className="surface-card p-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                      {t.receiptScans}
                    </span>
                    <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: 'var(--text-primary)' }}>
                      {stats.receiptScansCount}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      OCR processed
                    </p>
                  </div>
                </div>
              )}
            </Tabs.Content>

            {/* Tab 2: Users */}
            <Tabs.Content value="users">
              <div className="surface-card overflow-hidden">
                <div className="p-6 pb-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <UsersThree size={18} weight="bold" style={{ color: 'var(--accent)' }} />
                    <span>Registered Accounts ({usersList.length})</span>
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-surface-sunken)' }}>
                        <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>User</th>
                        <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Email</th>
                        <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Role</th>
                        <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                        <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr
                          key={u.id}
                          style={{ borderBottom: '1px solid var(--border-subtle)' }}
                          className="transition-colors"
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <td className="py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{formatUserName(u, locale)}</td>
                          <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td className="py-3 px-4 capitalize">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-semibold"
                              style={{
                                backgroundColor: u.role === 'admin' ? 'var(--accent-subtle)' : 'var(--bg-surface-sunken)',
                                color: u.role === 'admin' ? 'var(--accent)' : 'var(--text-secondary)',
                              }}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-semibold"
                              style={{
                                backgroundColor: u.isActive ? 'var(--success-subtle)' : 'var(--destructive-subtle)',
                                color: u.isActive ? 'var(--success)' : 'var(--destructive)',
                              }}
                            >
                              {u.isActive ? t.active : t.inactive}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                              className="btn-secondary text-[11px] py-1 px-2.5"
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Tabs.Content>

            {/* Tab 3: Categories */}
            <Tabs.Content value="categories" className="space-y-4">
              <div className="surface-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <SquaresFour size={18} weight="bold" style={{ color: 'var(--accent)' }} />
                    <span>System Categories ({categoriesList.length})</span>
                  </h3>
                  <button
                    onClick={() => setIsCatModalOpen(true)}
                    className="btn-accent flex items-center gap-1.5 text-xs"
                  >
                    <Plus size={14} weight="bold" />
                    <span>{t.createNew}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {categoriesList.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-[10px]"
                      style={{ backgroundColor: 'var(--bg-surface-sunken)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#10B981' }} />
                          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                        </div>
                        {cat.nameBn && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{cat.nameBn}</span>}
                      </div>
                      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Subcategories: {cat.subcategories?.length || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Tabs.Content>

            {/* Tab 4: Payment Methods */}
            <Tabs.Content value="payments">
              <div className="surface-card p-6 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <CreditCard size={18} weight="bold" style={{ color: 'var(--accent)' }} />
                  <span>Supported Payment Methods ({paymentMethodsList.length})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {paymentMethodsList.map((pm) => (
                    <div
                      key={pm.id}
                      className="p-3.5 rounded-[10px] flex items-center justify-between"
                      style={{ backgroundColor: 'var(--bg-surface-sunken)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div>
                        <span className="text-xs font-semibold block" style={{ color: 'var(--text-primary)' }}>{pm.name}</span>
                        {pm.nameBn && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{pm.nameBn}</span>}
                      </div>
                      {pm.isDefault && (
                        <span
                          className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)' }}
                        >
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Tabs.Content>

            {/* Tab 5: System Settings */}
            <Tabs.Content value="settings">
              {settings && (
                <div className="surface-card p-6 space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                    <Sliders size={18} weight="bold" style={{ color: 'var(--accent)' }} />
                    <span>Application System Settings</span>
                  </h3>

                  <div className="space-y-3 max-w-xl text-xs">
                    {Object.entries(settings).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center p-3 rounded-[10px]"
                        style={{ backgroundColor: 'var(--bg-surface-sunken)', border: '1px solid var(--border-subtle)' }}
                      >
                        <span className="font-semibold font-mono" style={{ color: 'var(--text-secondary)' }}>{key}</span>
                        <span className="font-semibold font-mono" style={{ color: 'var(--accent)' }}>{JSON.stringify(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </main>
      </div>

      {/* New Category Modal */}
      <Dialog.Root open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50" style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(4px)' }} />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[14px] p-6 shadow-xl focus:outline-none"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-primary)', animation: 'contentSlideIn 0.2s ease' }}
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

            <Dialog.Title className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Create New Category
            </Dialog.Title>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Name (English) *</label>
                <input
                  required
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="input-base w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Bangla Name (বাংলা)</label>
                <input
                  type="text"
                  value={newCatNameBn}
                  onChange={(e) => setNewCatNameBn(e.target.value)}
                  className="input-base w-full"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Hex Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-10 h-8 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="input-base w-full font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-accent">
                  Save Category
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modals */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSuccess={fetchAdminData}
        categories={categoriesList}
        paymentMethods={paymentMethodsList}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onSuccess={fetchAdminData}
        categories={categoriesList}
        paymentMethods={paymentMethodsList}
      />
    </div>
  );
}
