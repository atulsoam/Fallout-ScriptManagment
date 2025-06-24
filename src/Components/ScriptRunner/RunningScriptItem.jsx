import React, { useState } from 'react';
import LogViewer from './LogViewer';

function formatDuration(startTime) {
  const diff = Date.now() - new Date(startTime).getTime();
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / 60000) % 60;
  const hours = Math.floor(diff / 3600000);
  return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;
}

export default function RunningScriptItem({ script, logs, onTerminate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border rounded shadow hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-3">
          <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <div>
            <p className="font-semibold text-lg">{script.name}</p>
            <p className="text-sm text-gray-500">
              Started: {new Date(script.startedAt).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">
              Running for: {formatDuration(script.startedAt)} {script.execId}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1 border rounded hover:bg-gray-100 text-gray-600"
            aria-expanded={expanded}
            aria-controls={`logs-${script.execId}`}
          >
            {expanded ? 'Hide Logs' : 'Show Logs'}
          </button>

          <button
            onClick={() => onTerminate(script.execId)}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center space-x-1 disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>Terminate</span>
          </button>
        </div>
      </div>

      {expanded && <LogViewer logs={logs} />}
    </div>
  );
}
