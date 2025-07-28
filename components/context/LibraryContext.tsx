import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback, ReactNode } from 'react';
import { apiEndpoints, fetchFromAPI } from '../../lib/api';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  path: string;
  album_art?: string;
}

interface LibraryState {
  songs: Song[];
  currentPage: number;
  totalPages: number;
  totalSongs: number;
  songsPerPage: number;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: string;
  paginationMode: 'infinite' | 'pagination';
  hasMore: boolean;
}

type LibraryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SONGS'; payload: { songs: Song[]; totalSongs: number; page: number; hasMore: boolean } }
  | { type: 'APPEND_SONGS'; payload: { songs: Song[]; page: number; hasMore: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SORT'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_SONGS_PER_PAGE'; payload: number }
  | { type: 'SET_PAGINATION_MODE'; payload: 'infinite' | 'pagination' };

export interface LibraryContextType extends LibraryState {
  fetchSongs: (page?: number, search?: string, sortBy?: string, songsPerPageOverride?: number, append?: boolean) => Promise<void>;
  searchSongs: (query: string) => void;
  sortSongs: (sortBy: string) => void;
  changePage: (page: number) => void;
  refreshLibrary: () => void;
  updateSongMetadata: (songId: string, metadata: Partial<Song>) => Promise<void>;
  loadMoreSongs: () => void;
  setSongsPerPage: (newSongsPerPage: number) => void;
  setPaginationMode: (mode: 'infinite' | 'pagination') => void;
  changeSortOrder: (sortKey: string) => void;
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    songsPerPage: number;
  } | null;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const initialState: LibraryState = {
  songs: [],
  currentPage: 1,
  totalPages: 1,
  totalSongs: 0,
  songsPerPage: 50,
  isLoading: false,
  error: null,
  searchQuery: '',
  sortBy: 'artist',
  paginationMode: 'infinite',
  hasMore: true,
};

function libraryReducer(state: LibraryState, action: LibraryAction): LibraryState {
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
        hasMore: action.payload.hasMore,
        isLoading: false,
        error: null,
      };
    case 'APPEND_SONGS':
      const existingSongIds = new Set(state.songs.map(s => s.id));
      const newSongs = action.payload.songs.filter(
        song =>
          !existingSongIds.has(song.id) &&
          !song.title?.toLowerCase().includes('mixdown') &&
          !song.artist?.toLowerCase().includes('mixdown')
      );
      return {
        ...state,
        songs: [...state.songs, ...newSongs],
        currentPage: action.payload.page,
        hasMore: action.payload.hasMore,
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
    case 'SET_PAGINATION_MODE':
      return { ...state, paginationMode: action.payload };
    default:
      return state;
  }
}

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(libraryReducer, initialState);
  const hasFetchedOnce = useRef<boolean>(false);

  const fetchSongs = useCallback(async (page: number = 1, search: string = '', sortBy: string = 'artist', songsPerPageOverride?: number, append: boolean = false) => {
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
      dispatch({ type: append ? 'APPEND_SONGS' : 'SET_SONGS', payload: data });
    } catch (error: any) {
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

  const searchSongs = (query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
    fetchSongs(1, query, state.sortBy);
  };

  const sortSongs = (sortBy: string) => {
    dispatch({ type: 'SET_SORT', payload: sortBy });
    fetchSongs(state.currentPage, state.searchQuery, sortBy);
  };

  const changePage = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
    fetchSongs(page, state.searchQuery, state.sortBy);
  };

  const setSongsPerPage = (newSongsPerPage: number) => {
    dispatch({ type: 'SET_SONGS_PER_PAGE', payload: newSongsPerPage });
    fetchSongs(1, state.searchQuery, state.sortBy, newSongsPerPage);
  };

  const refreshLibrary = () => {
    fetchSongs(state.currentPage, state.searchQuery, state.sortBy);
  };

  const updateSongMetadata = useCallback(async (songId: string, metadata: Partial<Song>) => {
    try {
      await fetchFromAPI(apiEndpoints.updateMetadata, {
        method: 'PUT',
        body: JSON.stringify({ songId, ...metadata }),
      });
      // Re-fetch the song list to clear any client-side cache and get fresh data.
      refreshLibrary();
    } catch (error: any) {
      console.error('Error updating song metadata:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update song metadata' });
      throw error; // Re-throw to be caught in the component
    }
  }, []);

  const loadMoreSongs = useCallback(async (): Promise<void> => {
    if (state.hasMore && !state.isLoading) {
      const nextPage = state.currentPage + 1;
      fetchSongs(nextPage, state.searchQuery, state.sortBy, state.songsPerPage, true);
    }
  }, [state.hasMore, state.isLoading, state.currentPage, state.searchQuery, state.sortBy, state.songsPerPage, fetchSongs]);

  const setPaginationMode = (mode: 'infinite' | 'pagination') => {
    dispatch({ type: 'SET_PAGINATION_MODE', payload: mode });
    // Don't refetch - just change the mode
  };

  const value: LibraryContextType = {
    ...state,
    fetchSongs,
    searchSongs,
    sortSongs,
    changePage,
    refreshLibrary,
    updateSongMetadata,
    loadMoreSongs,
    setSongsPerPage,
    setPaginationMode,
    changeSortOrder: sortSongs,
    pagination: {
      total: state.totalSongs,
      currentPage: state.currentPage,
      totalPages: state.totalPages,
      songsPerPage: state.songsPerPage,
    },
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};