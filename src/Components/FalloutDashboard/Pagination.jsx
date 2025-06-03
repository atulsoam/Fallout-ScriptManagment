import React from 'react';
import colors from '../../utils/Colors';
const Pagination = ({
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  totalPages
}) => {
  // const totalPages = Math.ceil(totalRows / rowsPerPage);

  const rowsPerPageOptions = [10, 25, 50, 100];

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex justify-between items-center mt-4 px-2 py-1 bg-white rounded shadow-sm border" style={{ borderColor: colors.border }}>
      <div className="flex items-center gap-2 text-sm text-gray-600" style={{ color: colors.textSecondary }}>
        <label htmlFor="rowsPerPage" className="select-none">Rows per page:</label>
        <select
          id="rowsPerPage"
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="border rounded px-2 py-1 cursor-pointer"
          style={{ borderColor: colors.border, color: colors.textPrimary }}
        >
          {rowsPerPageOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => canGoPrev && onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          className={`px-3 py-1 rounded ${canGoPrev ? 'bg-primary text-buttonText hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          style={{ backgroundColor: canGoPrev ? colors.primary : undefined, color: canGoPrev ? colors.buttonText : undefined }}
          aria-label="Previous Page"
        >
          «
        </button>

        <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          onClick={() => canGoNext && onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className={`px-3 py-1 rounded ${canGoNext ? 'bg-primary text-buttonText hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          style={{ backgroundColor: canGoNext ? colors.primary : undefined, color: canGoNext ? colors.buttonText : undefined }}
          aria-label="Next Page"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;
