import React, { useState, useEffect, useRef } from 'react';

const encodeViewData = (data) => {
  return btoa(encodeURIComponent(JSON.stringify(data)));
};

const decodeViewData = (str) => {
  try {
    return JSON.parse(decodeURIComponent(atob(str)));
  } catch (e) {
    console.error("Invalid view data:", e);
    return null;
  }
};

const getSavedViews = () => {
  try {
    return JSON.parse(localStorage.getItem('falloutSavedViews')) || [];
  } catch {
    return [];
  }
};

const saveViewToStorage = (name, data) => {
  const views = getSavedViews();
  const updated = views.filter(v => v.name !== name);
  updated.push({ name, data });
  localStorage.setItem('falloutSavedViews', JSON.stringify(updated));
};

const deleteViewFromStorage = (name) => {
  const views = getSavedViews().filter(v => v.name !== name);
  localStorage.setItem('falloutSavedViews', JSON.stringify(views));
};

const ViewControls = ({
  selectedColumns,
  filters,
  pinnedRows,
  searchQuery,
  page,
  pageSize,
  setSelectedColumns,
  setFilters,
  setPinnedRows,
  setSearchQuery,
  setPage,
  setPageSize
}) => {
  const [viewName, setViewName] = useState('');
  const [savedViews, setSavedViews] = useState([]);
  const [copiedView, setCopiedView] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef();

  useEffect(() => {
    setSavedViews(getSavedViews());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('viewData');
    if (encoded) {
      const view = decodeViewData(encoded);
      if (view) {
        setSelectedColumns(view.selectedColumns || []);
        setFilters(view.filters || []);
        setPinnedRows(view.pinnedRows || []);
        setSearchQuery(view.searchQuery || '');
        setPage(view.page || 1);
        setPageSize(view.pageSize || 10);
        setViewName('Shared View');
        alert('🔄 View loaded from shared link');
      }
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveView = () => {
    if (!viewName.trim()) {
      alert('⚠️ Enter a view name first');
      return;
    }
    const view = {
      selectedColumns,
      filters,
      pinnedRows,
      searchQuery,
      page,
      pageSize
    };
    saveViewToStorage(viewName.trim(), view);
    setSavedViews(getSavedViews());
    alert('✅ View saved!');
  };

  const handleDeleteView = (name) => {
    if (!window.confirm(`Delete view "${name}"?`)) return;
    deleteViewFromStorage(name);
    setSavedViews(getSavedViews());
    alert('🗑️ View deleted');
  };

  const handleLoadView = (name) => {
    const view = savedViews.find(v => v.name === name);
    if (!view) return;
    setSelectedColumns(view.data.selectedColumns || []);
    setFilters(view.data.filters || []);
    setPinnedRows(view.data.pinnedRows || []);
    setSearchQuery(view.data.searchQuery || '');
    setPage(view.data.page || 1);
    setPageSize(view.data.pageSize || 10);
    setViewName(name);
    setDropdownOpen(false);
    alert(`📥 Loaded view: ${name}`);
  };

  const handleCopyLink = (name) => {
    const view = savedViews.find(v => v.name === name);
    if (!view) return;

    const encoded = encodeViewData(view.data);
    const url = `${window.location.origin}${window.location.pathname}?viewData=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedView(name);
      setTimeout(() => setCopiedView(null), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-wrap w-full relative">
      <input
        className="border rounded px-3 py-2 w-64 shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
        placeholder="Enter view name"
        value={viewName}
        onChange={(e) => setViewName(e.target.value)}
      />

      <button
        onClick={handleSaveView}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow text-sm"
      >
        💾 Save View
      </button>

      {/* Custom dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="border rounded px-3 py-2 shadow-sm bg-white flex items-center gap-1 cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
        >
          📂 Load View
          <svg
            className={`w-4 h-4 ml-1 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <ul
            role="listbox"
            className="absolute z-50 mt-1 max-h-64 w-72 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
          >
            {savedViews.length === 0 && (
              <li className="p-3 text-gray-500 text-sm">No saved views</li>
            )}
            {savedViews.map(view => (
              <li
                key={view.name}
                className="flex items-center justify-between px-3 py-2 hover:bg-indigo-100 cursor-pointer"
              >
                <span
                  className="flex-1 truncate"
                  title={view.name}
                  onClick={() => handleLoadView(view.name)}
                >
                  {view.name}
                </span>

                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink(view.name);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                    title="Copy shareable link"
                  >
                    {copiedView === view.name ? '✅' : '🔗'}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteView(view.name);
                    }}
                    className="text-red-600 hover:text-red-800 text-xs"
                    title="Delete view"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ViewControls;
