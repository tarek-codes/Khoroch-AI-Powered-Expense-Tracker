import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Baloo_Da_2, Outfit, Inter, Poppins, Roboto } from 'next/font/google';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const interFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const outfitFont = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const poppinsFont = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const robotoFont = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const balooDa2 = Baloo_Da_2({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-bangla',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
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
      className={`${plusJakartaSans.variable} ${interFont.variable} ${outfitFont.variable} ${poppinsFont.variable} ${robotoFont.variable} ${balooDa2.variable} ${GeistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
