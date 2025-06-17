import React from 'react';
import { FaCalendarAlt, FaSearch, FaRedo, FaFilter, FaList } from 'react-icons/fa';
import { startOfWeek, endOfWeek, subDays, subWeeks, subMonths, format } from "date-fns";
import { useEffect } from 'react';
const FilterForm = ({
  filter,
  scriptType,
  status,
  searchTerm,
  fromDate,
  toDate,
  setFilter,
  setScriptType,
  setStatus,
  setSearchTerm,
  setFromDate,
  setToDate,
  onFilter,
  onClear,
  scriptTypes = [],
  statuses = [],
}) => {

  // Format date as YYYY-MM-DD
  const formatDate = (date) => format(date, "yyyy-MM-dd");

  useEffect(() => {
    const today = new Date();
    let from = '';
    let to = formatDate(today);

    switch (filter) {
      case 'lastDay':
        from = formatDate(subDays(today, 1));
        break;
      case 'lastWeek':
        from = formatDate(subWeeks(today, 1));
        break;
      case 'lastMonth':
        from = formatDate(subMonths(today, 1));
        break;
      case 'thisWeek':
        from = formatDate(startOfWeek(today, { weekStartsOn: 1 })); // Monday
        break;
      case 'all':
      default:
        from = '';
        to = '';
        break;
    }

    setFromDate(from);
    setToDate(to);
  }, [filter]);



  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onFilter();
      }}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200"
    >
      {/* Timeframe */}
      <div className="flex flex-col">
        <label htmlFor="filter" className="mb-1 font-medium text-gray-700 flex items-center gap-1">
          <FaFilter className="text-blue-500" />
          Timeframe
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="all">All</option>
          <option value="lastDay">Last Day</option>
          <option value="lastWeek">Last Week</option>
          <option value="lastMonth">Last Month</option>
          <option value="thisWeek">This Week</option>
        </select>
      </div>

      {/* Script Type */}
      <div className="flex flex-col">
        <label htmlFor="scriptType" className="mb-1 font-medium text-gray-700 flex items-center gap-1">
          <FaList className="text-blue-500" />
          Script Type
        </label>
        {/* Script Type */}
        <select
          id="scriptType"
          value={scriptType}
          onChange={(e) => setScriptType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="all">All</option>
          {scriptTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="flex flex-col">
        <label htmlFor="status" className="mb-1 font-medium text-gray-700 flex items-center gap-1">
          <FaList className="text-blue-500" />
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="all">All</option>
          {statuses.map((stat) => (
            <option key={stat} value={stat}>{stat}</option>
          ))}
        </select>
      </div>

      {/* Script Name */}
      <div className="col-span-full lg:col-span-2 flex flex-col">
        <label htmlFor="searchTerm" className="mb-1 font-medium text-gray-700">
          Search by Script Name
        </label>
        <div className="relative">
          <input
            id="searchTerm"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g., Manual_trigger"
            className="w-full border border-gray-300 rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Date Range */}
      <div className="col-span-full xl:col-span-3 flex flex-col gap-4 sm:flex-row items-end">
        <div className="flex flex-col flex-1">
          <label htmlFor="fromDate" className="mb-1 font-medium text-gray-700 flex items-center gap-1">
            <FaCalendarAlt className="text-blue-500" />
            From
          </label>
          <input
            id="fromDate"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div className="flex flex-col flex-1">
          <label htmlFor="toDate" className="mb-1 font-medium text-gray-700 flex items-center gap-1">
            <FaCalendarAlt className="text-blue-500" />
            To
          </label>
          <input
            id="toDate"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded shadow flex items-center gap-2 transition"
          >
            <FaSearch /> Filter
          </button>
          <button
            type="button"
            onClick={onClear}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded shadow flex items-center gap-2 transition"
          >
            <FaRedo /> Clear
          </button>
        </div>
      </div>
    </form>
  );
};

export default FilterForm;
