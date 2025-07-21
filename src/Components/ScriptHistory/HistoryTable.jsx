import React, { useState } from "react";
import { FaFileExport, FaSpinner, FaFileAlt } from "react-icons/fa";
import classNames from "classnames";
import { API_BASE } from "../../utils/Config";
import ScriptDataModal from "./ScriptStatusModal";
import { getScriptDataByType } from "../../services/HistoryDashboard/HistoryServices";
import { toast } from "react-toastify";

const statusStyles = {
  Completed: "bg-green-100 text-green-800",
  Terminated: "bg-red-100 text-red-800",
  Running: "bg-yellow-100 text-yellow-800",
};

const HistoryTable = ({ data = [] }) => {
  const [exportingId, setExportingId] = useState(null);
  const [downloadingLogId, setDownloadingLogId] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCellClick = async (item, type) => {
    try {
      setModalOpen(true);
      setLoading(true);
      const result = await getScriptDataByType(item, type);
      setModalType(type);
      setModalData(result || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setModalOpen(false);
      toast.error("Failed to fetch data. Please try again.");
      setLoading(false);
    }
  };

  const handleExport = async (item) => {
    try {
      setExportingId(item.id);
      const response = await fetch(`${API_BASE}/exportScriptData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionName: item.name,
          scriptId: item.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to export data.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${item.name}_export.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Export failed. Please try again.");
    } finally {
      setExportingId(null);
    }
  };

  const handleDownloadLogs = async (item) => {
    try {
      setDownloadingLogId(item.id);
      const response = await fetch(`${API_BASE}/downloadScriptLogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          execId: item.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to download logs.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${item.name}_logs.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Log download failed:", err);
      toast.error("Failed to download logs. Please try again.");
    } finally {
      setDownloadingLogId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md">
      <table className="min-w-full text-gray-700 text-xs">
        <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
          <tr>
            <th className="px-2 py-4 text-left font-semibold">Script Name</th>
            <th className="px-3 py-2 text-left font-semibold">Status</th>
            <th className="px-2 py-2 text-left font-semibold">Script Type</th>
            <th className="px-2 py-2 text-left font-semibold">Sub Type</th>
            <th className="px-2 py-2 text-left font-semibold">Executed From</th>
            <th className="px-3 py-2 text-left font-semibold">User</th>
            <th className="px-3 py-2 text-left font-semibold">Start Time</th>
            <th className="px-3 py-2 text-left font-semibold">End Time</th>
            <th className="px-2 py-2 text-right font-semibold">Fixed</th>
            <th className="px-2 py-2 text-right font-semibold">Not Fixed</th>
            <th className="px-2 py-2 text-right font-semibold">Total</th>
            <th className="px-2 py-2 text-right font-semibold">Processed</th>
            {/* <th className="px-3 py-2 text-right font-semibold">Duration (s)</th> */}
            <th className="px-3 py-2 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan="14"
                className="text-center py-6 text-gray-400 italic"
              >
                No data found.
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr
                key={item.id || idx}
                className={classNames(
                  "hover:bg-blue-50 transition-colors border-b border-gray-100",
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                )}
              >
                <td
                  className="px-3 py-2 font-medium whitespace-nowrap max-w-[140px] truncate"
                  title={item.name}
                >
                  {item.name}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={classNames(
                      "px-2 py-0.5 rounded-full text-[8px] font-semibold",
                      statusStyles[item.status] || "bg-gray-200 text-gray-700"
                    )}
                    title={
                      item.status === "Terminated"
                        ? item.ScriptError
                        : item.status
                    }
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">{item.type}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {item.subType || "-"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {item.executedFrom || "-"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {item.user || "-"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {item.startTime}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{item.endTime}</td>

                <td
                  className="px-2 py-2 text-right text-blue-600 hover:underline cursor-pointer font-semibold"
                  onClick={() => handleCellClick(item, "Fixed")}
                  title="View Fixed details"
                >
                  {item.fixed}
                </td>
                <td
                  className="px-2 py-2 text-right text-blue-600 hover:underline cursor-pointer font-semibold"
                  onClick={() => handleCellClick(item, "Not Fixed")}
                  title="View Not Fixed details"
                >
                  {item.notFixed}
                </td>
                <td
                  className="px-2 py-2 text-right text-blue-600 hover:underline cursor-pointer font-semibold"
                  onClick={() => handleCellClick(item, "All")}
                  title="View All details"
                >
                  {item.total}
                </td>
                <td className="px-2 py-2 text-right">{item.processed}</td>
                {/* <td className="px-3 py-2 text-right">{item.duration?.toFixed(2)}</td> */}

                <td className="px-3 py-2 text-center space-x-2">
                  <button
                    title="Export to Excel"
                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    disabled={exportingId === item.id}
                    onClick={() => handleExport(item)}
                    aria-label={`Export ${item.name} data`}
                  >
                    {exportingId === item.id ? (
                      <FaSpinner className="animate-spin w-3 h-3" />
                    ) : (
                      <FaFileExport className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    title="Download Logs"
                    className="text-gray-700 hover:text-black disabled:opacity-50"
                    disabled={downloadingLogId === item.id}
                    onClick={() => handleDownloadLogs(item)}
                    aria-label={`Download logs for ${item.name}`}
                  >
                    {downloadingLogId === item.id ? (
                      <FaSpinner className="animate-spin w-3 h-3" />
                    ) : (
                      <FaFileAlt className="w-3 h-3" />
                    )}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>

        {data.length > 0 && (
          <tfoot className="bg-gray-100 font-semibold text-xs border-t border-gray-300">
            <tr>
              <td colSpan="8" className="px-3 py-2 text-right">
                Total
              </td>
              <td className="px-2 py-4 text-right">
                {data.reduce((acc, cur) => acc + (cur.fixed || 0), 0)}
              </td>
              <td className="px-2 py-2 text-right">
                {data.reduce((acc, cur) => acc + (cur.notFixed || 0), 0)}
              </td>
              <td className="px-2 py-2 text-right">
                {data.reduce((acc, cur) => acc + (cur.total || 0), 0)}
              </td>
              <td className="px-2 py-2 text-right">
                {data.reduce((acc, cur) => acc + (cur.processed || 0), 0)}
              </td>
              {/* <td className="px-3 py-2 text-right">{data.reduce((acc, cur) => acc + (cur.duration || 0), 0).toFixed(2)}</td> */}
              <td className="px-3 py-2"></td>
            </tr>
          </tfoot>
        )}
      </table>

      <ScriptDataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
        type={modalType}
        loading={loading}
      />
    </div>
  );
};

export default HistoryTable;
