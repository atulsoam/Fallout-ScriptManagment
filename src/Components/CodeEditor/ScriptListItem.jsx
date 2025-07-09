import React from 'react';
import { FiFileText, FiDownload } from 'react-icons/fi';

const ScriptListItem = ({ script, sidebarOpen, openTab, downloadScript }) => (
  <div className="flex items-center justify-between group hover:bg-gray-100 p-2 rounded">
    <button
      className="flex items-center text-left flex-grow truncate"
      onClick={() => openTab(script)}
    >
      <FiFileText className="text-blue-500 mr-2" />
      {sidebarOpen && <span className="truncate">{script.name}</span>}
    </button>
    <button
      onClick={() => downloadScript(script)}
      className="text-gray-400 hover:text-blue-500 ml-2"
      title="Download"
    >
      <FiDownload size={16} />
    </button>
  </div>
);

export default ScriptListItem;
