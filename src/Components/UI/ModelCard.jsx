import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ModalCard = ({ title, children, onClose, footer }) => {
  return (
    <div className="absolute top-24 right-8 z-50 w-[380px]">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            className="text-gray-500 hover:text-red-500 transition"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-64 overflow-y-auto px-4 py-3">{children}</div>

        {/* Footer */}
        <div className="flex justify-end border-t px-4 py-3 bg-white sticky bottom-0">
          {footer}
        </div>
      </div>
    </div>
  );
};

export default ModalCard;
