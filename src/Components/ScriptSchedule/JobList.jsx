import React, { useState, useMemo } from "react";
import JobItem from "./JobItem";
import { FaClipboardList, FaInbox, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";

const JobList = ({ jobs, onDelete }) => {
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // Filter jobs by status
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) =>
      filterStatus === "All" ? true : job.status === filterStatus
    );
  }, [jobs, filterStatus]);

  // Sort jobs based on sortField and sortDir
  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date || bValue instanceof Date || sortField.includes("At") || sortField.includes("Run")) {
        comparison = new Date(aValue || 0) - new Date(bValue || 0);
      } else {
        comparison = aValue - bValue;
      }

      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [filteredJobs, sortField, sortDir]);

  return (
    <div className="bg-[#F9FAFB] p-6 rounded-xl shadow-lg mt-10 transition-all flex flex-col max-h-[600px]">
      <div className="flex items-center gap-3 mb-4">
        <FaClipboardList className="text-[#9CA3AF] text-2xl" />
        <h2 className="text-2xl font-semibold text-[#1F2937]">Scheduled Jobs</h2>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <div className="flex gap-2">
          <span className="font-medium">Filter:</span>
          {["All", "Approved", "Rejected", "Pending"].map((status) => (
            <button
              key={status}
              className={`px-3 py-1 text-sm rounded ${
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
          <label className="text-sm font-medium">Sort by:</label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="border text-sm rounded px-2 py-1"
          >
            <option value="createdAt">Created At</option>
            <option value="scriptName">Script Name</option>
            <option value="nextRun">Next Run</option>
            <option value="lastRun">Last Run</option>
          </select>
          <button
            onClick={() => setSortDir(dir => (dir === "asc" ? "desc" : "asc"))}
            title={`Sort ${sortDir === "asc" ? "Descending" : "Ascending"}`}
            className="p-2 border rounded text-gray-600 hover:text-black"
          >
            {sortDir === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </button>
        </div>
      </div>

      {/* Job list */}
      {sortedJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-500 py-12 flex-grow">
          <FaInbox className="text-4xl mb-3 text-gray-400" />
          <p className="text-lg">No jobs match the current filters.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 transition-all" style={{ maxHeight: "480px" }}>
          {sortedJobs.map((job) => (
            <li key={job.job_id} title={job.status === "Rejected" ? job.rejectedReason : ""}>
              <JobItem job={job} onDelete={onDelete} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobList;
