import React, { useState, useMemo } from "react";
import ScriptCard from "./ScriptCard";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";

const ScriptList = ({ handleDeleteScript, handleUpdateScript, scripts }) => {
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState("uploadedAt"); // or "name"
  const [sortDir, setSortDir] = useState("desc"); // or "asc"

  const filteredScripts = useMemo(() => {
    return scripts.filter(script =>
      filterStatus === "All" ? true : script.status === filterStatus
    );
  }, [scripts, filterStatus]);

  const sortedScripts = useMemo(() => {
    return [...filteredScripts].sort((a, b) => {
      let compare;
      if (sortField === "uploadedAt") {
        compare = new Date(a.uploadedAt) - new Date(b.uploadedAt);
      } else {
        compare = a.name.localeCompare(b.name);
      }
      return sortDir === "asc" ? compare : -compare;
    });
  }, [filteredScripts, sortField, sortDir]);

  return (
    <div className="w-full">
      {/* Filter & Sort Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="font-medium">Filter by status:</label>
          {["All", "Approved", "Rejected", "Pending"].map(status => (
            <button
              key={status}
              className={`px-3 py-1 rounded border ${
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium">Sort by:</label>
          <select
            className="px-2 py-1 border rounded"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="uploadedAt">Upload Date</option>
            <option value="name">Name</option>
          </select>
          <button
            onClick={() =>
              setSortDir(dir => (dir === "asc" ? "desc" : "asc"))
            }
            className="p-2 border rounded"
            title={`Sort ${sortDir === "asc" ? "Descending" : "Ascending"}`}
          >
            {sortDir === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </button>
        </div>
      </div>

      {/* Script Cards */}
      {sortedScripts.length === 0 ? (
        <p className="text-gray-500">No scripts match the current filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sortedScripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onUpdate={handleUpdateScript}
              onDelete={handleDeleteScript}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ScriptList;
