import React from 'react';

export default function ScriptSelector({ scripts, selectedScript, setSelectedScript, onRun, loading, running }) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Run Script</h1>
      <select
        className="w-full border rounded p-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={selectedScript}
        onChange={(e) => setSelectedScript(e.target.value)}
        disabled={loading}
      >
                  <option>SelectScript</option>

        {loading ? (
          <option>Loading scripts...</option>
        ) : (
          scripts.map((script) => (
            <option key={script} value={script}>
              {script}
            </option>
          ))
        )}
      </select>
      <button
        className="w-full bg-blue-600 text-white p-3 rounded text-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center space-x-2"
        disabled={running || loading}
        onClick={onRun}
      >
        {running && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
