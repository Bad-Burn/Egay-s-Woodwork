'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Cookie is set httpOnly by the server; go to the dashboard.
        const dest = searchParams.get('from') || '/admin/dashboard';
        router.replace(dest);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-ink text-brass font-serif text-2xl mb-5">
            E
          </span>
          <h1 className="font-serif text-4xl text-ink">Admin</h1>
          <p className="mt-2 text-[10px] uppercase tracking-label text-ink/40">
            Egay&apos;s Woodwork
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 bg-paper p-8 shadow-card">
          {error && (
            <div className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="admin-password" className="field-label">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="field"
              autoFocus
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center">
          <Link href="/" className="link-underline text-xs uppercase tracking-label text-ink/40 hover:text-ink">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
