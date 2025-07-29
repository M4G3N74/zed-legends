import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import NowPlayingBar from './NowPlayingBar';
import SearchBar from '../ui/SearchBar';
import BetaBanner from '../ui/BetaBanner';
import { useLibrary, LibraryContextType } from '../context/LibraryContext';

import Link from 'next/link';
import { InstantLink, useInstantNavigation } from '../navigation/InstantRouter';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { pagination } = useLibrary() as LibraryContextType;
  // Removed auth-related state
  const { prefetchPage } = useInstantNavigation();
  const [mounted, setMounted] = useState<boolean>(false);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    // Check if current route is admin/dashboard
    setIsAdminRoute(window.location.pathname.startsWith('/dashboard'));
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Prefetch all pages on mount for instant navigation
  useEffect(() => {
    if (!mounted) return; // Only prefetch on client side

    const pages = ['/', '/library', '/playlists', '/request', '/support', '/about'];
    pages.forEach(page => prefetchPage(page));
  }, [prefetchPage, mounted]);

  // If admin route, render children without layout
  if (isAdminRoute) {
    return children;
  }

  // Height of the fixed header and banner (adjust if you change header/banner height)
  const HEADER_HEIGHT = 80;
  const BANNER_HEIGHT = 40;
  const TOTAL_TOP = HEADER_HEIGHT + BANNER_HEIGHT;

  return (
    <div className="app-container min-h-screen flex flex-col">
      {/* Beta Banner - always at the very top */}
      <BetaBanner />

      {/* Modern Header */}
      <header className="content-header fixed top-[40px] left-0 right-0 z-[999] bg-surface/95 backdrop-blur-2xl border-b border-overlay/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <SearchBar />
            <div className="flex items-center gap-4">
              <div className="bg-background/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-overlay/30">
                <div className="flex items-center gap-2">
                  <i className="fas fa-music text-mauve"></i>
                  <span className="text-sm font-medium">{pagination?.total ?? 0}</span>
                  <span className="text-xs text-muted">songs</span>
                </div>
              </div>
              <button
                className={`p-2 rounded-xl transition-all ${
                  isRefreshing 
                    ? 'bg-mauve/20 text-mauve' 
                    : 'bg-surface/50 text-muted hover:text-mauve hover:bg-mauve/10'
                } backdrop-blur-sm border border-overlay/30`}
                title="Refresh library"
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
        </div>
      </header>

      {/* Main layout below the banner and header */}
      <div className="flex flex-1 min-h-0 pt-[120px]">
        {/* Sidebar - hidden on mobile */}
        <div className="h-full" style={{ minWidth: 192, maxWidth: 256 }}>
          <Sidebar isMobile={isMobile} />
        </div>
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
      <NowPlayingBar isMobile={isMobile} />
      {mounted && isMobile && (
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
          {/* Removed admin-only navigation */}
        </nav>
      )}
    </div>
  );
}