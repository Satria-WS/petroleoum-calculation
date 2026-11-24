import type { Metadata } from 'next';
import './globals.css';
import { ThemeRegistry } from '@/theme/theme-registry';

export const metadata: Metadata = {
  title: 'PetroCalc Suite — Petroleum Engineering Calculation & Simulation Platform',
  description: 'Full-stack petroleum engineering calculation suite for Reservoir, Production, and Drilling & Well Control.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
