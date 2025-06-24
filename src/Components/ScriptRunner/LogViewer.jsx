import React, { useEffect, useRef } from 'react';

export default function LogViewer({ logs }) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={logRef}
      className="bg-black text-green-400 font-mono p-4 h-48 overflow-y-auto whitespace-pre-wrap text-sm rounded-b"
    >
      {logs.length > 0 ? (
        logs.map(({ text, timestamp }, i) => (
          <div key={i} className="leading-tight">
            <span className="text-gray-500 mr-2">
              [{new Date(timestamp).toLocaleTimeString()}]
            </span>
            {text}
          </div>
        ))
      ) : (
        <p className="text-gray-500 italic">Waiting for logs...</p>
      )}
    </div>
  );
}
