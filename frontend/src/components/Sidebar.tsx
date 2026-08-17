'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SquaresFour,
  Receipt,
  ChartBar,
  ArrowsLeftRight,
  User,
  UsersThree,
  FileText,
  ArrowsClockwise,
  Gear,
  SignOut,
  List,
  X,
} from '@phosphor-icons/react';
import { useAppStore } from '@/store/appStore';
import { translations } from '@/lib/i18n';

interface SidebarProps {
  onOpenVoiceModal?: () => void;
  onOpenReceiptModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, locale, logout } = useAppStore();
  const t = translations[locale];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { name: t.dashboard, href: '/dashboard', icon: SquaresFour },
    { name: t.expenses, href: '/expenses', icon: Receipt },
    { name: t.bills || 'Bills', href: '/bills', icon: FileText },
    { name: t.subscriptions || 'Subscriptions', href: '/subscriptions', icon: ArrowsClockwise },
    { name: t.lendBorrow || 'Lend / Borrow', href: '/loans', icon: ArrowsLeftRight },
    { name: t.analytics, href: '/analytics', icon: ChartBar },
    { name: t.profile || 'Profile', href: '/profile', icon: User },
    ...(user?.role === 'admin' ? [{ name: t.admin, href: '/admin', icon: UsersThree }] : []),
    { name: t.settings || 'Settings', href: '/settings', icon: Gear },
  ];

  return (
    <>
      {/* ─── Desktop / Tablet Sidebar (Hidden on Mobile < lg) ─── */}
      <aside
        className="hidden lg:flex w-68 min-h-screen flex-col pt-8 pb-6 px-5.5 shrink-0 transition-colors duration-150 sticky top-0 h-screen overflow-y-auto justify-between"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-primary)',
        }}
      >
        <div className="space-y-7 flex-1">
          {/* Brand & Logo Header (Brought down from top with ample spacing and larger logo) */}
          <div className="pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <Link href="/dashboard" className="block group">
              <div className="w-full flex items-center justify-start">
                <img
                  src="/logo-smooth-rounded.svg"
                  alt="খরচ"
                  className="h-20 sm:h-22 w-auto object-contain object-left transition-transform group-hover:scale-103"
                />
              </div>
              <p
                className="text-[11.5px] font-black uppercase tracking-wider mt-2 px-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                AI Expense Tracker
              </p>
            </Link>
          </div>

          {/* Navigation Menu */}
          <div className="space-y-1.5">
            <p
              className="text-xs font-black uppercase tracking-wider px-4 mb-2.5"
              style={{ color: 'var(--accent)' }}
            >
              Menu
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-[15.5px] font-extrabold transition-all duration-150 relative ${
                    isActive ? 'shadow-xs' : ''
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                    color: isActive ? 'var(--accent-text)' : 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      size={22}
                      weight={isActive ? 'fill' : 'bold'}
                      style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}
                    />
                    <span className="tracking-tight">{item.name}</span>
                  </div>

                  {isActive && (
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Sign Out Button placed right beneath Settings */}
            <div className="pt-2 mt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-extrabold transition-all duration-150 active:scale-95 group cursor-pointer"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--destructive)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--destructive-subtle)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={locale === 'bn' ? 'অ্যাকাউন্ট থেকে লগআউট করুন' : 'Sign out of your account'}
              >
                <SignOut size={22} weight="bold" className="group-hover:-translate-x-0.5 transition-transform" />
                <span>{t.logout || 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Drawer Overlay & Modal Sidebar ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div
            className="relative w-72 max-w-[80vw] h-full flex flex-col p-5 shadow-2xl z-10 transition-transform overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRight: '1px solid var(--border-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <img
                src="/logo-smooth-rounded.svg"
                alt="খরচ"
                className="h-14 w-auto object-contain"
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                title="Close menu"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="space-y-1.5 mt-5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all"
                    style={{
                      backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                      color: isActive ? 'var(--accent-text)' : 'var(--text-primary)',
                    }}
                  >
                    <Icon
                      size={20}
                      weight={isActive ? 'fill' : 'bold'}
                      style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Sign Out directly under Settings in Mobile Drawer */}
              <div className="pt-2 mt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer"
                  style={{
                    backgroundColor: 'var(--destructive-subtle)',
                    color: 'var(--destructive)',
                  }}
                >
                  <SignOut size={20} weight="bold" />
                  <span>{t.logout || 'Sign Out'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mobile Bottom Navigation Bar (Fixed for quick 1-thumb access on smartphones) ─── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around py-2 px-1 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        }}
      >
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <Icon size={20} weight={isActive ? 'fill' : 'bold'} />
              <span className="text-[10px] font-extrabold truncate max-w-[65px]">{item.name}</span>
            </Link>
          );
        })}

        {/* More / Menu Drawer Trigger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-slate-500 dark:text-zinc-400"
        >
          <List size={20} weight="bold" />
          <span className="text-[10px] font-extrabold">More</span>
        </button>
      </nav>
    </>
  );
};
