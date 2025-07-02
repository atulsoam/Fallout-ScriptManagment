import React from "react";

const Modal = ({ onClose, title, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6"
    style={{ WebkitBackdropFilter: "blur(10px)" }}
  >
    <div
      className="bg-white bg-opacity-95 rounded-xl shadow-2xl w-auto h-auto max-w-[95vw] max-h-[90vh] overflow-auto p-8 relative"
    >
      {/* Title */}
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">{title}</h3>

      {/* Content */}
      {children}

      {/* Close Button */}
      <button
        onClick={onClose}
        aria-label="Close modal"
        className="absolute top-4 right-5 text-gray-600 hover:text-gray-900 text-2xl font-bold transition"
      >
        ×
      </button>
    </div>
  </div>
);

export default Modal;
