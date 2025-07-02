import React from "react";

const RejectionReasonsCard = ({ reasons }) => {
  if (!reasons) return null;

  return (
    <div className="bg-white shadow rounded p-6">
      <h3 className="text-lg font-semibold mb-4">Common Rejection Reasons</h3>
      <ul className="space-y-2 text-sm text-gray-700">
        {Object.entries(reasons).map(([reason, count], idx) => (
          <li
            key={idx}
            className="group relative cursor-help border-b pb-1 border-dashed border-gray-300"
          >
            <span className="font-medium text-gray-800">{count}x</span>{" "}
            <span className="ml-2 truncate">{reason.slice(0, 40)}...</span>
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 z-10 w-72">
              {reason}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RejectionReasonsCard;
