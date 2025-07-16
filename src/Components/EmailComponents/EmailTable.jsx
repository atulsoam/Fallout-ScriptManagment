import React, { useState } from "react";
import classNames from "classnames";
import EmailRowDetailsModal from "./EmailRowDetailsModal";

const statusStyles = {
  Sent: "bg-green-100 text-green-800",
  Failed: "bg-red-100 text-red-800",
  Pending: "bg-yellow-100 text-yellow-800",
};

const EmailTable = ({ data }) => {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md">
        <table className="min-w-full text-gray-700 text-xs">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Subject</th>
              <th className="px-4 py-3 text-left font-semibold">Receivers</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Created At</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-400 italic"
                >
                  No email records found.
                </td>
              </tr>
            ) : (
              data.map((email, idx) => (
                <tr
                  key={email._id}
                  className={classNames(
                    "hover:bg-blue-50 transition-colors border-b border-gray-100",
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  )}
                >
                  <td
                    className="px-4 py-3 font-medium text-sm max-w-[200px] truncate"
                    title={email.Subject}
                  >
                    {email.Subject}
                  </td>
                  <td className="px-4 py-3 text-sm max-w-[240px] truncate">
                    {email.ReceiverList.join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={classNames(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                        statusStyles[email.Status] ||
                          "bg-gray-200 text-gray-700"
                      )}
                    >
                      {email.Status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(email.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-blue-600 font-medium hover:underline cursor-pointer">
                    <button onClick={() => setSelected(email)}>View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <EmailRowDetailsModal
          email={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
};

export default EmailTable;
