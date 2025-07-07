import React from 'react';
import { FiSave, FiX } from 'react-icons/fi';

const ScriptTabBar = ({ openTabs, activeTabId, setActiveTabId, saveScript, closeTab }) => (
  <div className="flex border-b bg-white shadow-sm select-none">
    {openTabs.map((tab) => (
      <div
        key={tab.id}
        className={`flex items-center h-10 px-4 border-r text-sm cursor-pointer whitespace-nowrap
          ${tab.id === activeTabId
            ? 'bg-blue-100 font-semibold text-blue-700'
            : 'bg-gray-100 text-gray-600'}
          hover:bg-gray-200 transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
        `}
        onClick={() => setActiveTabId(tab.id)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActiveTabId(tab.id);
          }
        }}
        title={tab.name} // Tooltip for full name
      >
        <span className="truncate max-w-[140px] flex items-center gap-2">
          {tab.name}
          {tab.isEdited && <span className="text-red-500 text-lg leading-none">●</span>}
        </span>

        <div className="flex items-center ml-3 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              saveScript(tab.id);
            }}
            className="text-green-500 hover:text-green-700 focus:outline-none"
            title="Save (Ctrl+S)"
            aria-label={`Save ${tab.name}`}
          >
            <FiSave size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            className="text-gray-400 hover:text-red-500 focus:outline-none"
            title="Close"
            aria-label={`Close ${tab.name}`}
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default ScriptTabBar;
