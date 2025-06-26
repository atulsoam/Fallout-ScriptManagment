import React, { useState } from "react";
import { FaUser, FaCalendarAlt, FaCode, FaCogs } from "react-icons/fa";

import ViewCodeModal from "./ViewCodeModal";
import EditMetadataModal from "./EditMetadataModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

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

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md p-5 transition duration-300 w-full flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-semibold text-blue-700 truncate">{script.name}</h3>

        {/* Uploaded by & date */}
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
          <p className="flex items-center gap-1 whitespace-nowrap">
            <FaUser className="text-gray-400" />
            {script.uploadedBy}
          </p>
          <p className="flex items-center gap-1 whitespace-nowrap">
            <FaCalendarAlt className="text-gray-400" />
            {new Date(script.uploadedAt).toLocaleString()}
          </p>
        </div>

        {/* Description */}
        <p className="mt-3 text-gray-700 text-sm line-clamp-3">
          {script.description || "No description provided."}
        </p>

        {/* Script type and subtype */}
        <div className="flex flex-wrap justify-between items-center mt-4 gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <FaCode className="text-gray-400" />
            {script.scriptType || "N/A"}
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <FaCogs className="text-gray-400" />
            {script.scriptSubType || "N/A"}
          </span>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => setViewModalOpen(true)}
            className="flex-1 min-w-[80px] px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            View Code
          </button>
          <button
            onClick={() => setEditModalOpen(true)}
            className="flex-1 min-w-[80px] px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex-1 min-w-[80px] px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>

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
