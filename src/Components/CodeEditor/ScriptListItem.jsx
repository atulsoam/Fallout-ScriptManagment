import React from 'react';
import { FiFileText, FiDownload } from 'react-icons/fi';

const ScriptListItem = ({ script, sidebarOpen, openTab, downloadScript }) => (
  <div
    className="flex items-center justify-between group hover:bg-blue-50 transition rounded-md px-2 py-2"
    title={!sidebarOpen ? script.name : ''}
  >
    <button
      onClick={() => openTab(script)}
      className="flex items-center text-left flex-grow truncate text-gray-700 hover:text-blue-600 transition"
    >
      <FiFileText className="text-blue-500 mr-2 shrink-0" size={18} />
      {sidebarOpen && (
        <span className="truncate text-sm font-medium">{script.name}</span>
      )}
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        downloadScript(script);
      }}
      className="text-gray-400 hover:text-blue-500 transition ml-2"
      title="Download Script"
    >
      <FiDownload size={16} />
    </button>
  </div>
);

export default ScriptListItem;
