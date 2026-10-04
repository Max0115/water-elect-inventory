import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
  showInfo?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  totalItems,
  showInfo = false,
}) => {
  if (totalPages <= 1) return null;

  // Calculate page numbers to show (max 5)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 w-full">
      {showInfo && totalItems !== undefined ? (
        <div className="text-sm text-gray-400">
          顯示第 <span className="font-medium text-gray-200">{startItem}</span> - <span className="font-medium text-gray-200">{endItem}</span> 筆，
          共 <span className="font-medium text-gray-200">{totalItems}</span> 筆
        </div>
      ) : (
        <div /> // Spacer
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2A3142] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
          aria-label="上一頁"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                      : 'text-gray-400 hover:bg-[#2A3142] hover:text-white'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2A3142] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
          aria-label="下一頁"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
