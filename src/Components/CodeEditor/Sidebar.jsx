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
      className={`transition-all duration-300 ease-in-out bg-white border-r border-gray-200 shadow-md
        flex flex-col h-full ${
          sidebarOpen ? 'w-64 px-4' : 'w-14 px-2'
        } py-4`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          className="text-gray-500 hover:text-blue-600 transition"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {sidebarOpen ? <FiChevronLeft size={20} /> : <FiMenu size={20} />}
        </button>
        {sidebarOpen && (
          <h2 className="text-base font-semibold text-gray-700 tracking-wide">
            Scripts
          </h2>
        )}
      </div>

      {/* Search */}
      {sidebarOpen && (
        <input
          type="text"
          placeholder="Search scripts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 mb-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
        />
      )}

      {/* Script list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {loading ? (
          <div className="text-gray-500 flex items-center gap-2 text-sm pl-1">
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
