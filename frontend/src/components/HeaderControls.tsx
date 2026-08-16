'use client';

import React from 'react';
import {
  Globe,
  Bell,
  Sun,
  Moon,
} from '@phosphor-icons/react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';

export const HeaderControls: React.FC = () => {
  const { locale, setLocale, theme, setTheme } = useAppStore();

  const handleNotificationClick = () => {
    toast.info('No new unread alerts.');
  };

  return (
    <div className="flex items-center gap-2.5 shrink-0">
      {/* Language Switch Button */}
      <button
        onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors duration-150"
        style={{
          backgroundColor: 'var(--bg-surface-sunken)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-secondary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-surface-sunken)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        title="Switch Language"
      >
        <Globe size={15} weight="bold" style={{ color: 'var(--accent)' }} />
        <span>{locale === 'en' ? 'বাংলা' : 'English'}</span>
      </button>

      {/* Notifications Button */}
      <button
        onClick={handleNotificationClick}
        className="p-2 rounded-[8px] relative transition-colors duration-150"
        style={{
          backgroundColor: 'var(--bg-surface-sunken)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-secondary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-surface-sunken)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        title="Notifications"
      >
        <Bell size={16} weight="bold" />
        <span
          className="w-2 h-2 rounded-full absolute top-1.5 right-1.5"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      </button>

      {/* Light / Dark Mode Toggle Pill */}
      <ToggleGroup.Root
        type="single"
        value={theme}
        onValueChange={(value) => {
          if (value) setTheme(value as 'light' | 'dark');
        }}
        className="flex p-1 rounded-[8px] border"
        style={{
          backgroundColor: 'var(--bg-surface-sunken)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <ToggleGroup.Item
          value="light"
          className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-all duration-150"
          style={{
            backgroundColor: theme === 'light' ? 'var(--bg-surface)' : 'transparent',
            color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none',
          }}
          title="Light Mode"
        >
          <Sun size={14} weight={theme === 'light' ? 'fill' : 'regular'} style={{ color: '#f59e0b' }} />
          <span className="hidden sm:inline">Light</span>
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value="dark"
          className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-all duration-150"
          style={{
            backgroundColor: theme === 'dark' ? 'var(--bg-surface-raised)' : 'transparent',
            color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: theme === 'dark' ? 'var(--shadow-sm)' : 'none',
          }}
          title="Dark Mode"
        >
          <Moon size={14} weight={theme === 'dark' ? 'fill' : 'regular'} style={{ color: '#818cf8' }} />
          <span className="hidden sm:inline">Dark</span>
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );
};
