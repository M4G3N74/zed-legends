import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import NowPlayingBar from './NowPlayingBar';
import SearchBar from '../ui/SearchBar';
import { useLibrary } from '../context/LibraryContext';

export default function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { pagination } = useLibrary();

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
      {/* Sidebar - fixed at bottom on mobile, left side on desktop */}
      <Sidebar isMobile={isMobile} />

      {/* Main content */}
      <main className="flex-1 md:ml-64 p-4 md:p-6 pb-32 md:pb-24">
        {/* Top header with search and controls */}
        <header className="content-header mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <SearchBar />

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted flex items-center gap-1">
                <span>{pagination.total} songs in library</span>
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

      {/* Now Playing Bar - fixed at bottom */}
      <NowPlayingBar isMobile={isMobile} />
    </div>
  );
}
