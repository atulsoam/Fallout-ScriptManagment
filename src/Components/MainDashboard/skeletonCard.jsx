// Components/MainDashboard/SkeletonCard.jsx
import React from "react";

const SkeletonCard = ({ height = "h-40" }) => (
  <div className={`bg-white p-4 rounded shadow animate-pulse ${height}`}>
    <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
  </div>
);

export default SkeletonCard;
