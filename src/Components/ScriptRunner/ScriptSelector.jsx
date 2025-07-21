import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FaPlay,
  FaSpinner,
  FaCode,
  FaInfoCircle,
  FaSearch,
  FaChevronDown,
} from 'react-icons/fa';

export default function ScriptSelector({
  scripts,
  selectedScript,
  setSelectedScript,
  onRun,
  loading,
  running,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filteredScripts = useMemo(() => {
    if (!searchTerm) return scripts;
    return scripts.filter((script) =>
      script.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [scripts, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition hover:shadow-xl">
      {/* Header with info button */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <FaCode className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-700">Select a Script</h2>
        </div>
        <a
          href="/ScriptStructure"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 transition text-sm flex items-center gap-1"
          title="View predefined script structure"
        >
          <FaInfoCircle />
          <span className="hidden sm:inline">Info</span>
        </a>
      </div>

      {/* Custom Dropdown with search */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className={`w-full border px-4 py-3 text-base rounded-lg text-left flex justify-between items-center
            focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
              loading || scripts.length === 0 ? 'cursor-not-allowed bg-gray-100' : ''
            }`}
          onClick={() => !loading && scripts.length && setOpen((prev) => !prev)}
          disabled={loading || scripts.length === 0}
        >
          <span className="truncate">
            {selectedScript || (loading ? 'Loading scripts...' : 'Select a script')}
          </span>
          <FaChevronDown className="ml-2 text-gray-400" />
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            <div className="relative p-2 border-b">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            {filteredScripts.length > 0 ? (
              filteredScripts.map((script) => (
                <button
                  key={script}
                  onClick={() => {
                    setSelectedScript(script);
                    setOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
                    selectedScript === script ? 'bg-blue-100 text-blue-700' : ''
                  }`}
                >
                  {script}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-400">No results</div>
            )}
          </div>
        )}
      </div>

      {/* Run button */}
      <button
        className={`w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-base font-medium
          flex justify-center items-center gap-3
          hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300
          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
        disabled={running || loading || !selectedScript}
        onClick={onRun}
        aria-busy={running}
        aria-disabled={running || loading || !selectedScript}
      >
        {running ? (
          <>
            <FaSpinner className="animate-spin h-5 w-5" />
            <span>Running...</span>
          </>
        ) : (
          <>
            <FaPlay className="h-5 w-5" />
            <span>Run Script</span>
          </>
        )}
      </button>

      {/* Helper text */}
      <p className="text-sm text-gray-400 text-center">
        Filter and select a script to run. Need help? Click "Info".
      </p>
    </div>
  );
}
