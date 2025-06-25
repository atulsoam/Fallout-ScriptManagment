import React from 'react';

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex items-center justify-center transition-opacity duration-300">
      <div className="bg-white/80 dark:bg-gray-800/80 px-6 py-4 rounded-xl shadow-lg flex items-center space-x-4 animate-fade-in">
        <svg
          className="w-6 h-6 animate-spin text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-gray-800 dark:text-gray-200 font-medium tracking-wide">
          Loading, please wait...
        </span>
      </div>
    </div>
  );
}
