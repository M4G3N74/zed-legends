'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/hooks/use-auth';
import { Header } from '../components/layout';
import { MailIcon, LockIcon, UserIcon } from '../components/icons';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);

    const result = await register(email, name, password);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Registration failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Header title="Sign Up" />

      <div className="px-4 pt-8 pb-12">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold gradient-text mb-2">
              Create Account
            </h1>
            <p className="text-muted">Join Zed Legends today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-love/20 text-love text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-muted mb-2">Name</label>
              <div className="relative">
                <UserIcon
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-14 pl-12 pr-4 glass rounded-xl text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Email</label>
              <div className="relative">
                <MailIcon
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-14 pl-12 pr-4 glass rounded-xl text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Password</label>
              <div className="relative">
                <LockIcon
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="password"
                  placeholder="Min 4 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  className="w-full h-14 pl-12 pr-4 glass rounded-xl text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-accent text-bg font-semibold rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
