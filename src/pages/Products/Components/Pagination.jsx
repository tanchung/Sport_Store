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
  console.log('🔢 Pagination Props:', {
    currentPage,
    totalPages,
    totalItems,
    hasPrevious,
    hasNext,
    loading
  });

  // --- ĐÃ SỬA: Tạm thời comment đoạn này để luôn hiện phân trang cho bạn test ---
  // Nếu bạn muốn ẩn phân trang khi chỉ có 1 trang thì bỏ comment dòng dưới đi nhé
  // if (totalPages <= 1) {
  //   return null;
  // }
  // ---------------------------------------------------------------------------

  // Calculate the range of pages to show
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on either side of current page
    const pages = [];
    
    // Nếu totalPages chưa có hoặc = 0 (lúc mới load), gán tạm là 1 để không lỗi
    const safeTotalPages = totalPages > 0 ? totalPages : 1;
    
    let startPage = Math.max(1, currentPage - delta);
    let endPage = Math.min(safeTotalPages, currentPage + delta);
    
    // Ensure we always show at least 5 pages if available
    if (endPage - startPage + 1 < 5) {
      if (startPage === 1) {
        endPage = Math.min(5, safeTotalPages);
      } else if (endPage === safeTotalPages) {
        startPage = Math.max(1, safeTotalPages - 4);
      }
    }
    
    // Generate page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  // Pagination stats
  const start = totalItems === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
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
          className={`px-3 py-1 rounded-md border flex items-center justify-center h-9 w-9 ${
            hasPrevious && !loading
              ? 'text-blue-600 hover:bg-blue-50 border-blue-300'
              : 'text-gray-400 cursor-not-allowed border-gray-300 bg-gray-50'
          }`}
          aria-label="Trang trước"
        >
          <ChevronLeft size={18} />
        </button>

        {/* First page and ellipsis if needed */}
        {visiblePages.length > 0 && visiblePages[0] > 1 && (
          <>
            <button
              onClick={() => !loading && onPageChange(1)}
              disabled={loading}
              className={`px-3 py-1 rounded-md border font-medium h-9 w-9 flex items-center justify-center ${
                loading
                  ? 'text-gray-400 cursor-not-allowed border-gray-300 bg-gray-50'
                  : 'text-blue-600 hover:bg-blue-50 border-blue-300'
              }`}
            >
              1
            </button>
            {visiblePages[0] > 2 && (
              <span className="px-2 py-1 text-gray-400 flex items-center justify-center h-9">...</span>
            )}
          </>
        )}

        {/* Visible page buttons */}
        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => !loading && onPageChange(page)}
            disabled={loading}
            className={`px-3 py-1 rounded-md border font-medium h-9 w-9 flex items-center justify-center ${
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : loading
                ? 'text-gray-400 cursor-not-allowed border-gray-300 bg-gray-50'
                : 'text-blue-600 hover:bg-blue-50 border-blue-300'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Last page and ellipsis if needed */}
        {visiblePages.length > 0 && visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="px-2 py-1 text-gray-400 flex items-center justify-center h-9">...</span>
            )}
            <button
              onClick={() => !loading && onPageChange(totalPages)}
              disabled={loading}
              className={`px-3 py-1 rounded-md border font-medium h-9 w-9 flex items-center justify-center ${
                loading
                  ? 'text-gray-400 cursor-not-allowed border-gray-300 bg-gray-50'
                  : 'text-blue-600 hover:bg-blue-50 border-blue-300'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next page button */}
        <button
          onClick={() => hasNext && !loading && onPageChange(currentPage + 1)}
          disabled={!hasNext || loading}
          className={`px-3 py-1 rounded-md border flex items-center justify-center h-9 w-9 ${
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