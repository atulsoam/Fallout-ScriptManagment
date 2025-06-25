import React, { useEffect, useState } from 'react';
import ScriptSelector from '../Components/ScriptRunner/ScriptSelector';
import RunningScriptList from '../Components/ScriptRunner/RunningScriptList';
import LoadingOverlay from '../Components/LoadingOverlay';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

import {
  getScripts,
  getRunningScripts,
  runScript as apiRunScript,
  terminateScript as apiTerminateScript,
} from '../services/ScriptRunner/ScriptRunnerServices';

const socket = io('http://localhost:5000', { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('✅ Socket connected');
});

function ScriptRunner() {
  const notifySuccess = (msg) => toast.success(msg);
  const notifyError = (msg) => toast.error(msg);
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState('');
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [running, setRunning] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [runningScripts, setRunningScripts] = useState([]);
  const [logs, setLogs] = useState({});

  useEffect(() => {
    socket.on('log_update', (data) => {
      const { exec_id, line } = data;
      const MAX_LOG_LINES = 100;

      setLogs((prev) => {
        const updated = { ...prev };
        if (!updated[exec_id]) updated[exec_id] = [];
        updated[exec_id] = [
          ...updated[exec_id],
          { text: line.text, timestamp: line.timestamp || new Date().toISOString() },
        ];
        if (updated[exec_id].length > MAX_LOG_LINES) {
          updated[exec_id] = updated[exec_id].slice(-MAX_LOG_LINES);
        }
        return updated;
      });
    });

    return () => socket.off('log_update');
  }, []);

  useEffect(() => {
    setLoadingScripts(true);
    getScripts(setGlobalLoading)
      .then((res) => {
        setScripts(res.data);
      })
      .catch(() => notifyError("Failed to load scripts"))
      .finally(() => setLoadingScripts(false));
  }, []);

  const fetchRunningScripts = () => {
    getRunningScripts(setGlobalLoading)
      .then((res) => setRunningScripts(res.data))
      .catch(() => { });
  };

  useEffect(() => {
    fetchRunningScripts();
  }, []);

  const handleRunScript = () => {
    if (!selectedScript) {
      notifyError("Please select a script to run!")
      return;
    }
    setRunning(true);
    setMessage(null);

    apiRunScript(selectedScript)
      .then(() => {
        notifySuccess("Script started successfully.")
        fetchRunningScripts();
      })
      .catch((e) => notifyError(e.message))
      .finally(() => setRunning(false));
  };

  const handleTerminateScript = (scriptId) => {
    setMessage(null);
    apiTerminateScript(scriptId, setGlobalLoading)
      .then(() => {
        notifySuccess("Script terminated successfully.")
        setRunningScripts((prev) => prev.filter((s) => s.id !== scriptId));
      })
      .catch((e) => notifyError(e.message));
  };

  return (
    <div className="relative max-w-7xl mx-auto px-6 py-10 sm:px-8 space-y-10 bg-gray-50 min-h-screen">
      {globalLoading && <LoadingOverlay />}

      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Script Runner</h1>
        <p className="text-sm text-gray-500 mt-1">Run and manage your scripts in real-time.</p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          {/* <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200"> */}
          {/* <h2 className="text-lg font-semibold text-gray-700 mb-4">Select Script</h2> */}
          <ScriptSelector
            scripts={scripts}
            selectedScript={selectedScript}
            setSelectedScript={setSelectedScript}
            onRun={handleRunScript}
            loading={loadingScripts}
            running={running}
          />
          {/* </div> */}
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Running Scripts</h2>
            {runningScripts.length === 0 ? (
              <p className="text-sm text-gray-400">No scripts are currently running.</p>
            ) : (
              <RunningScriptList
                runningScripts={runningScripts}
                logs={logs}
                onTerminate={handleTerminateScript}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScriptRunner;
