
import { useState } from "react";
import EditMetadataModal from "../../Components/ScriptUploader/EditMetadataModal"
import ViewCodeModal from "../../Components/ScriptUploader/ViewCodeModal"
import DeleteConfirmModal from "../../Components/ScriptUploader/DeleteConfirmModal"

import {
  FaUser,
  FaCalendarAlt,
  FaCode,
  FaCogs,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaToggleOn,
  FaToggleOff,
  FaInfoCircle
} from "react-icons/fa";
// 
import { Tooltip } from "react-tooltip"; // Optional if you want tooltips

const getStatusBadge = (status, rejectionReason) => {
  switch (status) {
    case "Approved":
      return {
        label: "Approved",
        icon: FaCheckCircle,
        color: "text-green-700",
        bg: "bg-green-100"
      };
    case "Rejected":
      return {
        label: "Rejected",
        icon: FaTimesCircle,
        color: "text-red-700",
        bg: "bg-red-100",
        tooltip: rejectionReason && rejectionReason !== "NA" ? rejectionReason : "Rejected by approver"
      };
    case "Pending":
    default:
      return {
        label: "Pending",
        icon: FaHourglassHalf,
        color: "text-yellow-700",
        bg: "bg-yellow-100"
      };
  }
};

const ScriptCard = ({ script, onUpdate, onDelete }) => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleUpdate = (updatedData) => {
    onUpdate(script.id, updatedData);
    setEditModalOpen(false);
  };

  const handleDelete = () => {
    onDelete(script.id);
    setDeleteModalOpen(false);
  };

  const status = getStatusBadge(script.status, script.rejectionReason);
  const enabled = script.isEnabled
    ? { label: "Enabled", icon: FaToggleOn, color: "text-blue-600", bg: "bg-blue-100" }
    : { label: "Disabled", icon: FaToggleOff, color: "text-gray-500", bg: "bg-gray-100" };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 flex flex-col gap-4">

        {/* Title + Status Badge */}
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-blue-800 truncate">{script.name}</h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.color}`}>
            <status.icon className="mr-1" />
            {status.label}

            {status.tooltip && (
              <>
                <span
                  data-tooltip-id={`tooltip-${script.id}`}
                  className="ml-2 text-xs text-gray-600 cursor-help"
                >
                  <FaInfoCircle />
                </span>

                <Tooltip
                  id={`tooltip-${script.id}`}
                  place="top"
                  effect="solid"
                  className="z-50 !text-sm !bg-gray-800 !text-white !max-w-xs whitespace-pre-line"
                >
                  {status.tooltip}
                </Tooltip>
              </>
            )}




          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap text-sm text-gray-600 gap-4">
          <span className="flex items-center gap-1">
            <FaUser />
            Uploaded by: {script.uploadedBy}
          </span>
          <span className="flex items-center gap-1">
            <FaCalendarAlt />
            {new Date(script.uploadedAt).toLocaleString()}
          </span>
          {script.approver && (
            <span className="flex items-center gap-1 text-purple-600 font-medium">
              👨‍⚖️ Approver: {script.approver}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm line-clamp-3">
          {script.description || <em className="text-gray-400">No description provided.</em>}
        </p>

        {/* Script Type, Subtype, Enabled */}
        <div className="flex flex-wrap gap-3 mt-2 text-sm">
          <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            <FaCode />
            {script.scriptType || "N/A"}
          </span>
          <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
            <FaCogs />
            {script.scriptSubType || "N/A"}
          </span>
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${enabled.bg} ${enabled.color}`}>
            <enabled.icon />
            {enabled.label}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => setViewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
          >
            <FaEye />
            View Code
          </button>
          <button
            onClick={() => setEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded hover:bg-gray-200 transition"
          >
            <FaEdit />
            Edit
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition"
          >
            <FaTrash />
            Delete
          </button>
        </div>
      </div>

      {/* Modals */}
      {viewModalOpen && (
        <ViewCodeModal
          scriptName={script.name}
          code={script.code}
          onClose={() => setViewModalOpen(false)}
        />
      )}
      {editModalOpen && (
        <EditMetadataModal
          script={script}
          onClose={() => setEditModalOpen(false)}
          onSave={handleUpdate}
        />
      )}
      {deleteModalOpen && (
        <DeleteConfirmModal
          scriptName={script.name}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

export default ScriptCard;
