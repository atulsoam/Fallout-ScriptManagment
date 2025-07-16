import React from 'react';
import StatusBadge from './StatusBadge';

const EmailRowDetailsModal = ({ email, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 relative border border-gray-200 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Header */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
          {email.Subject}
        </h2>

        {/* Email Meta Info */}
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
          <div>
            <p><span className="font-medium">From:</span> {email.SenderAddress}</p>
            <p><span className="font-medium">To:</span> {email.ReceiverList.join(', ')}</p>
            <p><span className="font-medium">CC:</span> {email?.CCList?.length > 0 ? email.CCList.join(', ') : 'None'}</p>
          </div>
          <div>
            <p>
              <span className="font-medium">Status:</span>{' '}
              <StatusBadge status={email.Status} />
            </p>
            {email.Error && (
              <p className="text-red-600 mt-1">
                <span className="font-medium">Error:</span> {email.Error}
              </p>
            )}
            <p className="text-gray-500 mt-2 text-xs">
              Sent At: {new Date(email.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Email Body */}
        <div className="border rounded-md p-4 bg-gray-50 max-h-100 overflow-auto text-sm">
          <h4 className="font-semibold text-gray-800 mb-2">Email Body:</h4>
          <div
            className="prose prose-sm max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: email.EmailBody }}
          />
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailRowDetailsModal;
