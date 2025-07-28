'use client';

import { SimplePlayerProvider } from '../components/context/SimplePlayerContext';
import ClientOnly from '../components/ClientOnly';
import { LibraryProvider } from '../components/context/LibraryContext';
import { ThemeProvider } from '../components/context/ThemeContext';

import { Analytics } from '@vercel/analytics/react';
import Layout from '../components/layout/Layout';
import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#f38ba8' }}>
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', background: '#cba6f7', color: '#1e1e2e', border: 'none' }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LibraryProvider>
          <ClientOnly>
            <SimplePlayerProvider>
              <Layout>
                {children}
              </Layout>
            </SimplePlayerProvider>
          </ClientOnly>
        </LibraryProvider>
      </ThemeProvider>
      <Analytics />
    </ErrorBoundary>
  );
}
