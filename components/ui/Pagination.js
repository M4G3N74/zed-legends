import { useLibrary } from '../context/LibraryContext';

export default function Pagination() {
  const {
    currentPage = 1,
    totalPages = 7,
    songsPerPage = 50,
    totalSongs = 0,
    fetchSongs,
    setSongsPerPage
  } = useLibrary();

  // Calculate start and end item numbers
  const startItem = (currentPage - 1) * songsPerPage + 1;
  const endItem = Math.min(startItem + songsPerPage - 1, totalSongs);

  // Go to a specific page
  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    fetchSongs(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const maxPageButtons = 5;
    const pageNumbers = [];
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

  return (
    <div className="pagination-controls mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-overlay pt-6">
      <div className="page-info text-sm text-muted">
        <span>
          {totalSongs === 0
            ? 'No songs to display'
            : `Showing ${startItem}-${endItem} of ${totalSongs} songs`}
        </span>
      </div>
      <div className="page-buttons flex items-center gap-2">
        <button 
          className="page-btn p-2 rounded-lg bg-background border border-overlay hover:bg-mauve/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          title="First page"
        >
          <i className="fas fa-angle-double-left"></i>
        </button>
        <button 
          className="page-btn p-2 rounded-lg bg-background border border-overlay hover:bg-mauve/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          title="Previous page"
        >
          <i className="fas fa-angle-left"></i>
        </button>
        <div className="page-numbers flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="page-ellipsis px-3 py-1 text-muted">
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                className={`page-number w-9 h-9 flex items-center justify-center rounded-lg border border-overlay transition-colors font-semibold text-base
                  ${page === currentPage 
                    ? 'bg-mauve text-background border-mauve shadow-lg' 
                    : 'bg-background text-foreground hover:bg-mauve/10 hover:border-mauve'}
                `}
                onClick={() => goToPage(page)}
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
          className="page-btn p-2 rounded-lg bg-background border border-overlay hover:bg-mauve/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          title="Next page"
        >
          <i className="fas fa-angle-right"></i>
        </button>
        <button 
          className="page-btn p-2 rounded-lg bg-background border border-overlay hover:bg-mauve/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          title="Last page"
        >
          <i className="fas fa-angle-double-right"></i>
        </button>
      </div>
      <div className="page-size-selector flex items-center gap-2">
        <label htmlFor="page-size" className="text-sm">
          Per page:
        </label>
        <select 
          id="page-size"
          className="bg-background border border-overlay rounded-md px-2 py-1 text-sm"
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
