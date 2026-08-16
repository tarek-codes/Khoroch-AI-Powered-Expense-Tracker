import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Baloo_Da_2, Outfit } from 'next/font/google';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const outfitDigits = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-digits',
  display: 'swap',
});

const balooDa2 = Baloo_Da_2({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-bangla',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Khoroch — AI-Powered Expense Tracker',
  description: 'Smart bilingual expense tracker powered by AI Voice & Receipt OCR',
  icons: {
    icon: '/logo-smooth-rounded.svg',
    shortcut: '/logo-smooth-rounded.svg',
    apple: '/logo-smooth-rounded.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${balooDa2.variable} ${outfitDigits.variable} ${GeistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen antialiased"
        style={{ fontFamily: 'var(--font-digits), var(--font-sans), var(--font-bangla), system-ui, sans-serif' }}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
