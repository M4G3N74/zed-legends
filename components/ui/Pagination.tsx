import React from 'react';
import { useLibrary } from '../context/LibraryContext';

interface LibraryContextType {
  currentPage: number;
  totalPages: number;
  songsPerPage: number;
  totalSongs: number;
  changePage: (page: number) => void;
  setSongsPerPage: (limit: number) => void;
  paginationMode: string;
}

export default function Pagination() {
  const {
    currentPage = 1,
    totalPages = 7,
    songsPerPage = 50,
    totalSongs = 0,
    changePage,
    setSongsPerPage,
    paginationMode
  } = useLibrary() as LibraryContextType;

  // Calculate start and end item numbers
  const startItem = (currentPage - 1) * songsPerPage + 1;
  const endItem = Math.min(startItem + songsPerPage - 1, totalSongs);

  // Go to a specific page
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    changePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display - responsive based on screen size
  const getPageNumbers = () => {
    // Fewer page buttons on mobile
    const maxPageButtons = window.innerWidth < 640 ? 3 : 5;
    const pageNumbers: (number | string)[] = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('...');
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  // Don't render pagination controls in infinite mode
  if (paginationMode === 'infinite') {
    return null;
  }

  return (
    <div className="pagination-controls mt-6 sm:mt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 border-t border-overlay pt-4 sm:pt-6">
      <div className="page-info text-xs sm:text-sm text-muted text-center lg:text-left">
        <span>
          {totalSongs === 0
            ? 'No songs to display'
            : `Showing ${startItem}-${endItem} of ${totalSongs} songs`}
        </span>
      </div>
      
      <div className="page-buttons flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
        <button 
          className="page-btn p-2 sm:p-2.5 rounded-lg bg-background border border-overlay hover:bg-mauve/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          title="First page"
        >
          <i className="fas fa-angle-double-left text-xs sm:text-sm"></i>
        </button>
        <button 
          className="page-btn p-2 sm:p-2.5 rounded-lg bg-background border border-overlay hover:bg-mauve/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          title="Previous page"
        >
          <i className="fas fa-angle-left text-xs sm:text-sm"></i>
        </button>
        
        <div className="page-numbers flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="page-ellipsis px-2 sm:px-3 py-1 text-muted text-xs sm:text-sm">
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                className={`page-number w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-overlay transition-colors font-semibold text-xs sm:text-base flex-shrink-0
                  ${page === currentPage 
                    ? 'bg-mauve text-background border-mauve shadow-lg' 
                    : 'bg-background text-text hover:bg-mauve/10 hover:border-mauve'}
                `}
                onClick={() => goToPage(page as number)}
                disabled={page === currentPage}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            )
          ))}
        </div>
        
        <button 
          className="page-btn p-2 sm:p-2.5 rounded-lg bg-background border border-overlay hover:bg-mauve/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          title="Next page"
        >
          <i className="fas fa-angle-right text-xs sm:text-sm"></i>
        </button>
        <button 
          className="page-btn p-2 sm:p-2.5 rounded-lg bg-background border border-overlay hover:bg-mauve/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          title="Last page"
        >
          <i className="fas fa-angle-double-right text-xs sm:text-sm"></i>
        </button>
      </div>
      
      <div className="page-size-selector flex items-center justify-center lg:justify-end gap-2">
        <label htmlFor="page-size" className="text-xs sm:text-sm whitespace-nowrap">
          Per page:
        </label>
        <select 
          id="page-size"
          className="bg-background border border-overlay rounded-md px-2 py-1 text-xs sm:text-sm"
          value={songsPerPage}
          onChange={(e) => {
            const newLimit = parseInt(e.target.value);
            setSongsPerPage(newLimit);
          }}
        >
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
      </div>
    </div>
  );
}
