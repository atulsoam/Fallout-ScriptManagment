import React, { useState, useEffect } from 'react';
import LogViewer from './LogViewer';
import { FaTimesCircle, FaChevronDown, FaChevronUp, FaTerminal } from 'react-icons/fa';

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
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 transition-all overflow-hidden hover:shadow-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b bg-white gap-4">
        {/* Left: Info */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <span className="w-3 h-3 block rounded-full bg-green-500 animate-pulse" />
            <span className="absolute -left-1 -top-1 bg-white text-xs font-semibold text-green-600 px-1 rounded">
              ●
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaTerminal className="text-blue-500" />
              {scriptName}
            </h2>

            <div className="text-sm text-gray-500 space-y-0.5">
              <p>
                <strong className="text-gray-700">Started:</strong>{' '}
                {new Date(script.StartedAt).toLocaleString()}
              </p>
              <p className="text-blue-500 font-medium animate-pulse">
                Running for: {duration}
              </p>
              {script.scriptName && (
                <p className="text-xs italic text-gray-400">
                  Script ref: {script.scriptName}
                </p>
              )}
              <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                Exec ID: {execId}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col md:items-end items-start gap-2">
          <button
            onClick={() => onTerminate(execId)}
            className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md font-medium shadow transition"
          >
            <FaTimesCircle className="w-4 h-4" />
            Terminate
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition font-medium"
          >
            {expanded ? 'Hide Logs' : 'Show Logs'}
            {expanded ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Log Viewer (Expandable) */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expanded ? 'max-h-[500px] p-4 bg-gray-50 border-t' : 'max-h-0'
        }`}
      >
        <LogViewer logs={logs} />
      </div>
    </div>
  );
}
