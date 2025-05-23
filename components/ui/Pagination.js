import { useLibrary } from '../context/LibraryContext';

export default function Pagination() {
  const { 
    pagination, 
    fetchSongs, 
    paginationMode, 
    togglePaginationMode 
  } = useLibrary();
  
  const { currentPage, totalPages, limit, total } = pagination;
  
  // Calculate start and end item numbers
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(startItem + limit - 1, total);
  
  // Go to a specific page
  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    
    fetchSongs(false, page, false);
    
    // Scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const maxPageButtons = 5;
    const pageNumbers = [];
    
    // Calculate range of page numbers to show
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('...');
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="pagination-controls mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="page-info text-sm text-muted">
        <span>
          Showing {startItem}-{endItem} of {total} songs
        </span>
      </div>
      
      <div className="page-buttons flex items-center gap-1">
        <button 
          className="page-btn p-2 rounded-md hover:bg-overlay disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          title="First page"
        >
          <i className="fas fa-angle-double-left"></i>
        </button>
        
        <button 
          className="page-btn p-2 rounded-md hover:bg-overlay disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          title="Previous page"
        >
          <i className="fas fa-angle-left"></i>
        </button>
        
        <div className="page-numbers flex items-center">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="page-ellipsis px-3 py-1 text-muted">
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                className={`page-number w-8 h-8 flex items-center justify-center rounded-md ${
                  page === currentPage 
                    ? 'bg-mauve text-background' 
                    : 'hover:bg-overlay'
                }`}
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
          className="page-btn p-2 rounded-md hover:bg-overlay disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          title="Next page"
        >
          <i className="fas fa-angle-right"></i>
        </button>
        
        <button 
          className="page-btn p-2 rounded-md hover:bg-overlay disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          title="Last page"
        >
          <i className="fas fa-angle-double-right"></i>
        </button>
      </div>
      
      <div className="page-size-selector flex items-center gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm">
            Per page:
          </label>
          <select 
            id="page-size"
            className="bg-background border border-overlay rounded-md px-2 py-1 text-sm"
            value={limit}
            onChange={(e) => {
              const newLimit = parseInt(e.target.value);
              // This would need to be implemented in the LibraryContext
              console.log('Change limit to:', newLimit);
            }}
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </div>
        
        <div className="pagination-mode-toggle">
          <button 
            onClick={togglePaginationMode}
            className="flex items-center gap-1 p-2 rounded-md hover:bg-overlay"
            title={`Switch to ${paginationMode === 'standard' ? 'infinite scroll' : 'standard pagination'}`}
          >
            <i className={`fas ${paginationMode === 'standard' ? 'fa-toggle-on text-mauve' : 'fa-toggle-off text-muted'}`}></i>
            <span className="text-sm">
              {paginationMode === 'standard' ? 'Standard' : 'Infinite'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
