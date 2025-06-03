import React from 'react';
import { FaDownload, FaThumbtack } from 'react-icons/fa';

const BulkActions = ({ selectedRows, data, pinnedRows, setPinnedRows }) => {
  if (selectedRows.length === 0) return null;

  const selectedData = selectedRows.map((i) => data[i]);

  const areAllSelectedPinned =
    selectedRows.length > 0 && selectedRows.every((idx) => pinnedRows.includes(idx));

  const togglePinChecked = () => {
    setPinnedRows((prev) => {
      if (areAllSelectedPinned) {
        // Unpin selected rows
        return prev.filter((idx) => !selectedRows.includes(idx));
      } else {
        // Pin selected rows (no duplicates)
        return Array.from(new Set([...prev, ...selectedRows]));
      }
    });
  };

  const download = () => {
    console.log('Download:', selectedData);
    // Add your real download/export logic here
  };

  return (
    <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-md shadow-sm flex flex-wrap items-center justify-between gap-4">
      <span className="text-sm font-medium text-blue-900">
        {selectedRows.length} row(s) selected
      </span>
      <div className="flex gap-2 flex-wrap">
        <button
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          onClick={download}
          title="Download selected rows"
        >
          <FaDownload /> Download
        </button>
        <button
          className={`flex items-center gap-2 px-3 py-1.5 text-sm ${
            areAllSelectedPinned ? 'bg-yellow-600' : 'bg-yellow-500'
          } text-white rounded hover:bg-yellow-600 transition`}
          onClick={togglePinChecked}
          title={areAllSelectedPinned ? 'Unpin selected rows' : 'Pin selected rows'}
        >
          <FaThumbtack />
          {areAllSelectedPinned ? 'Unpin' : 'Pin'} Selected
        </button>
      </div>
    </div>
  );
};

export default BulkActions;
