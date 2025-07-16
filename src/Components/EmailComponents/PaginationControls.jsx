const PaginationControls = ({ currentPage, totalItems, limit, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex space-x-2">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            className={`px-3 py-1 border rounded ${
              i + 1 === currentPage ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
      <span className="text-sm text-gray-500">{totalItems} records total</span>
    </div>
  );
};

export default PaginationControls