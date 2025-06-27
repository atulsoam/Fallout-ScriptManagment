import React, { useState } from "react";
import {
    FaClock,
    FaExclamationCircle,
    FaTrashAlt,
    FaFileCode,
    FaUserCircle,
    FaPlayCircle,
    FaHistory,
} from "react-icons/fa";
import { formatDistanceToNow, format } from "date-fns";
import { toggleJobStatus } from "../../services/ScriptScheduler/schedulerService";

const JobItem = ({ job, onDelete }) => {
    const [isEnabled, setIsEnabled] = useState(job.enabled);
    const [toggling, setToggling] = useState(false);

    const {
        job_id,
        scriptName,
        Cuid,
        time,
        daysOfWeek,
        lastRun,
        nextRun,
        lastDuration,
        runCount,
        metadata,
    } = job;

    const priorityColor = {
        high: "bg-red-100 text-red-700",
        normal: "bg-yellow-100 text-yellow-700",
        low: "bg-green-100 text-green-700",
    };

    const formatTime = (t) => t?.slice(0, 5);
    const formatDate = (d) =>
        d ? format(new Date(d), "yyyy-MM-dd HH:mm") : "—";
    const relativeTime = (d) =>
        d ? `${formatDistanceToNow(new Date(d), { addSuffix: true })}` : "—";

    const handleToggle = async () => {
        setToggling(true);
        try {
            await toggleJobStatus(job_id, !isEnabled);
            setIsEnabled((prev) => !prev);
        } catch (err) {
            console.error("Failed to toggle job", err);
        } finally {
            setToggling(false);
        }
    };

    return (
        <li className="p-4 mb-4 rounded-lg bg-[#FFFFFF] shadow hover:shadow-md transition">
            <div className="flex justify-between items-start flex-wrap gap-4">
                {/* Script Info */}
                <div className="flex-1 min-w-[250px]">
                    <div className="flex items-center gap-2 mb-1">
                        <FaFileCode className="text-blue-600" />
                        <h3 className="font-semibold text-lg text-gray-800 truncate">
                            {scriptName}
                        </h3>
                        <span
                            className={`ml-2 text-xs font-medium px-2 py-0.5 rounded ${isEnabled
                                ? "text-green-700 bg-green-100"
                                : "text-gray-500 bg-gray-100"
                                }`}
                        >
                            {isEnabled ? "Enabled" : "Disabled"}
                        </span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <FaUserCircle className="text-gray-400" />
                        <span>Scheduled by: {Cuid}</span>
                    </div>
                    {/* Approval Status */}
                    {/* Approval Status with Rejected Reason */}
                    {job.status && (
                        <div className="mt-2">
                            <span
                                className={`inline-block text-xs font-semibold px-2 py-1 rounded-full transition-all
                ${job.status === "Approved"
                                        ? "bg-green-100 text-green-700"
                                        : job.status === "Pending"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : job.status === "Rejected"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-gray-100 text-gray-600"
                                    }`}
                            >
                                {job.status}
                            </span>

                            {/* Show rejected reason if status is Rejected */}
                            {job.status === "Rejected" && job.rejectedReason && (
                                <div className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
                                    <strong>Reason:</strong> {job.rejectedReason}
                                </div>
                            )}
                        </div>
                    )}


                </div>

                {/* Schedule Info */}
                <div className="min-w-[180px]">
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <FaClock className="text-gray-500" />
                        <span>
                            {daysOfWeek?.length ? daysOfWeek.join(", ") : "*"} @{" "}
                            {formatTime(time)}
                        </span>
                    </div>
                    <div className="text-sm flex items-center gap-2">
                        <FaExclamationCircle className="text-gray-500" />
                        <span
                            className={`text-xs px-2 py-0.5 rounded ${priorityColor[metadata?.priority || "normal"]
                                }`}
                        >
                            {metadata?.priority || "normal"} priority
                        </span>
                    </div>
                </div>

                {/* Run Info */}
                <div className="min-w-[220px] text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                        <FaHistory className="text-gray-500" />
                        <span>Last run: {relativeTime(lastRun)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaPlayCircle className="text-gray-500" />
                        <span>Next run: {formatDate(nextRun)}</span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500">
                            Ran {runCount}x • Last duration: {(lastDuration * 1000).toFixed(0)}ms
                        </span>
                    </div>
                </div>

                {/* Actions: Toggle + Delete */}
                <div className="flex flex-col items-end gap-2">
                    {/* Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={isEnabled}
                                disabled={toggling}
                                onChange={handleToggle}
                                className="sr-only"
                            />
                            <div className={`block w-12 h-6 rounded-full transition ${isEnabled ? "bg-green-500" : "bg-gray-400"
                                }`}></div>
                            <div
                                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${isEnabled ? "translate-x-6" : ""
                                    }`}
                            ></div>
                        </div>
                        <span className="text-sm text-gray-700">
                            {isEnabled ? "Enabled" : "Disabled"}
                        </span>
                    </label>

                    {/* Delete */}
                    <button
                        onClick={() => onDelete(job_id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-full transition"
                        title="Unschedule Job"
                    >
                        <FaTrashAlt />
                    </button>
                </div>
            </div>
        </li>
    );
};

export default JobItem;
