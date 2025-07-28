import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLibrary, LibraryContextType } from '../context/LibraryContext';
import { usePlayer, SimplePlayerContextType } from '../context/SimplePlayerContext';
import SongItem from './SongItem.tsx';
import Pagination from '../ui/Pagination.tsx';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  albumArt?: string;
  path: string;
  file?: string;
}

export default function SongList() {
  const {
    songs,
    pagination,
    fetchSongs,
    isLoading,
    error,
    hasMore,
    loadMoreSongs,
    paginationMode,
    setPaginationMode
  } = useLibrary() as LibraryContextType;

  const { currentSong } = usePlayer() as SimplePlayerContextType;
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<boolean>(false);
  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  // Throttled scroll handler
  const handleScroll = useCallback(() => {
    if (throttleRef.current) return;
    
    throttleRef.current = setTimeout(() => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        setShowScrollTop(scrollTop > 300);
        
        // Infinite scroll: load more when near bottom
        if (paginationMode === 'infinite' && hasMore && !isLoading && !loadingRef.current) {
          if (scrollTop + clientHeight >= scrollHeight - 200) {
            loadingRef.current = true;
            loadMoreSongs();
          }
        }
      }
      throttleRef.current = null;
    }, 100);
  }, [paginationMode, hasMore, isLoading, loadMoreSongs]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (throttleRef.current) {
          clearTimeout(throttleRef.current);
        }
      };
    }
  }, [handleScroll]);

  // Reset loading ref when loading completes
  useEffect(() => {
    if (!isLoading) {
      loadingRef.current = false;
    }
  }, [isLoading]);

  // Scroll to top function
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Error UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center bg-red-100 text-red-800 rounded-lg p-4 my-4 mx-2 shadow-md">
        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
        </svg>
        <span className="text-center mb-2">We couldn't load your music.<br />Please check your connection or try again.</span>
        <button
          onClick={() => fetchSongs()}
          className="bg-mauve text-white px-4 py-2 rounded hover:bg-mauve/90 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="empty-state text-center py-12">
        <i className="fas fa-music text-4xl text-muted mb-4"></i>
        <h3 className="text-xl font-medium mb-2">No songs found</h3>
        <p className="text-muted">Add some music to your library or try a different search.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Pagination Mode Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 bg-surface rounded-lg p-1 border border-overlay">
          <button
            onClick={() => setPaginationMode('standard')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              paginationMode === 'standard'
                ? 'bg-mauve text-background'
                : 'text-muted hover:text-text'
            }`}
          >
            <i className="fas fa-list mr-1"></i>
            Pages
          </button>
          <button
            onClick={() => setPaginationMode('infinite')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              paginationMode === 'infinite'
                ? 'bg-mauve text-background'
                : 'text-muted hover:text-text'
            }`}
          >
            <i className="fas fa-infinity mr-1"></i>
            Infinite
          </button>
        </div>
      </div>
      {/* Playlist container - grid on md+, list on mobile */}
      <div
        ref={containerRef}
        className="playlist-container max-h-[calc(100vh-300px)] overflow-y-auto pr-1"
      >
        <ul className="playlist space-y-1 grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-3">
          {songs.map((song) => (
            song && (
              <SongItem
                key={song.id}
                song={song}
                isActive={currentSong?.id === song.id}
              />
            )
          ))}
        </ul>
      </div>

      {/* Pagination controls */}
      <Pagination />
      
      {/* Infinite scroll loading indicator */}
      {paginationMode === 'infinite' && isLoading && songs.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <div className="flex items-center gap-2 text-mauve">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-mauve"></div>
            <span className="text-sm">Loading more songs...</span>
          </div>
        </div>
      )}
      
      {/* End of results indicator */}
      {paginationMode === 'infinite' && !hasMore && songs.length > 0 && (
        <div className="text-center py-8 text-muted">
          <i className="fas fa-check-circle mb-2"></i>
          <p>You've reached the end of your music library</p>
        </div>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top fixed bottom-28 right-6 bg-mauve text-background p-3 rounded-full shadow-lg hover:bg-lavender transition-colors"
          aria-label="Scroll to top"
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </div>
  );
}