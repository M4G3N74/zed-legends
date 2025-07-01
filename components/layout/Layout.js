import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import NowPlayingBar from './NowPlayingBar';
import SearchBar from '../ui/SearchBar';
import BetaBanner from '../ui/BetaBanner';
import { useLibrary } from '../context/LibraryContext';
import { useUser } from '../context/UserContext';
import Link from 'next/link';
import { InstantLink, useInstantNavigation } from '../navigation/InstantRouter';

export default function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { pagination } = useLibrary();
  const { role } = useUser();
  const { prefetchPage } = useInstantNavigation();

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Prefetch all pages on mount for instant navigation
  useEffect(() => {
    const pages = ['/', '/library', '/playlists', '/request', '/support', '/about'];
    if (role === 'admin') {
      pages.push('/dashboard', '/user-management');
    }
    pages.forEach(page => prefetchPage(page));
  }, [role, prefetchPage]);

  // Height of the fixed header and banner (adjust if you change header/banner height)
  const HEADER_HEIGHT = 80;
  const BANNER_HEIGHT = 40;
  const TOTAL_TOP = HEADER_HEIGHT + BANNER_HEIGHT;

  return (
    <div className="app-container min-h-screen flex flex-col">
      {/* Beta Banner - always at the very top */}
      <BetaBanner />

      {/* Banner/Header - always at the top, full width, highest z-index below banner */}
      <header className="content-header fixed top-[40px] left-0 right-0 z-[999] bg-surface/90 backdrop-blur-xl border-b border-overlay/30 shadow-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SearchBar />
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted flex items-center gap-1">
              <span>{pagination?.total ?? 0} songs in library</span>
              <span className="text-xs text-muted cursor-help" title="If the song count appears incorrect, click the refresh button to rescan your music library">
                <i className="fas fa-question-circle"></i>
              </span>
            </div>
            <button
              className={`text-xs ${isRefreshing ? 'text-mauve' : 'text-muted hover:text-mauve'} p-1`}
              title="Refresh song count"
              disabled={isRefreshing}
              onClick={async () => {
                if (isRefreshing) return;
                setIsRefreshing(true);
                try {
                  const response = await fetch('/api/cache/clear');
                  if (response.ok) {
                    window.location.reload();
                  }
                } catch (error) {
                  console.error('Error clearing cache:', error);
                  setIsRefreshing(false);
                }
              }}
            >
              <i className={`fas ${isRefreshing ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main layout below the banner and header */}
      <div className="flex flex-1 min-h-0 pt-[120px]">
        {/* Sidebar - hidden on mobile */}
        {!isMobile && (
          <div className="h-full" style={{ minWidth: 192, maxWidth: 256 }}>
            <Sidebar isMobile={isMobile} />
          </div>
        )}
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-32 md:pb-24 min-h-0">
          {children}
          {/* Copyright Footer */}
          <footer className="mt-auto pt-8 pb-4 text-center">
            <div className="text-xs text-muted border-t border-overlay pt-4">
              <p>&copy; {new Date().getFullYear()} Zed Legends. All rights reserved.</p>
              <p className="mt-1">Purple Cyber Security ™</p>
            </div>
          </footer>
        </main>
      </div>

      {/* On mobile: Now Playing Bar above bottom nav. On desktop: fixed at bottom. */}
      {isMobile ? (
        <>
          <NowPlayingBar isMobile={isMobile} />
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-overlay flex justify-around items-center h-16 shadow-lg gap-1 px-1">
            <InstantLink href="/" className="inline-flex flex-col items-center text-muted hover:text-mauve text-xs mx-1">
              <i className="fas fa-home text-lg"></i>
              <span>Home</span>
            </InstantLink>
            <InstantLink href="/library" className="inline-flex flex-col items-center text-muted hover:text-mauve text-xs mx-1">
              <i className="fas fa-book text-lg"></i>
              <span>Library</span>
            </InstantLink>
            <InstantLink href="/playlists" className="inline-flex flex-col items-center text-muted hover:text-mauve text-xs mx-1">
              <i className="fas fa-list text-lg"></i>
              <span>Top 100</span>
            </InstantLink>
            <InstantLink href="/request" className="inline-flex flex-col items-center text-muted hover:text-mauve text-xs mx-1">
              <i className="fas fa-lightbulb text-lg"></i>
              <span>Request</span>
            </InstantLink>
            <InstantLink href="/support" className="inline-flex flex-col items-center text-muted hover:text-mauve text-xs mx-1">
              <i className="fas fa-headset text-lg"></i>
              <span>Support</span>
            </InstantLink>
            <InstantLink href="/about" className="inline-flex flex-col items-center text-muted hover:text-mauve text-xs mx-1">
              <i className="fas fa-info-circle text-lg"></i>
              <span>About</span>
            </InstantLink>
            {role === 'admin' && (
              <>
                <InstantLink href="/dashboard" className="inline-flex flex-col items-center text-muted hover:text-mauve text-xs mx-1">
                  <i className="fas fa-tachometer-alt text-lg"></i>
                  <span>Dashboard</span>
                </InstantLink>
                <InstantLink href="/user-management" className="inline-flex flex-col items-center text-muted hover:text-mauve text-xs mx-1">
                  <i className="fas fa-users-cog text-lg"></i>
                  <span>Users</span>
                </InstantLink>
              </>
            )}
          </nav>
        </>
      ) : (
        <NowPlayingBar isMobile={isMobile} />
      )}
    </div>
  );
}
