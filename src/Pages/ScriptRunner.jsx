import React, { useEffect, useState, useRef } from 'react';
import { API_BASE } from '../utils/Config';

import Notification from '../Components/ScriptRunner/Notification';
import ScriptSelector from '../Components/ScriptRunner/ScriptSelector';
import RunningScriptList from '../Components/ScriptRunner/RunningScriptList';
import { io } from "socket.io-client";

// Ensure this matches your backend address
const socket = io("http://localhost:5000", {
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("✅ Socket connected");
});

// socket.on("log_update", (data) => {
//   console.log("📥 Log update:", data);
// });


function ScriptRunner() {

  useEffect(() => {
    socket.on("log_update", (data) => {
      // console.log(data)
      const { exec_id, script_name, line } = data;
      // console.log(`[${exec_id}] ${line.text}`);
      // Append line.text to your UI
    });
  }, [])

  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState('');
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }
  const [runningScripts, setRunningScripts] = useState([]);
  const [logs, setLogs] = useState({});
  useEffect(() => {
    socket.on("log_update", (data) => {
      const { exec_id, line } = data;

      const MAX_LOG_LINES = 100;


      setLogs(prev => {
        const updated = { ...prev };
        if (!updated[exec_id]) updated[exec_id] = [];
        updated[exec_id] = [...updated[exec_id], { text: line.text, timestamp: line.timestamp || new Date().toISOString() }];
        // Keep only last MAX_LOG_LINES lines
        if (updated[exec_id].length > MAX_LOG_LINES) {
          updated[exec_id] = updated[exec_id].slice(-MAX_LOG_LINES);
        }
        return updated;
      });


    });

    return () => socket.off("log_update"); // Cleanup
  }, []);


  // Fetch scripts on mount
  useEffect(() => {
    setLoadingScripts(true);
    fetch(`${API_BASE}/scripts`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        setScripts(data);
        // if (data.length > 0) setSelectedScript(data[0].id);
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load scripts' }))
      .finally(() => setLoadingScripts(false));
  }, []);
  const fetchRunningScripts = () => {
    fetch(`${API_BASE}/running-scripts`)
      .then((res) => res.json())
      .then((data) => setRunningScripts(data))
      .catch(() => { });
  };
  // Fetch running scripts periodically
  useEffect(() => {


    fetchRunningScripts();
    // const interval = setInterval(fetchRunningScripts, 5000);
    // return () => clearInterval(interval);
  }, []);





  const runScript = () => {
    console.log(selectedScript);

    if (!selectedScript) {
      setMessage({ type: 'error', text: 'Please select a script.' });
      return;
    }
    setRunning(true);
    setMessage(null);

    fetch(`${API_BASE}/run-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scriptName: selectedScript }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to run script');
        return res.json();
      })
      .then(() => {
        setMessage({ type: 'success', text: 'Script started successfully.' });
        fetchRunningScripts()
      })
      .catch((e) => setMessage({ type: 'error', text: e.message }))
      .finally(() => setRunning(false));
  };

  const terminateScript = (scriptId) => {
    setMessage(null);
    fetch(`${API_BASE}/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ execId: scriptId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to terminate script');
        return res.json();
      })
      .then(() => {
        setMessage({ type: 'success', text: 'Script terminated successfully.' });
        setRunningScripts((prev) => prev.filter((s) => s.id !== scriptId));
        // setLogs((prev) => {
        //   const copy = { ...prev };
        //   delete copy[scriptId];
        //   return copy;
        // });

      })
      .catch((e) => setMessage({ type: 'error', text: e.message }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <Notification message={message} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ScriptSelector
            scripts={scripts}
            selectedScript={selectedScript}
            setSelectedScript={setSelectedScript}
            onRun={runScript}
            loading={loadingScripts}
            running={running}
          />
        </div>

        <div className="md:col-span-2">
          <RunningScriptList
            runningScripts={runningScripts}
            logs={logs}
            onTerminate={terminateScript}
          />
        </div>
      </div>
    </div>
  );
}

export default ScriptRunner;
