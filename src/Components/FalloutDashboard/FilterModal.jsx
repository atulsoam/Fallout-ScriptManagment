import React, { useState, useEffect } from 'react';
import colors from '../../utils/Colors';
const FilterModal = ({ open, onClose, filters, setFilters, allKeys }) => {
  const [tempFilters, setTempFilters] = useState(filters);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const updateValue = (index, key, value) => {
    const updated = [...tempFilters];
    updated[index] = { [key]: value };
    setTempFilters(updated);
  };

  const addFilter = () => {
    setTempFilters([...tempFilters, { [allKeys[0]]: '' }]);
  };

  const removeFilter = (index) => {
    const updated = [...tempFilters];
    updated.splice(index, 1);
    setTempFilters(updated);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Softer Overlay */}
      <div
        className="fixed inset-0"
        style={{ backgroundColor: `${colors.background}cc` }} // light gray with ~80% opacity
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
        className="fixed z-20 top-1/2 left-1/2 max-h-[70vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg bg-white p-6 shadow-lg"
        style={{ borderColor: colors.border, borderWidth: 1 }}
      >
        <h2
          id="filter-modal-title"
          className="mb-5 text-xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Apply Filters
        </h2>

        <div className="flex flex-col gap-3 overflow-y-auto max-h-[40vh] pr-1">
          {tempFilters.length === 0 && (
            <p
              className="text-center text-sm italic"
              style={{ color: colors.textSecondary }}
            >
              No filters added. Click “Add Filter” to start.
            </p>
          )}

          {tempFilters.map((f, i) => {
            const key = Object.keys(f)[0];
            return (
              <div key={i} className="flex items-center gap-3">
                <select
                  className="rounded border px-3 py-2 text-sm"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                    minWidth: 110,
                  }}
                  value={key}
                  onChange={(e) => updateValue(i, e.target.value, f[key])}
                  aria-label={`Select filter field for filter ${i + 1}`}
                >
                  {allKeys.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  className="flex-1 rounded border px-3 py-2 text-sm"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                  }}
                  placeholder="Enter filter value"
                  value={f[key]}
                  onChange={(e) => updateValue(i, key, e.target.value)}
                  aria-label={`Filter value input for ${key} filter`}
                />

                <button
                  type="button"
                  className="text-red-500 hover:text-red-600 transition-colors"
                  onClick={() => removeFilter(i)}
                  aria-label={`Remove filter ${i + 1}`}
                >
                  ✖
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={addFilter}
            className="rounded px-4 py-2 font-semibold shadow-sm transition-colors"
            style={{
              backgroundColor: colors.secondary,
              color: colors.buttonText,
              boxShadow: '0 2px 6px rgba(167,139,250,0.5)',
            }}
          >
            Add Filter
          </button>

          <button
            type="button"
            onClick={applyFilters}
            className="rounded px-4 py-2 font-semibold shadow-sm transition-colors"
            style={{
              backgroundColor: colors.primary,
              color: colors.buttonText,
              boxShadow: '0 2px 8px rgba(99,102,241,0.7)',
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterModal;
