import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  hasPrevious,
  hasNext,
  loading = false
}) => {
  // Debug pagination data
  console.log('🔍 Pagination Debug:', {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasPrevious,
    hasNext,
    loading
  });

  // If there's only one page, don't show pagination
  if (totalPages <= 1) {
    console.log('⚠️ Pagination hidden: totalPages =', totalPages);
    return null;
  }

  // Calculate the range of pages to show
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on either side of current page
    const pages = [];
    
    let startPage = Math.max(1, currentPage - delta);
    let endPage = Math.min(totalPages, currentPage + delta);
    
    // Ensure we always show at least 5 pages if available
    if (endPage - startPage + 1 < 5) {
      if (startPage === 1) {
        endPage = Math.min(5, totalPages);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - 4);
      }
    }
    
    // Generate page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  // Debug visible pages
  console.log('📄 Visible Pages:', visiblePages);
  console.log('🎯 Should show first page button:', visiblePages[0] > 1);
  console.log('🎯 Should show last page button:', visiblePages[visiblePages.length - 1] < totalPages);

  // Pagination stats
  const start = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center">
      <div className="text-sm text-gray-600 mt-4 md:mt-0">
        Hiển thị <span className="font-medium">{start}-{end}</span> trên{' '}
        <span className="font-medium">{totalItems}</span> sản phẩm
      </div>
      
      <div className="flex items-center justify-center gap-1">
        {/* Previous page button */}
        <button
          onClick={() => hasPrevious && !loading && onPageChange(currentPage - 1)}
          disabled={!hasPrevious || loading}
          className={`px-3 py-1 rounded-md border ${
            hasPrevious && !loading
              ? 'text-blue-600 hover:bg-blue-50 border-blue-300'
              : 'text-gray-400 cursor-not-allowed border-gray-300 bg-gray-50'
          }`}
          aria-label="Trang trước"
        >
          <ChevronLeft size={18} />
        </button>

        {/* First page and ellipsis if needed */}
        {visiblePages[0] > 1 && (
          <>
            <button
              onClick={() => !loading && onPageChange(1)}
              disabled={loading}
              className={`px-3 py-1 rounded-md border font-medium ${
                loading
                  ? 'text-gray-400 cursor-not-allowed border-gray-300 bg-gray-50'
                  : 'text-blue-600 hover:bg-blue-50 border-blue-300'
              }`}
              aria-label="Trang đầu tiên"
            >
              1
            </button>
            {visiblePages[0] > 2 && (
              <span className="px-2 py-1 text-gray-400">...</span>
            )}
          </>
        )}

        {/* Visible page buttons */}
        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => !loading && onPageChange(page)}
            disabled={loading}
            className={`px-3 py-1 rounded-md border font-medium ${
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : loading
                ? 'text-gray-400 cursor-not-allowed border-gray-300 bg-gray-50'
                : 'text-blue-600 hover:bg-blue-50 border-blue-300'
            }`}
            aria-label={`Trang ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {/* Last page and ellipsis if needed */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="px-2 py-1 text-gray-400">...</span>
            )}
            <button
              onClick={() => !loading && onPageChange(totalPages)}
              disabled={loading}
              className={`px-3 py-1 rounded-md border font-medium ${
                loading
                  ? 'text-gray-400 cursor-not-allowed border-gray-300 bg-gray-50'
                  : 'text-blue-600 hover:bg-blue-50 border-blue-300'
              }`}
              aria-label="Trang cuối cùng"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next page button */}
        <button
          onClick={() => hasNext && !loading && onPageChange(currentPage + 1)}
          disabled={!hasNext || loading}
          className={`px-3 py-1 rounded-md border ${
            hasNext && !loading
              ? 'text-blue-600 hover:bg-blue-50 border-blue-300'
              : 'text-gray-400 cursor-not-allowed border-gray-300 bg-gray-50'
          }`}
          aria-label="Trang kế tiếp"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;