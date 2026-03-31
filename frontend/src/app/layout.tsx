import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/components/auth/auth-provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'Dealer ERP',
  description: 'Practical dealer ERP frontend for Bangladesh distribution businesses.',
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
