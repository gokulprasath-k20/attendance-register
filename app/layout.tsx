import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { PerformanceMonitor } from '@/components/performance-monitor';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Attendance Management System'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PerformanceMonitor />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
