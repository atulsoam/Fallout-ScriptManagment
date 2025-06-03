import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import colors from '../utils/Colors';
import Datatable from "../Components/FalloutDashboard/DataTable";
import ViewControls from '../Components/FalloutDashboard/ViewControls';
import BulkActions from '../Components/FalloutDashboard/BulkActions';
import Pagination from '../Components/FalloutDashboard/Pagination';
import ColumnModal from '../Components/FalloutDashboard/ColumnModal';
import FilterModal from '../Components/FalloutDashboard/FilterModal';
import DetailModal from '../Components/FalloutDashboard/DetailModal';
import { fetchFalloutData } from "../services/FalloutDashBoardservice/FalloutDataFetch";
import { useDebounce } from 'use-debounce';

const DEFAULT_COLUMNS = [
  'ban',
  'siteOrderNumber',
  'siteOrderType',
  'siteOrderStatus',
  'finalDueDate',
  'salesChannel',
  'requestedTelephoneNumber',
];

const TableSkeleton = () => (
  <div className="p-4 space-y-4">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex space-x-4 animate-pulse">
        {[...Array(6)].map((__, j) => (
          <div key={j} className="h-4 bg-gray-300 rounded w-1/6" />
        ))}
      </div>
    ))}
  </div>
);

const FalloutDashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRowData, setModalRowData] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_COLUMNS);
  const [filters, setFilters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('falloutFilters')) || [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem('falloutSearch') || '');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isColumnModalOpen, setColumnModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [pinnedRows, setPinnedRows] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('falloutDashboardPinnedRows')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('falloutDashboardPinnedRows', JSON.stringify(pinnedRows));
  }, [pinnedRows]);

  useEffect(() => {
    localStorage.setItem('falloutFilters', JSON.stringify(filters));
    localStorage.setItem('falloutSearch', searchQuery);
  }, [filters, searchQuery]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ totalPages: 1, totalRecords: 0 });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchFalloutData({ page, pageSize, filters });
        setData(result.data || []);
        setPagination(result.pagination || {});
      } catch (error) {
        setData([]);
      }
      setLoading(false);
    };

    loadData();
  }, [page, pageSize, filters]);

  const filteredData = data.filter((row) => {
    const matchesSearch = Object.values(row)
      .join(' ')
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());

    const matchesFilters = filters.every((f) => {
      const key = Object.keys(f)[0];
      const val = f[key].toLowerCase();
      return row[key]?.toString().toLowerCase().includes(val);
    });

    return matchesSearch && matchesFilters;
  });


  const handleRowClick = (row, index) => {
    setModalRowData({ row, index });
    setModalOpen(true);
  };


  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-700">📊 Fallout Data</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setFilterModalOpen(true)}
            className="px-4 py-2 bg-white border rounded hover:bg-gray-100 shadow text-sm"
          >
            🔍 Filter
          </button>
          <button
            onClick={() => setColumnModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow text-sm"
          >
            🧱 Columns
          </button>
        </div>
      </header>

      <ViewControls
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
        filters={filters}
        setFilters={setFilters}
        pinnedRows={pinnedRows}
        setPinnedRows={setPinnedRows}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />




      <input
        type="search"
        placeholder="🔍 Search all fields..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
      />

      <BulkActions
        selectedRows={selectedRows}
        data={data}
        pinnedRows={pinnedRows}
        setPinnedRows={setPinnedRows}
      />

      <section className="bg-white rounded shadow p-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TableSkeleton />
            </motion.div>
          ) : filteredData.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center text-gray-500 py-10">
                <p className="text-lg">😕 No matching records found.</p>
                <p className="text-sm">Try adjusting filters or search terms.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Datatable
                data={filteredData}
                selectedColumns={selectedColumns}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                pinnedRows={pinnedRows}
                setPinnedRows={setPinnedRows}
                onRowClick={handleRowClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Pagination
        currentPage={page}
        rowsPerPage={pageSize}
        totalPages={pagination.totalPages}
        totalRows={pagination.totalRecords}
        onRowsPerPageChange={(size) => {
          setPage(1);
          setPageSize(size);
        }}
        onPageChange={setPage}
      />

      <AnimatePresence>
        {isColumnModalOpen && (
          <motion.div key="colModal" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <ColumnModal
              open={isColumnModalOpen}
              onClose={() => setColumnModalOpen(false)}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
              allKeys={Object.keys(data[0] || {})}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFilterModalOpen && (
          <motion.div key="filterModal" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <FilterModal
              open={isFilterModalOpen}
              onClose={() => setFilterModalOpen(false)}
              filters={filters}
              setFilters={setFilters}
              allKeys={Object.keys(data[0] || {})}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <DetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        rowData={modalRowData}   // Pass clicked row data to modal
      />    </div>
  );
};

export default FalloutDashboard;
