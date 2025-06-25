import React from "react";
import JobItem from "./JobItem";
import { FaClipboardList, FaInbox } from "react-icons/fa";

const JobList = ({ jobs, onDelete }) => {
  return (
    <div className="bg-[#F9FAFB] p-6 rounded-xl shadow-lg mt-10 transition-all flex flex-col max-h-[600px]">
      <div className="flex items-center gap-3 mb-4">
        <FaClipboardList className="text-[#9CA3AF] text-2xl" />
        <h2 className="text-2xl font-semibold text-[#1F2937]">Scheduled Jobs</h2>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-500 py-12 flex-grow">
          <FaInbox className="text-4xl mb-3 text-gray-400" />
          <p className="text-lg">No jobs scheduled yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 transition-all" style={{ maxHeight: '480px' }}>
          {jobs.map((job) => (
            <JobItem key={job.job_id} job={job} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobList;
