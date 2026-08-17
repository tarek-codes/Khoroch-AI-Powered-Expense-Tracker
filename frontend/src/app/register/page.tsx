'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Label from '@radix-ui/react-label';
import {
  User,
  EnvelopeSimple,
  LockKey,
  Eye,
  EyeSlash,
  CheckCircle,
  Sparkle,
  ShieldCheck,
  ArrowRight,
} from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { HeaderControls } from '@/components/HeaderControls';
import { translations } from '@/lib/i18n';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { user, isHydrated, setUser, locale } = useAppStore();
  const t = translations[locale];

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isHydrated && user) {
      router.push('/dashboard');
    }
  }, [user, isHydrated, router]);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: '', color: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, text: locale === 'bn' ? 'দুর্বল' : 'Weak', color: '#f43f5e' };
    if (score === 2) return { score: 2, text: locale === 'bn' ? 'মোটামুটি' : 'Fair', color: '#f59e0b' };
    if (score === 3) return { score: 3, text: locale === 'bn' ? 'ভালো' : 'Good', color: '#0ea5e9' };
    return { score: 4, text: locale === 'bn' ? 'শক্তিশালী' : 'Strong', color: '#10b981' };
  };

  const strength = getPasswordStrength();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(
        locale === 'bn'
          ? 'পাসওয়ার্ড দুটি মিলছে না! দয়া করে পুনরায় যাচাই করুন।'
          : 'Passwords do not match! Please check again.'
      );
      return;
    }

    if (password.length < 6) {
      toast.error(
        locale === 'bn'
          ? 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    try {
      setLoading(true);
      const res: any = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        preferredCurrency: 'BDT',
        preferredLocale: locale,
      });

      setUser(res.data.user, res.data.accessToken);
      toast.success(
        locale === 'bn'
          ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! খরচে আপনাকে স্বাগতম।'
          : 'Registration successful! Welcome to Khoroch.'
      );
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || (locale === 'bn' ? 'নিবন্ধন ব্যর্থ হয়েছে' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-150 dashboard-scaled-text"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-20">
        <HeaderControls />
      </div>

      {/* Atmospheric Background Ambient Glow */}
      <div
        className="absolute w-[520px] h-[520px] rounded-full pointer-events-none opacity-20 blur-[110px] -top-32 -left-32"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
      />
      <div
        className="absolute w-[440px] h-[440px] rounded-full pointer-events-none opacity-15 blur-[95px] -bottom-20 -right-20"
        style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-lg surface-card p-7 sm:p-9 shadow-xl z-10 my-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/login" className="inline-block transition-transform hover:scale-105">
            <img
              src="/logo-smooth-rounded.svg"
              alt="খরচ"
              className="h-20 sm:h-24 w-auto object-contain mx-auto mb-2.5"
            />
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {locale === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create an Account'}
          </h1>
          <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {locale === 'bn'
              ? 'এআই ভয়েস ও রসিদ ওসিআর সহ আধুনিক খরচ ট্র্যাকিং শুরু করুন'
              : 'Start tracking your daily expenses with AI in seconds'}
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label.Root className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'bn' ? 'নামের প্রথম অংশ' : 'First Name'} <span className="text-rose-500">*</span>
              </Label.Root>
              <input
                type="text"
                required
                placeholder={locale === 'bn' ? 'তারেক' : 'Tarek'}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-base w-full text-sm font-semibold px-3.5"
              />
            </div>

            <div>
              <Label.Root className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'bn' ? 'নামের শেষ অংশ' : 'Last Name'}
              </Label.Root>
              <input
                type="text"
                placeholder={locale === 'bn' ? 'হাসান' : 'Hasan'}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-base w-full text-sm font-semibold px-3.5"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <Label.Root className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'} <span className="text-rose-500">*</span>
            </Label.Root>
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base w-full text-sm font-semibold px-3.5"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label.Root className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'bn' ? 'পাসওয়ার্ড' : 'Password'} <span className="text-rose-500">*</span>
              </Label.Root>
              {password && (
                <span className="text-[11px] font-extrabold" style={{ color: strength.color }}>
                  {strength.text}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base w-full pl-3.5 pr-10 text-sm font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className="h-1 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor:
                        step <= strength.score ? strength.color : 'var(--bg-surface-sunken)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label.Root className="text-xs font-bold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              {locale === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'} <span className="text-rose-500">*</span>
            </Label.Root>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-base w-full pl-3.5 pr-10 text-sm font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
              </button>
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="text-[11px] font-bold text-rose-500 mt-1">
                {locale === 'bn' ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match'}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 btn-accent py-3 font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all"
          >
            <span>{loading ? (locale === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating account...') : (locale === 'bn' ? 'নিবন্ধন সম্পন্ন করুন' : 'Complete Registration')}</span>
            {!loading && <ArrowRight size={16} weight="bold" />}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs mt-6 font-semibold" style={{ color: 'var(--text-muted)' }}>
          {locale === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
          <Link href="/login" className="font-extrabold hover:underline" style={{ color: 'var(--accent)' }}>
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
}

