import { createContext, useContext, useReducer, useEffect } from 'react';
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
};

function libraryReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SONGS':
      return {
        ...state,
        songs: action.payload.songs,
        totalSongs: action.payload.totalSongs,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
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
    default:
      return state;
  }
}

export const LibraryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(libraryReducer, initialState);

  const fetchSongs = async (page = 1, search = '', sortBy = 'artist') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: state.songsPerPage.toString(),
        search,
        sortBy,
      });
      
      const data = await fetchFromAPI(`${apiEndpoints.songs}?${params}`);
      
      dispatch({ 
        type: 'SET_SONGS', 
        payload: data
      });
    } catch (error) {
      console.error('Error fetching songs:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch songs' });
    }
  };

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

  useEffect(() => {
    fetchSongs();
  }, []);

  const value = {
    ...state,
    fetchSongs,
    searchSongs,
    sortSongs,
    changePage,
    refreshLibrary: () => fetchSongs(state.currentPage, state.searchQuery, state.sortBy),
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
