import React from "react";
import RunningScriptItem from "./RunningScriptItem";
import { FaRobot, FaPlayCircle } from "react-icons/fa";

export default function RunningScriptList({ runningScripts, logs, onTerminate, onRunNew }) {
  const isEmpty = runningScripts.length === 0;

  return (
    <div
      className={`w-full rounded-xl border border-gray-300 shadow-lg px-8 py-10 transition bg-gradient-to-br from-gray-100 to-white ${
        isEmpty ? "flex flex-col items-center justify-center text-center min-h-[320px]" : ""
      }`}
    >
      {isEmpty ? (
        <>
          <FaRobot className="text-blue-500 w-24 h-24 mb-6 animate-bounce-smooth" />
          <h3 className="text-3xl font-semibold text-gray-700 mb-3">
            Nothing's Running!
          </h3>
          <p className="text-gray-500 max-w-md mb-8 text-lg">
            No active scripts at the moment. Hit the button below to get started running one!
          </p>
          {onRunNew ? (
            <>
              <button
                onClick={onRunNew}
                className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105 shadow-md hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                <FaPlayCircle className="w-6 h-6" />
                Run a Script
              </button>
              <p className="mt-4 text-sm text-gray-400 italic">
                Tip: You can select scripts from the sidebar.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">
              Select a script from the list to start running.
            </p>
          )}
        </>
      ) : (
        <div className="space-y-6 w-full max-w-5xl mx-auto">
          {runningScripts.map((script) => (
            <RunningScriptItem
              key={script.execId}
              script={script}
              logs={logs[script.execId] || []}
              onTerminate={onTerminate}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .animate-bounce-smooth {
          animation: bounceSmooth 2.5s infinite;
        }
        @keyframes bounceSmooth {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15%);
          }
        }
      `}</style>
    </div>
  );
}
