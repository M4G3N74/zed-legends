import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import NowPlayingBar from './NowPlayingBar';
import SearchBar from '../ui/SearchBar';
import { useLibrary } from '../context/LibraryContext';
import { useUser } from '../context/UserContext';
import Link from 'next/link';

export default function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { pagination } = useLibrary();
  const { role } = useUser();

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className="app-container min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - hidden on mobile */}
      {!isMobile && <Sidebar isMobile={isMobile} />}

      {/* Main content - responsive margin-left to match sidebar */}
      <main className="flex-1 md:ml-48 lg:ml-64 p-4 md:p-6 pb-32 md:pb-24 mt-12">
        {/* Top header with search and controls */}
        <header className="content-header mb-6">
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
                    // Clear the cache
                    const response = await fetch('/api/cache/clear');
                    if (response.ok) {
                      // Refresh the song list
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

        {/* Main content */}
        {children}
      </main>

      {/* On mobile: Now Playing Bar above bottom nav. On desktop: fixed at bottom. */}
      {isMobile ? (
        <>
          <NowPlayingBar isMobile={isMobile} />
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-overlay flex justify-around items-center h-16 shadow-lg">
            <Link href="/" className="flex flex-col items-center text-muted hover:text-mauve text-xs">
              <i className="fas fa-home text-lg"></i>
              <span>Home</span>
            </Link>
            <Link href="/library" className="flex flex-col items-center text-muted hover:text-mauve text-xs">
              <i className="fas fa-book text-lg"></i>
              <span>Library</span>
            </Link>
            <Link href="/playlists" className="flex flex-col items-center text-muted hover:text-mauve text-xs">
              <i className="fas fa-list text-lg"></i>
              <span>Top 100</span>
            </Link>
            <Link href="/about" className="flex flex-col items-center text-muted hover:text-mauve text-xs">
              <i className="fas fa-info-circle text-lg"></i>
              <span>About</span>
            </Link>
            {role === 'admin' && (
              <>
                <Link href="/dashboard" className="flex flex-col items-center text-muted hover:text-mauve text-xs">
                  <i className="fas fa-tachometer-alt text-lg"></i>
                  <span>Dashboard</span>
                </Link>
                <Link href="/user-management" className="flex flex-col items-center text-muted hover:text-mauve text-xs">
                  <i className="fas fa-users-cog text-lg"></i>
                  <span>Users</span>
                </Link>
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
