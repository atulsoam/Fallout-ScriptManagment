import React from 'react';

const EmailPreview = ({
  recipientName,
  msg,
  scriptTitle,
  scriptAuthor,
  submissionDate,
  scriptDescription,
  actionRequired,
  infoLink,
  information,
}) => {
  const year = new Date().getFullYear();

  const renderRow = (icon, label, value) =>
    value && (
      <tr>
        <td className="py-1 pr-4 text-sm text-gray-500">
          <span className="mr-1">{icon}</span>
          <strong>{label}</strong>
        </td>
        <td className="py-1 text-sm font-medium text-gray-800">{value}</td>
      </tr>
    );

  const renderButtons = () => {
    if (actionRequired) {
      return (
        <div className="flex gap-4 justify-center mt-4">
          <a
            href={infoLink}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            Approve
          </a>
          <a
            href={infoLink}
            className="bg-purple-400 text-white px-4 py-2 rounded-md text-sm font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            Reject
          </a>
        </div>
      );
    }

    return (
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">{information || 'View Details'}</p>
        <a
          href={infoLink}
          className="inline-block mt-2 bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-semibold"
          target="_blank"
          rel="noopener noreferrer"
        >
          🔍 View Details
        </a>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden">
      <div className="bg-indigo-600 text-white text-center py-4 text-lg font-semibold">
        Script Management System
      </div>

      <div className="px-6 py-5">
        <p className="text-base text-gray-800 mb-2">Hello {recipientName || '[Recipient Name]'},</p>

        <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">
          {msg || 'Your message will appear here.'}
        </p>

        {(scriptTitle || scriptAuthor || submissionDate || scriptDescription) && (
          <table className="w-full mb-4">
            <tbody>
              {renderRow("📘", "Title:", scriptTitle)}
              {renderRow("👤", "Author:", scriptAuthor)}
              {renderRow("📅", "Submitted:", submissionDate)}
              {scriptDescription && (
                <tr>
                  <td colSpan="2" className="pt-2 text-sm italic text-gray-600">
                    {scriptDescription}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {infoLink && renderButtons()}

        <div className="mt-6 text-center text-sm text-gray-500">
          Respectfully,<br />The Script Management Team
        </div>
      </div>

      <div className="bg-gray-100 border-t text-center text-xs text-gray-400 py-3">
        &copy; {year} Script Management System · All rights reserved.
      </div>
    </div>
  );
};

export default EmailPreview;
