import React from 'react';

export default function ScriptSelector({
  scripts,
  selectedScript,
  setSelectedScript,
  onRun,
  loading,
  running,
}) {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <label
        htmlFor="script-select"
        className="block text-lg font-semibold text-gray-700 mb-2"
      >
        Select a Script
      </label>
      <select
        id="script-select"
        className={`w-full border rounded-lg p-3 text-lg transition
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
        value={selectedScript}
        onChange={(e) => setSelectedScript(e.target.value)}
        disabled={loading}
        aria-disabled={loading}
        aria-label="Select script to run"
      >
        <option value="" disabled>
          {loading ? 'Loading scripts...' : 'Select a script'}
        </option>

        {!loading &&
          scripts.map((script) => (
            <option key={script} value={script}>
              {script}
            </option>
          ))}
      </select>

      <button
        className={`w-full bg-blue-600 text-white p-3 rounded-lg text-lg flex justify-center items-center space-x-3
          hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300
          disabled:opacity-50 disabled:cursor-not-allowed transition`}
        disabled={running || loading || !selectedScript}
        onClick={onRun}
        aria-busy={running}
        aria-disabled={running || loading || !selectedScript}
      >
        {running && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        )}
        <span>{running ? 'Running...' : 'Run Script'}</span>
      </button>
    </div>
  );
}
