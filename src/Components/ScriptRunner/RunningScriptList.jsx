import React from 'react';
import RunningScriptItem from './RunningScriptItem';

export default function RunningScriptList({ runningScripts, logs, onTerminate }) {
  // console.log(runningScripts);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Running Scripts</h2>
      {runningScripts.length === 0 ? (
        <p className="text-gray-500">No scripts are running right now.</p>
      ) : (
        runningScripts.map((script) => (
          <RunningScriptItem
            key={script.execId}
            script={script}
            logs={logs[script.execId] || []}
            onTerminate={onTerminate}
          />
        ))
      )}
    </div>
  );
}
