'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isHydrated, pathname, router]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="shell-card rounded-3xl px-6 py-5 text-sm text-[var(--muted)]">
          Checking session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

