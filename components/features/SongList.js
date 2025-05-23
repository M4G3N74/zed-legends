import { useEffect, useRef, useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/SimplePlayerContext';
import SongItem from './SongItem';
import Pagination from '../ui/Pagination';

export default function SongList() {
  const {
    songs,
    pagination,
    paginationMode,
    fetchSongs,
    isLoading
  } = useLibrary();

  const { currentSong } = usePlayer();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  // Set up infinite scroll using Intersection Observer
  useEffect(() => {
    if (paginationMode !== 'infinite') return;

    // Create an observer for the load more trigger
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // If the load more trigger is visible and we have more songs to load
        if (entry.isIntersecting && pagination.hasMore && !isLoading) {
          // Load the next page
          const nextPage = pagination.currentPage + 1;
          fetchSongs(false, nextPage, true);
        }
      });
    }, {
      root: containerRef.current,
      rootMargin: '100px',
      threshold: 0.1
    });

    // Observe the load more trigger
    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (loadMoreTrigger) {
      observerRef.current.observe(loadMoreTrigger);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [paginationMode, pagination.hasMore, pagination.currentPage, isLoading, fetchSongs]);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setShowScrollTop(containerRef.current.scrollTop > 300);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

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
      {/* Playlist container */}
      <div
        ref={containerRef}
        className="playlist-container max-h-[calc(100vh-300px)] overflow-y-auto pr-1"
      >
        <ul className="playlist space-y-1">
          {songs.map((song) => (
            <SongItem
              key={song.id}
              song={song}
              isActive={currentSong?.id === song.id}
            />
          ))}

          {/* Load more trigger for infinite scroll */}
          {paginationMode === 'infinite' && pagination.hasMore && (
            <li id="load-more-trigger" className="py-4 text-center">
              <div className="load-more-text text-muted">
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-mauve"></div>
                  </div>
                ) : (
                  'Loading more songs...'
                )}
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* Pagination controls */}
      {paginationMode === 'standard' && (
        <Pagination />
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
