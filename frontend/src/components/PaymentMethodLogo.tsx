'use client';

import React from 'react';
import {
  CreditCard,
  Money,
  Bank,
  DeviceMobile,
  Wallet,
} from '@phosphor-icons/react';

interface PaymentMethodLogoProps {
  name?: string;
  className?: string;
  size?: number;
}

export const PaymentMethodLogo: React.FC<PaymentMethodLogoProps> = ({
  name = '',
  className = '',
  size = 24,
}) => {
  const normalized = name.toLowerCase().trim();

  // 1. bKash Official Logo
  if (normalized.includes('bkash')) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-white overflow-hidden shrink-0 select-none shadow-sm border border-slate-200/60 dark:border-zinc-700/60 p-0.5 ${className}`}
        style={{
          width: size,
          height: size,
        }}
        title="bKash"
      >
        <img
          src="/bkash.png"
          alt="bKash"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  // 2. Nagad Official Logo
  if (normalized.includes('nagad')) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-white overflow-hidden shrink-0 select-none shadow-sm border border-slate-200/60 dark:border-zinc-700/60 p-0.5 ${className}`}
        style={{
          width: size,
          height: size,
        }}
        title="Nagad"
      >
        <img
          src="/nagad.png"
          alt="Nagad"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  // 3. Rocket (Dutch-Bangla Bank Mobile Banking)
  if (normalized.includes('rocket') || normalized.includes('dbbl')) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg font-black text-white shrink-0 select-none shadow-sm ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: '#8b1d7e',
        }}
        title="Rocket"
      >
        <span style={{ fontSize: `${Math.round(size * 0.45)}px`, fontWeight: 800 }}>
          🚀
        </span>
      </div>
    );
  }

  // 4. Upay
  if (normalized.includes('upay')) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg font-black text-slate-950 shrink-0 select-none shadow-sm ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: '#facc15',
        }}
        title="Upay"
      >
        <span style={{ fontSize: `${Math.round(size * 0.42)}px`, fontWeight: 900 }}>
          up
        </span>
      </div>
    );
  }

  // 5. Visa / Mastercard / Credit Card
  if (normalized.includes('card') || normalized.includes('visa') || normalized.includes('master')) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg text-white shrink-0 select-none shadow-sm ${className}`}
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        }}
        title="Card Payment"
      >
        <CreditCard size={Math.round(size * 0.58)} weight="bold" />
      </div>
    );
  }

  // 6. Bank Transfer / Wire
  if (normalized.includes('bank') || normalized.includes('transfer')) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg text-white shrink-0 select-none shadow-sm ${className}`}
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
        }}
        title="Bank Transfer"
      >
        <Bank size={Math.round(size * 0.58)} weight="bold" />
      </div>
    );
  }

  // 7. Cash
  if (normalized.includes('cash') || normalized.includes('নগদ')) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg text-white shrink-0 select-none shadow-sm ${className}`}
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        }}
        title="Cash"
      >
        <Money size={Math.round(size * 0.58)} weight="bold" />
      </div>
    );
  }

  // Default fallback
  return (
    <div
      className={`flex items-center justify-center rounded-lg text-white shrink-0 select-none shadow-sm ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: '#64748b',
      }}
    >
      <Wallet size={Math.round(size * 0.55)} weight="bold" />
    </div>
  );
};
