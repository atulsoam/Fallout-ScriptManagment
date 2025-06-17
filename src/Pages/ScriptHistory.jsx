import React, { useState, useEffect } from 'react';
import FilterForm from "../Components/ScriptHistory/FilterForm";
import HistoryTable from "../Components/ScriptHistory/HistoryTable";
import { HistoryData } from "../services/HistoryDashboard/HistoryServices";

const ScriptHistory = () => {
  const FILTER_KEY = 'scriptHistoryFilters';
  const getSavedFilters = () => {
    const saved = localStorage.getItem(FILTER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  };

  const savedFilters = getSavedFilters();
  // console.log(savedFilters);

  const [searchModel, setSearchModel] = useState('');
  const [filter, setFilter] = useState(savedFilters?.filter || 'all');
  const [scriptType, setScriptType] = useState(savedFilters?.scriptType || 'all');
  const [status, setStatus] = useState(savedFilters?.status || 'all');
  const [searchTerm, setSearchTerm] = useState(savedFilters?.searchTerm || '');
  const [fromDate, setFromDate] = useState(savedFilters?.fromDate || '');
  const [toDate, setToDate] = useState(savedFilters?.toDate || '');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // pages are 1-based
  const [pageSize] = useState(10); // or 50 if you want more per page
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const [scriptTypes, setScriptTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        filter,
        scriptType,
        status,
        searchTerm,
        fromDate,
        toDate,
      };

      console.log("Fetching data with filters:", filters);

      const result = await HistoryData({
        page: currentPage - 1,
        pageSize,
        filters,
      });
      const scriptTypes = result.scriptTypes || [];
      const statuses = result.statuses || [];



      setScriptTypes(scriptTypes);
      setStatuses(statuses);
      setData(result.data || []);
      setTotalCount(result.totalCount || 0);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };



  const clearFilters = () => {
    setFilter('all');
    setScriptType('all');
    setStatus('all');
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1); // reset pagination
    localStorage.removeItem(FILTER_KEY);

  };





  // 2. Fetch data when filters or page changes
  useEffect(() => {
    fetchData();
  }, [filter, scriptType, status, searchTerm, fromDate, toDate, currentPage]);

  useEffect(() => {
    const filters = { filter, scriptType, status, searchTerm, fromDate, toDate };
    localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
  }, [filter, scriptType, status, searchTerm, fromDate, toDate]);

  const filterData = () => {


    // Proceed with fetching
    fetchData();
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">

      <section className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Script History</h1>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Filters</h2>
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            {showFilters ? 'Hide Filters ▲' : 'Show Filters ▼'}
          </button>
        </div>

        {showFilters && (
          <FilterForm
            filter={filter}
            scriptType={scriptType}
            status={status}
            searchTerm={searchTerm}
            fromDate={fromDate}
            toDate={toDate}
            setFilter={setFilter}
            setScriptType={setScriptType}
            setStatus={setStatus}
            setSearchTerm={setSearchTerm}
            setFromDate={setFromDate}
            setToDate={setToDate}
            onFilter={filterData}
            onClear={clearFilters}
            scriptTypes={scriptTypes}
            statuses={statuses}
          />

        )}


        {loading && (
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 bg-gray-100 p-4 rounded">
                <div className="col-span-2 h-4 bg-gray-300 rounded"></div>
                <div className="col-span-1 h-4 bg-gray-300 rounded"></div>
                <div className="col-span-1 h-4 bg-gray-300 rounded"></div>
                <div className="col-span-1 h-4 bg-gray-300 rounded"></div>
                <div className="col-span-1 h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-red-600 font-semibold">{error}</p>}

        {!loading && !error && <HistoryTable data={data} />}
        {!loading && !error && data.length > 0 && (
          <div className="mt-6 flex justify-between items-center text-sm text-gray-700">
            {/* Row Summary (right) */}
            <div className="text-right text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
            </div>
            {/* Pagination Controls (left) */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span>
                Page {currentPage} of {Math.ceil(totalCount / pageSize)}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    prev < Math.ceil(totalCount / pageSize) ? prev + 1 : prev
                  )
                }
                disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>


          </div>
        )}


      </section>
    </div>
  );
};

export default ScriptHistory;
