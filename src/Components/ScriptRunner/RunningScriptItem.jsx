import React, { useState, useEffect } from 'react';
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
  const [duration, setDuration] = useState(formatDuration(script.StartedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(formatDuration(script.StartedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [script.StartedAt]);

  const scriptName = script.script_name || script.name;
  const execId = script.execId;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 transition-all mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start p-6 border-b">
        <div className="flex items-start space-x-4">
          <span className="w-3 h-3 mt-1 rounded-full bg-green-500 animate-pulse" />

          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-800">
              {scriptName}
            </h2>

            <div className="text-sm text-gray-500">
              <p>Started: <span className="font-medium">{new Date(script.StartedAt).toLocaleString()}</span></p>
              <p className="text-gray-400 animate-pulse">Running for: {duration}</p>
              {script.scriptName && (
                <p className="text-xs italic text-gray-500">Script ref: {script.scriptName}</p>
              )}
            </div>

            <div className="mt-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Exec ID: {execId}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end space-y-2">
          

          <button
            onClick={() => onTerminate(execId)}
            className="inline-flex items-center text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded shadow-sm transition"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Terminate
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition"
          >
            {expanded ? 'Hide Logs' : 'Show Logs'}
            <svg
              className={`ml-1 w-4 h-4 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Log Panel */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-[500px] p-4' : 'max-h-0 overflow-hidden'
        } bg-gray-50 border-t`}
        id={`logs-${execId}`}
      >
        <LogViewer logs={logs} />
      </div>
    </div>
  );
}
