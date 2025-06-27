import { useEffect, useRef, useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/SimplePlayerContext';
import SongItem from './SongItem';
import Pagination from '../ui/Pagination';

export default function SongList() {
  const {
    songs,
    pagination,
    fetchSongs,
    isLoading,
    error
  } = useLibrary();

  const { currentSong } = usePlayer();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef(null);

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
      {/* Playlist container - grid on md+, list on mobile */}
      <div
        ref={containerRef}
        className="playlist-container max-h-[calc(100vh-300px)] overflow-y-auto pr-1"
      >
        <ul className="playlist space-y-1 grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-3">
          {songs.map((song) => (
            <SongItem
              key={song.id}
              song={song}
              isActive={currentSong?.id === song.id}
            />
          ))}
        </ul>
      </div>

      {/* Pagination controls */}
      <Pagination />

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
