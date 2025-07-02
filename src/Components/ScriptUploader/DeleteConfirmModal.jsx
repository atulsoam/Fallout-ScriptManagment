import React from "react";
import Modal from "./Modal";

const DeleteConfirmModal = ({ scriptName, onClose, onConfirm }) => (
  <Modal onClose={onClose} title="Confirm Delete">
    <p>
      Are you sure you want to delete the script{" "}
      <strong>{scriptName}</strong>?
    </p>
    <div className="mt-6 flex justify-end gap-3">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Delete
      </button>
    </div>
  </Modal>
);

export default DeleteConfirmModal;
