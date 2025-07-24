import React, { useEffect, useRef, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';

export default function LogViewer({ logs }) {
  const logRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (!logRef.current) return;
    const isAtBottom =
      logRef.current.scrollHeight - logRef.current.scrollTop ===
      logRef.current.clientHeight;
    setAutoScroll(isAtBottom);
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString(undefined, { hour12: false });

  const isError = (line = '') =>
    /error|exception|traceback|fail/i.test(line);

  return (
    <div className="relative bg-[#0f0f0f] text-green-300 font-mono text-sm rounded-md overflow-hidden border border-gray-800">
      <div
        ref={logRef}
        onScroll={handleScroll}
        className="h-60 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
      >
        {logs.length > 0 ? (
          logs.map(({ text, timestamp }, i) => (
            <div
              key={i}
              className={`leading-snug break-words ${
                isError(text) ? 'text-red-400' : ''
              }`}
            >
              <span className="text-gray-500 pr-2">
                [{formatTime(timestamp)}]
              </span>
              {text}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">Waiting for logs...</p>
        )}
      </div>

      {/* Optional: Clear logs button */}
      {/* <button
        onClick={() => console.clear()}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition text-xs flex items-center gap-1"
        title="Clear console"
      >
        <FaTrashAlt className="w-3 h-3" />
        Clear
      </button> */}
    </div>
  );
}
