'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/hooks/use-auth';

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(searchParams.get('next') || '/dashboard');
    }
  }, [isAuthenticated, isHydrated, router, searchParams]);

  return (
    <section className="shell-card w-full max-w-md rounded-[2rem] p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
          Dealer ERP Login
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Simple, fast access for admin and operator users.
        </p>
      </div>

      <LoginForm />
    </section>
  );
}

