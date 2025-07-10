import { useEffect, useRef } from 'react';

const Console = ({ logs, activeExecId }) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const activeLogs = logs[activeExecId] || [];

  useEffect(() => {
    if (containerRef.current && bottomRef.current) {
      containerRef.current.scrollTo({
        top: bottomRef.current.offsetTop,
        behavior: 'smooth',
      });
    }
  }, [activeLogs]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-[#0D1117] text-[#D1D5DB]  rounded-md shadow-inner overflow-y-auto font-mono text-xs space-y-2"
    >
      {activeLogs.length > 0 ? (
        activeLogs.map((entry, idx) => (
          <div
            key={idx}
            className={`relative group flex items-start gap-4 px-4 py-3 rounded-lg shadow-sm border-l-4 transition-all duration-200 ${entry.stream_name === 'stderr'
              ? 'border-red-500 bg-[#1A1A1D] text-red-400'
              : 'border-green-500 bg-[#161B22] text-[#E6EDF3]'
              }`}
          >
            <span className="absolute left-2 top-2 text-[8px] text-[#8B949E] opacity-60 group-hover:opacity-100 transition-opacity duration-150">
              {formatTimestamp(entry.timestamp)}
            </span>
            <pre className="whitespace-pre-wrap break-words text-[10px] leading-snug pl-20 w-full">
              {formatLog(entry.text)}
            </pre>
          </div>
        ))
      ) : (
        <div className="text-gray-500 italic">Waiting for logs...</div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

const formatTimestamp = (rawTs) => {
  try {
    const ts = new Date(rawTs.replace(' ', 'T'));
    return ts.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return rawTs;
  }
};

const formatLog = (text) => {
  try {
    const parsed =
      typeof text === 'string' ? JSON.parse(text.replace(/'/g, '"')) : text;
    return typeof parsed === 'object'
      ? JSON.stringify(parsed, null, 2)
      : String(parsed);
  } catch {
    return text;
  }
};

export default Console;
