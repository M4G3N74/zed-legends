import { useState, useEffect, useRef, useCallback } from 'react';
import { useLibrary } from '../context/LibraryContext';

export default function SearchBar() {
  const { searchQuery, searchSongs, sortBy, changeSortOrder, isLoading, pagination, error } = useLibrary();
  const [query, setQuery] = useState(searchQuery);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showResultCount, setShowResultCount] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const sortMenuRef = useRef(null);
  const resultCountTimeoutRef = useRef(null);

  // Update local state when searchQuery changes
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Show searching indicator if query is not empty
    if (value.trim().length > 0) {
      setIsSearching(true);
    }

    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Debounce search
    window.searchTimeout = setTimeout(() => {
      console.log('Searching for:', value);
      searchSongs(value);

      // Hide searching indicator after a short delay
      setTimeout(() => {
        setIsSearching(false);
      }, 300);
    }, 500);
  };

  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with query:', query);

    // Show searching indicator if query is not empty
    if (query.trim().length > 0) {
      setIsSearching(true);
    }

    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Immediately search with current query
    searchSongs(query);

    // Hide searching indicator after a short delay
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    console.log('Clearing search');
    setQuery('');
    setIsSearching(false);

    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Immediately search with empty string
    searchSongs('');
  }, [searchSongs, setIsSearching]);

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add keyboard shortcut for search (F key)
  useEffect(() => {
    const handleKeyDown = (event) => {
      // If 'f' is pressed and no input or textarea is focused
      if (event.key === 'f' &&
          document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA') {
        event.preventDefault();
        document.getElementById('search-input').focus();
      }

      // If Escape is pressed while search input is focused, clear search
      if (event.key === 'Escape' &&
          document.activeElement.id === 'search-input') {
        handleClearSearch();
        document.getElementById('search-input').blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClearSearch]);

  // Effect to update document title when search is active
  useEffect(() => {
    if (query) {
      document.title = `Search: ${query} - Zambian Legends`;
    } else {
      document.title = 'Zambian Legends | Music Streaming';
    }

    return () => {
      document.title = 'Zambian Legends | Music Streaming';
    };
  }, [query]);

  // Effect to show search result count
  useEffect(() => {
    // Clear any existing timeout
    if (resultCountTimeoutRef.current) {
      clearTimeout(resultCountTimeoutRef.current);
    }

    // If we have a query and search has completed
    if (query && !isSearching && !isLoading) {
      setShowResultCount(true);

      // Hide the result count after 3 seconds
      resultCountTimeoutRef.current = setTimeout(() => {
        setShowResultCount(false);
      }, 3000);
    } else if (!query) {
      setShowResultCount(false);
    }

    return () => {
      if (resultCountTimeoutRef.current) {
        clearTimeout(resultCountTimeoutRef.current);
      }
    };
  }, [query, isSearching, isLoading, pagination.total]);

  // Effect to update search error state
  useEffect(() => {
    if (error) {
      setSearchError(error);
      setIsSearching(false);

      // Clear error after 5 seconds
      const errorTimeoutId = setTimeout(() => {
        setSearchError(null);
      }, 5000);

      return () => clearTimeout(errorTimeoutId);
    } else {
      setSearchError(null);
    }
  }, [error]);

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <form onSubmit={handleSubmit} className={`search-container relative flex-1 ${query ? 'active-search' : ''}`}>
        <label htmlFor="search-input" className="sr-only">
          Search songs, artists, or albums
        </label>

        {/* Search result count */}
        {showResultCount && query && !searchError && (
          <div className="search-result-count absolute -top-8 left-0 right-0 text-center text-sm text-mauve animate-fade-in">
            Found {pagination.total} {pagination.total === 1 ? 'song' : 'songs'} matching "{query}"
          </div>
        )}

        {/* Search error message */}
        {searchError && (
          <div className="search-error absolute -top-8 left-0 right-0 text-center text-sm text-love bg-love/10 py-1 px-2 rounded-md animate-fade-in flex items-center justify-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            <span>{searchError}</span>
            <button
              type="button"
              className="text-mauve hover:text-lavender ml-2 font-medium"
              onClick={() => {
                setSearchError(null);
                if (query) {
                  searchSongs(query);
                }
              }}
            >
              Retry
            </button>
          </div>
        )}

        <div className="relative">
          {isSearching || isLoading ? (
            <i className="fas fa-spinner fa-spin absolute left-3 top-1/2 -translate-y-1/2 text-mauve" aria-hidden="true"></i>
          ) : (
            <i className={`fas fa-search absolute left-3 top-1/2 -translate-y-1/2 ${query ? 'text-mauve' : 'text-muted'} transition-colors`} aria-hidden="true"></i>
          )}
          <input
            type="text"
            id="search-input"
            className={`w-full pl-10 pr-10 py-2 bg-surface rounded-md border ${
              query ? 'border-mauve' : 'border-overlay'
            } focus:outline-none focus:border-mauve focus:ring-1 focus:ring-mauve transition-colors`}
            placeholder="Search songs, artists, or albums... (Press 'f' to focus)"
            value={query}
            onChange={handleSearchChange}
            aria-label="Search songs, artists, or albums"
          />
          {query && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </form>

      <div className="sort-dropdown relative" ref={sortMenuRef}>
        <button
          id="sort-button"
          className="sort-button flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-overlay hover:bg-overlay"
          onClick={() => setShowSortMenu(!showSortMenu)}
          aria-expanded={showSortMenu}
          aria-haspopup="true"
          title="Sort Library"
        >
          <i className="fas fa-sort"></i>
          <span className="hidden sm:inline">Sort</span>
          <span className="text-xs text-muted">
            {sortBy === 'artist' ? 'Artist' : sortBy === 'album' ? 'Album' : 'Title'}
          </span>
        </button>

        {showSortMenu && (
          <div className="sort-menu absolute right-0 mt-1 w-36 bg-surface rounded-md shadow-lg border border-overlay z-10">
            <button
              className={`sort-option w-full text-left px-4 py-2 hover:bg-overlay ${sortBy === 'artist' ? 'text-mauve' : ''}`}
              onClick={() => {
                changeSortOrder('artist');
                setShowSortMenu(false);
              }}
            >
              By Artist
            </button>
            <button
              className={`sort-option w-full text-left px-4 py-2 hover:bg-overlay ${sortBy === 'album' ? 'text-mauve' : ''}`}
              onClick={() => {
                changeSortOrder('album');
                setShowSortMenu(false);
              }}
            >
              By Album
            </button>
            <button
              className={`sort-option w-full text-left px-4 py-2 hover:bg-overlay ${sortBy === 'title' ? 'text-mauve' : ''}`}
              onClick={() => {
                changeSortOrder('title');
                setShowSortMenu(false);
              }}
            >
              By Title
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
