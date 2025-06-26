import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
    if (!error) window.location.href = '/dashboard';
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const redirectTo = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : undefined);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        redirectTo: redirectTo + '/dashboard',
      },
    });
    if (error) setError(error.message);
    setLoading(false);
    if (!error) alert('Check your email for the magic link!');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleLogin} className="bg-surface p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 rounded border"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 rounded border"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-love mb-2">{error}</div>}
        <button
          type="submit"
          className="w-full bg-mauve text-background py-2 rounded hover:bg-mauve/90"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <button
          type="button"
          onClick={handleMagicLink}
          className="w-full mt-2 bg-mauve/80 text-background py-2 rounded hover:bg-mauve/90"
          disabled={loading}
        >
          {loading ? 'Sending magic link...' : 'Send Magic Link'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <span>Don't have an account? </span>
        <Link href="/signup" className="text-mauve hover:underline">Sign up</Link>
      </div>
    </div>
  );
} 