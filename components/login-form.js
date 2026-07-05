'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const next = searchParams.get('next') || '/';
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, next })
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      setError(data.error || 'Login failed.');
      setSubmitting(false);
      return;
    }

    router.push(data.next || '/');
    router.refresh();
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div>
        <div className="eyebrow">Private dashboard access</div>
        <h1>Enter dashboard password</h1>
        <p className="muted soft-gap">This dashboard is separate from OpenClaw gateway auth. Use the dashboard password to continue.</p>
      </div>

      <input
        type="password"
        className="search"
        placeholder="Dashboard password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      {error ? <div className="login-error">{error}</div> : null}

      <button className="primary-btn" type="submit" disabled={submitting}>
        {submitting ? 'Unlocking…' : 'Unlock dashboard'}
      </button>
    </form>
  );
}
