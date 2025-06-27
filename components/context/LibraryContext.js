import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { apiEndpoints, fetchFromAPI } from '../../lib/api';

const LibraryContext = createContext();

const initialState = {
  songs: [],
  currentPage: 1,
  totalPages: 1,
  totalSongs: 0,
  songsPerPage: 50,
  isLoading: false,
  error: null,
  searchQuery: '',
  sortBy: 'artist',
  paginationMode: 'standard',
};

function libraryReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SONGS':
      return {
        ...state,
        songs: action.payload.songs.filter(
          song =>
            !song.title?.toLowerCase().includes('mixdown') &&
            !song.artist?.toLowerCase().includes('mixdown')
        ),
        totalSongs: action.payload.totalSongs,
        currentPage: action.payload.page,
        totalPages: Math.ceil(action.payload.totalSongs / state.songsPerPage),
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_SONGS_PER_PAGE':
      return { ...state, songsPerPage: action.payload, currentPage: 1 };
    default:
      return state;
  }
}

export const LibraryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(libraryReducer, initialState);
  const hasFetchedOnce = useRef(false);

  const fetchSongs = useCallback(async (page = 1, search = '', sortBy = 'artist', songsPerPageOverride) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const limit = songsPerPageOverride || state.songsPerPage;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        sortBy,
      });
      const data = await fetchFromAPI(`${apiEndpoints.songs}?${params}`);
      dispatch({ type: 'SET_SONGS', payload: data });
    } catch (error) {
      console.error('Error fetching songs:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch songs' });
    }
  }, [state.songsPerPage]);

  // Only fetch once on mount
  useEffect(() => {
    if (!hasFetchedOnce.current) {
      fetchSongs();
      hasFetchedOnce.current = true;
    }
  }, [fetchSongs]);

  const searchSongs = (query) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
    fetchSongs(1, query, state.sortBy);
  };

  const sortSongs = (sortBy) => {
    dispatch({ type: 'SET_SORT', payload: sortBy });
    fetchSongs(state.currentPage, state.searchQuery, sortBy);
  };

  const changePage = (page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
    fetchSongs(page, state.searchQuery, state.sortBy);
  };

  const setSongsPerPage = (newSongsPerPage) => {
    dispatch({ type: 'SET_SONGS_PER_PAGE', payload: newSongsPerPage });
    fetchSongs(1, state.searchQuery, state.sortBy, newSongsPerPage);
  };

  const refreshLibrary = () => {
    fetchSongs(state.currentPage, state.searchQuery, state.sortBy);
  };

  const updateSongMetadata = useCallback(async (songId, metadata) => {
    try {
      await fetchFromAPI(apiEndpoints.updateMetadata, {
        method: 'PUT',
        body: JSON.stringify({ songId, ...metadata }),
      });
      // Re-fetch the song list to clear any client-side cache and get fresh data.
      refreshLibrary();
    } catch (error) {
      console.error('Error updating song metadata:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update song metadata' });
      throw error; // Re-throw to be caught in the component
    }
  }, []);

  const value = {
    ...state,
    fetchSongs,
    searchSongs,
    sortSongs,
    changePage,
    refreshLibrary,
    updateSongMetadata,
    paginationMode: 'standard',
    setSongsPerPage,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
