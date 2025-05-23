import { createContext, useContext, useState, useCallback } from 'react';

const LibraryContext = createContext();

export function LibraryProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('artist');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 50,
    total: 0,
    hasMore: false
  });
  const [paginationMode, setPaginationMode] = useState('standard'); // 'standard' or 'infinite'

  // Fetch songs from the API
  const fetchSongs = useCallback(async (refresh = false, page = 1, append = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Build URL with pagination and search parameters
      let url = `/api/songs?page=${page}&limit=${pagination.limit}&sortBy=${sortBy}`;
      if (searchQuery) {
        const encodedQuery = encodeURIComponent(searchQuery);
        url += `&search=${encodedQuery}`;
        console.log('Fetching songs with search query:', searchQuery);
        console.log('Encoded URL:', url);
      }

      console.log('Fetching songs from URL:', url);

      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      let data;
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        // Clear the timeout as request completed
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error('Server responded with error:', response.status, response.statusText);
          throw new Error(`Failed to fetch songs: ${response.status} ${response.statusText}`);
        }

        data = await response.json();
        console.log('Received data:', data.pagination.total, 'songs');

        // Update pagination state
        setPagination({
          currentPage: data.pagination.page,
          totalPages: data.pagination.totalPages,
          limit: data.pagination.limit,
          total: data.pagination.total,
          hasMore: data.pagination.hasMore
        });

        // Update songs state
        if (append && paginationMode === 'infinite') {
          setSongs(prevSongs => [...prevSongs, ...data.songs]);
        } else {
          setSongs(data.songs);
        }
      } catch (fetchError) {
        // Handle abort error differently
        if (fetchError.name === 'AbortError') {
          console.error('Fetch request timed out');
          throw new Error('Request timed out. Please try again.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error fetching songs:', error);

      // Provide more specific error messages based on the error
      if (error.message.includes('timed out')) {
        setError('Request timed out. The server is taking too long to respond. Please try again later.');
      } else if (error.message.includes('Failed to fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(`Failed to load songs: ${error.message}`);
      }

      // Reset songs to empty array if this is not an append operation
      if (!append) {
        setSongs([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit, searchQuery, sortBy, paginationMode]);

  // Update song metadata
  const updateSongMetadata = useCallback(async (songId, metadata) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/songs/metadata', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filePath: metadata.file,
          title: metadata.title,
          artist: metadata.artist,
          album: metadata.album
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update metadata');
      }

      const data = await response.json();

      // Update the song in the state
      setSongs(prevSongs =>
        prevSongs.map(song =>
          song.id === songId
            ? {
                ...song,
                title: metadata.title,
                artist: metadata.artist,
                album: metadata.album
              }
            : song
        )
      );

      return data;
    } catch (error) {
      console.error('Error updating metadata:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a song
  const deleteSong = useCallback(async (songId, filePath) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/songs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filePath
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete song');
      }

      // Remove the song from the state
      setSongs(prevSongs => prevSongs.filter(song => song.id !== songId));

      // Update total count in pagination
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.limit)
      }));

      return await response.json();
    } catch (error) {
      console.error('Error deleting song:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search songs
  const searchSongs = useCallback((query) => {
    console.log('LibraryContext searchSongs called with query:', query);
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, currentPage: 1 }));

    // Use a small timeout to ensure state is updated before fetching
    setTimeout(() => {
      fetchSongs(false, 1, false);
    }, 10);
  }, [fetchSongs]);

  // Change sort order
  const changeSortOrder = useCallback((sortOrder) => {
    setSortBy(sortOrder);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchSongs(false, 1, false);
  }, [fetchSongs]);

  // Toggle pagination mode
  const togglePaginationMode = useCallback(() => {
    setPaginationMode(prev => prev === 'standard' ? 'infinite' : 'standard');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchSongs(false, 1, false);
  }, [fetchSongs]);

  const value = {
    songs,
    isLoading,
    error,
    searchQuery,
    sortBy,
    pagination,
    paginationMode,
    fetchSongs,
    updateSongMetadata,
    deleteSong,
    searchSongs,
    changeSortOrder,
    togglePaginationMode
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  return useContext(LibraryContext);
}
