'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SquaresFour,
  Receipt,
  ChartBar,
  ArrowsLeftRight,
  User,
  UsersThree,
} from '@phosphor-icons/react';
import { useAppStore } from '@/store/appStore';
import { translations } from '@/lib/i18n';

interface SidebarProps {
  onOpenVoiceModal?: () => void;
  onOpenReceiptModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();
  const { user, locale } = useAppStore();
  const t = translations[locale];

  const navItems = [
    { name: t.dashboard, href: '/', icon: SquaresFour },
    { name: t.expenses, href: '/expenses', icon: Receipt },
    { name: t.lendBorrow || 'Lend / Borrow', href: '/loans', icon: ArrowsLeftRight },
    { name: t.analytics, href: '/analytics', icon: ChartBar },
    { name: t.profile || 'Profile', href: '/profile', icon: User },
    ...(user?.role === 'admin' ? [{ name: t.admin, href: '/admin', icon: UsersThree }] : []),
  ];

  return (
    <aside
      className="w-64 min-h-screen flex flex-col p-5 shrink-0 transition-colors duration-150"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-primary)',
      }}
    >
      <div className="space-y-6">
        {/* Brand & Larger Logo Header */}
        <div className="pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <Link href="/" className="block group">
            <div className="w-full flex items-center justify-start">
              <img
                src="/logo-smooth-rounded.svg"
                alt="খরচ"
                className="h-20 w-auto object-contain object-left transition-transform group-hover:scale-102"
              />
            </div>
            <p
              className="text-[11px] font-extrabold uppercase tracking-wider mt-1 px-0.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              AI Expense Tracker
            </p>
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="space-y-1.5">
          <p
            className="text-xs font-extrabold uppercase tracking-wider px-3.5 mb-2.5"
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
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-[15px] font-bold transition-all duration-150 relative ${
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
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
