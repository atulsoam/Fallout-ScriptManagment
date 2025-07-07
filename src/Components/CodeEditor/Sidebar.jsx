import React from 'react';
import { FiMenu, FiChevronLeft, FiLoader } from 'react-icons/fi';
import ScriptListItem from './ScriptListItem';

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  loading,
  filteredScripts,
  openTab,
  downloadScript,
}) => {
  return (
    <aside
      className={`transition-all duration-300 ease-in-out bg-white border-r shadow-lg p-4 flex flex-col ${
        sidebarOpen ? 'w-64' : 'w-14'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          className="text-gray-600 hover:text-blue-600 transition"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {sidebarOpen ? <FiChevronLeft size={18} /> : <FiMenu size={18} />}
        </button>
        {sidebarOpen && <h2 className="text-lg font-semibold">Scripts</h2>}
      </div>

      {sidebarOpen && (
        <input
          type="text"
          placeholder="Search script..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 mb-4 text-sm border rounded focus:outline-none focus:ring w-full"
        />
      )}

      <div className="flex-1 overflow-auto space-y-2">
        {loading ? (
          <div className="text-gray-500 flex items-center gap-2">
            <FiLoader className="animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          filteredScripts.map((script) => (
            <ScriptListItem
              key={script.id}
              script={script}
              sidebarOpen={sidebarOpen}
              openTab={openTab}
              downloadScript={downloadScript}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
