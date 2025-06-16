import React, { useMemo, useState } from 'react';
import { FaDownload, FaSearch, FaSpinner } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const ScriptDataModal = ({ isOpen, onClose, data = [], type, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    return data.filter((row) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, data]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type || 'Sheet1');
    XLSX.writeFile(workbook, `${type}_data.xlsx`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-6">
      <div className="bg-white w-full max-w-[90vw] p-6 rounded-xl shadow-2xl overflow-hidden relative border border-gray-200">

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center rounded-xl">
            <FaSpinner className="text-blue-600 text-3xl animate-spin" />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">{type} Data</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm shadow"
              disabled={loading}
            >
              <FaDownload />
              Export
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 text-2xl font-bold hover:text-red-500 ml-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="relative overflow-auto max-h-[70vh] rounded-md border shadow-inner">
          {filteredData.length > 0 ? (
            <table className="min-w-full text-sm border-separate border-spacing-y-1">
              <thead className="sticky top-0 z-10 bg-gray-100 text-xs text-gray-600 uppercase border-b">
                <tr>
                  {Object.keys(filteredData[0]).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left font-medium tracking-wide"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, i) => (
                  <tr
                    key={i}
                    className="bg-white even:bg-gray-50 hover:bg-blue-50 transition"
                  >
                    {Object.values(row).map((value, j) => (
                      <td key={j} className="px-4 py-2 whitespace-nowrap text-gray-700">
                        {typeof value === 'object'
                          ? JSON.stringify(value, null, 2)
                          : value?.toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !loading && (
              <div className="p-6 text-gray-500 text-center">No matching data found.</div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptDataModal;
