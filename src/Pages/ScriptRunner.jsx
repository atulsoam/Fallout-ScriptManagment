import React, { useEffect, useState } from "react";
import ScriptSelector from "../Components/ScriptRunner/ScriptSelector";
import RunningScriptList from "../Components/ScriptRunner/RunningScriptList";
import LoadingOverlay from "../Components/LoadingOverlay";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { API_BASE } from "../utils/Config";
import {
  getScripts,
  getRunningScripts,
  runScript as apiRunScript,
  terminateScript as apiTerminateScript,
} from "../services/ScriptRunner/ScriptRunnerServices";

// Icons
import { FaRocket, FaTerminal, FaSyncAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export const socket = io(API_BASE, { transports: ["websocket"] });

socket.on("connect", () => {
  console.log("✅ Socket connected");
});

function ScriptRunner() {
  const notifySuccess = (msg) => toast.success(msg);
  const notifyError = (msg) => toast.error(msg);

  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState("");
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [running, setRunning] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [runningScripts, setRunningScripts] = useState([]);
  const [logs, setLogs] = useState({});

  useEffect(() => {
    socket.on("log_update", ({ exec_id, line }) => {
      const MAX_LOG_LINES = 100;
      setLogs((prev) => {
        const updated = { ...prev };
        if (!updated[exec_id]) updated[exec_id] = [];
        updated[exec_id].push({
          text: line.text,
          timestamp: line.timestamp || new Date().toISOString(),
        });
        if (updated[exec_id].length > MAX_LOG_LINES) {
          updated[exec_id] = updated[exec_id].slice(-MAX_LOG_LINES);
        }
        return updated;
      });
    });

    socket.on("runningJobs", (data) => {
      if (data) setRunningScripts(data);
    });

    socket.on("ScriptCompletion", ({ exec_id, script_name, duration }) => {
      setRunningScripts((prev) => prev.filter((s) => s.execId !== exec_id));
      notifySuccess(
        <>
          <FaCheckCircle className="inline mr-2 text-green-500" />
          Script <strong>{script_name}</strong> completed in {duration}s
        </>
      );
    });

    return () => {
      socket.off("log_update");
      socket.off("runningJobs");
      socket.off("ScriptCompletion");
    };
  }, []);

  useEffect(() => {
    setLoadingScripts(true);
    getScripts(setGlobalLoading)
      .then((res) => {
        const names = res.data.map((script) => script.name);
        setScripts(names);
      })
      .catch(() =>
        notifyError(
          <>
            <FaExclamationTriangle className="inline mr-2 text-red-500" />
            Failed to load scripts
          </>
        )
      )
      .finally(() => setLoadingScripts(false));
  }, []);

  const fetchRunningScripts = () => {
    getRunningScripts(setGlobalLoading)
      .then((res) => setRunningScripts(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchRunningScripts();
  }, []);

  const handleRunScript = () => {
    if (!selectedScript) {
      notifyError(
        <>
          <FaExclamationTriangle className="inline mr-2 text-yellow-500" />
          Please select a script to run!
        </>
      );
      return;
    }

    setRunning(true);
    apiRunScript(selectedScript)
      .then(() => {
        notifySuccess("Script started successfully!");
        fetchRunningScripts();
      })
      .catch((e) => notifyError(e.message))
      .finally(() => setRunning(false));
  };

  const handleTerminateScript = (scriptId) => {
    apiTerminateScript(scriptId, setGlobalLoading)
      .then(() => {
        notifySuccess("Script terminated successfully.");
        setRunningScripts((prev) =>
          prev.filter((s) => s.execId !== scriptId)
        );
      })
      .catch((e) => notifyError(e.message));
  };

  return (
    <div className="relative max-w-7xl mx-auto px-6 py-12 sm:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {globalLoading && <LoadingOverlay />}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight flex items-center justify-center gap-2">
          <FaRocket className="text-blue-600" />
          Script Runner
        </h1>
        <p className="text-md text-gray-500 mt-2">
          Run and monitor Python scripts in real-time with logs and control.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
        {/* Script Selector */}
        <div className="md:col-span-1">
          <ScriptSelector
            scripts={scripts}
            selectedScript={selectedScript}
            setSelectedScript={setSelectedScript}
            onRun={handleRunScript}
            loading={loadingScripts}
            running={running}
          />
        </div>

        {/* Running Scripts Panel */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 transition hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                <FaTerminal className="text-gray-600" />
                Running Scripts
              </h2>
              <button
                onClick={fetchRunningScripts}
                className="text-sm text-blue-500 hover:text-blue-700 transition flex items-center gap-1"
              >
                <FaSyncAlt className="text-blue-400" />
                Refresh
              </button>
            </div>

            {/* {runningScripts.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-10">
                No scripts are currently running.
              </p>
            ) : ( */}
              <RunningScriptList
                runningScripts={runningScripts}
                logs={logs}
                onTerminate={handleTerminateScript}
              />
            {/* )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScriptRunner;
