import React, { useEffect, useState } from 'react';
import colors from '../../utils/Colors';
import { motion, AnimatePresence } from 'framer-motion';
import { FaThumbtack } from 'react-icons/fa';

const PINNED_STORAGE_KEY = 'falloutDashboardPinnedRows';

const DataTable = ({
  data,
  selectedColumns,
  selectedRows,
  setSelectedRows,
  pinnedRows,
  setPinnedRows,
  onRowClick
}) => {

  const [pinnedExpanded, setPinnedExpanded] = useState(true);



  const toggleRow = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const togglePinRow = (index) => {
    setPinnedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const pinnedData = pinnedRows.map((idx) => data[idx]).filter(Boolean);
  const unpinnedData = data.filter((_, idx) => !pinnedRows.includes(idx));

  const toggleAllRows = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((_, idx) => idx));
    }
  };

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <div className="rounded-lg shadow-sm border" style={{ borderColor: colors.border, borderWidth: 1 }}>
      <div className="overflow-auto" style={{ maxHeight: '400px', maxWidth: '100%' }}>
        <table className="min-w-full table-auto border-collapse">
          <thead
            className="text-white"
            style={{
              backgroundColor: colors.primary,
              position: 'sticky',
              top: 0,
              zIndex: 30, // Make sure it's above the pinned rows
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <tr>
              <th className="p-3 border-r" style={{ borderColor: colors.border, width: 40 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAllRows}
                  className="cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  aria-label="Select all rows"
                />
              </th>
              <th className="p-3 border-r" style={{ borderColor: colors.border, width: 40 }}>
                <FaThumbtack title="Pinned" className="text-white mx-auto" />
              </th>
              {selectedColumns.map((col) => (
                <th
                  key={col}
                  className="p-3 text-left font-semibold uppercase text-xs tracking-wide border-r"
                  style={{ borderColor: colors.border }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Pinned rows section */}
          {pinnedData.length > 0 && (
            <>
              <tbody
                className="bg-yellow-50 sticky"
                style={{
                  top: 48, // Height of your thead (adjust if needed)
                  zIndex: 20,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >

                <tr>
                  <td
                    colSpan={selectedColumns.length + 2}
                    className="p-2 cursor-pointer font-semibold text-yellow-800"
                    onClick={() => setPinnedExpanded(!pinnedExpanded)}
                    aria-expanded={pinnedExpanded}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setPinnedExpanded(!pinnedExpanded);
                      }
                    }}
                  >
                    {pinnedExpanded ? '▼' : '▶'} Pinned Rows ({pinnedData.length})
                  </td>
                </tr>
              </tbody>
              <AnimatePresence>
                {pinnedExpanded && (
                  <motion.tbody
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {pinnedData.map((row, idx) => {
                      const originalIndex = pinnedRows[idx];
                      return (
                        <tr
                          key={`pinned-${originalIndex}`}
                          className={`${idx % 2 === 0 ? colors.background : colors.surface
                            } hover:bg-secondary/20 transition-colors cursor-pointer`}
                        >
                          <td className="p-3 border-r" style={{ borderColor: colors.border }}>
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(originalIndex)}
                              onChange={() => toggleRow(originalIndex)}
                            />
                          </td>
                          <td className="p-3 border-r text-yellow-600" style={{ borderColor: colors.border }}>
                            <button onClick={() => togglePinRow(originalIndex)} title="Unpin row">
                              <FaThumbtack className="rotate-[45deg]" />
                            </button>
                          </td>
                          {selectedColumns.map((col) => (
                            <td
                              key={col}
                              className="p-3 text-sm border-r truncate"
                              style={{ borderColor: colors.border }}
                              title={row[col] ?? ''}
                            >
                              {row[col] ?? '-'}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </motion.tbody>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Unpinned rows */}
          <tbody>
            {unpinnedData.length === 0 ? (
              <tr>
                <td
                  colSpan={selectedColumns.length + 2}
                  className="p-4 text-center text-sm italic text-gray-500"
                  style={{ color: colors.textSecondary }}
                >
                  No data available.
                </td>
              </tr>
            ) : (
              unpinnedData.map((row, idx) => {
                const originalIndex = data.indexOf(row);
                const isPinned = pinnedRows.includes(originalIndex);

                return (
                  <tr
                    key={originalIndex}
                    className={`${idx % 2 === 0 ? colors.background : colors.surface
                      } hover:bg-secondary/20 transition-colors cursor-pointer`}
                  >
                    <td className="p-3 border-r" style={{ borderColor: colors.border }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(originalIndex)}
                        onChange={() => toggleRow(originalIndex)}
                        className="cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        aria-label={`Select row ${originalIndex + 1}`}
                      />
                    </td>
                    <td className="p-3 border-r" style={{ borderColor: colors.border }}>
                      <button
                        onClick={() => togglePinRow(originalIndex)}
                        aria-label={isPinned ? 'Unpin row' : 'Pin row'}
                        title={isPinned ? 'Unpin row' : 'Pin row'}
                        className={`hover:text-yellow-600 ${isPinned ? 'text-yellow-600' : 'text-gray-400'}`}
                      >
                        <FaThumbtack className={`${isPinned ? 'rotate-[45deg]' : ''}`} />
                      </button>
                    </td>
                    {selectedColumns.map((col) => (
                      <td
                        key={col}
                        className="p-3 text-sm border-r truncate"
                        style={{ borderColor: colors.border, color: colors.textPrimary }}
                        title={row[col] ?? ''}
                        onClick={() => onRowClick && onRowClick(row, originalIndex)}
                      >
                        {row[col] ?? '-'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
