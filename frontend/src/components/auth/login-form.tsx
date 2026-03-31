'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';

type FieldErrors = {
  username?: string;
  password?: string;
  form?: string;
};

function validate(username: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters.';
  }

  if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return errors;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(username, password);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    startTransition(async () => {
      try {
        await login({
          username: username.trim(),
          password,
        });

        router.replace(searchParams.get('next') || '/dashboard');
      } catch (error) {
        setErrors({
          form: error instanceof Error ? error.message : 'Login failed.',
        });
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text)]" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="shell-border w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
          placeholder="Enter your username"
        />
        {errors.username ? (
          <p className="mt-2 text-sm text-[var(--danger)]">{errors.username}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text)]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="shell-border w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
          placeholder="Enter your password"
        />
        {errors.password ? (
          <p className="mt-2 text-sm text-[var(--danger)]">{errors.password}</p>
        ) : null}
      </div>

      {errors.form ? <p className="text-sm text-[var(--danger)]">{errors.form}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}

