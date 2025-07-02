import '../styles/globals.css';
import '../styles/frosted-glass.css';
import { PlayerProvider } from '../components/context/SimplePlayerContext';
import { LibraryProvider } from '../components/context/LibraryContext';
import { ThemeProvider } from '../components/context/ThemeContext';
import { DJProvider } from '../components/context/DJContext';
import Head from 'next/head';
import React from 'react';
import { UserProvider } from '../components/context/UserContext';
import { Analytics } from '@vercel/analytics/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error info here or send to a service
    if (typeof window !== 'undefined') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
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

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <ErrorBoundary>
        <ThemeProvider>
          <LibraryProvider>
            <PlayerProvider>
              <UserProvider>
                <DJProvider>
                  <Component {...pageProps} />
                </DJProvider>
              </UserProvider>
            </PlayerProvider>
          </LibraryProvider>
        </ThemeProvider>
      </ErrorBoundary>
      <Analytics />
    </>
  );
}

export default MyApp;
