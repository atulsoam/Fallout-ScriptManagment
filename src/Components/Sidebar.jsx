import React, { useState } from 'react';
import {
  FaBars, FaHome, FaSignOutAlt, FaHistory,
  FaUpload, FaPlay, FaClock, FaUserEdit, FaChevronDown
} from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import colors from '../utils/Colors';
import { logout } from '../services/auth/authServices';

const navItems = [
  { to: '/', label: 'Dashboard', icon: FaHome },
  { to: '/history', label: 'History', icon: FaHistory },
  { to: '/upload', label: 'Upload', icon: FaUpload },
  { to: '/scriptRunner', label: 'Run Script', icon: FaPlay },
  { to: '/SchedulerPage', label: 'Scheduler', icon: FaClock },
  { to: '/logout', label: 'Logout', icon: FaSignOutAlt },
];

const adminSubItems = [
  { to: '/admin', label: 'Admin Dashboard', icon: FaUserEdit },
  { to: '/adminRequests', label: 'Admin Requests', icon: FaClock },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const authToken = JSON.parse(localStorage.getItem('authToken') || '{}');
  const isAdmin = authToken?.isAdmin;
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-30 shadow-lg border-r transition-all duration-300 bg-white`}
      style={{
        width: isOpen ? 256 : 64,
        backgroundColor: colors.surface,
        borderRight: `1px solid ${colors.border}`,
      }}
      role="navigation"
      aria-label="Sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: colors.border }}>
        {isOpen && (
          <span className="text-xl font-semibold text-gray-800" style={{ color: colors.primary }}>
            Lumen
          </span>
        )}
        <button
          onClick={toggleSidebar}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          style={{ color: colors.icon }}
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-grow px-1 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isLogout = label.toLowerCase() === 'logout';

          return isLogout ? (
            <button
              key={label}
              onClick={handleLogout}
              className="group flex items-center gap-4 px-3 py-2 rounded-md transition-all duration-150 cursor-pointer
                text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-violet-600 w-full text-left"
              title={!isOpen ? label : undefined}
            >
              <Icon className="min-w-[20px]" size={20} />
              {isOpen && <span className="whitespace-nowrap">{label}</span>}
            </button>
          ) : (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `group flex items-center gap-4 px-3 py-2 rounded-md transition-all duration-150 
                text-sm font-medium
                ${isActive ? 'bg-violet-500 text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-violet-600'}`
              }
              title={!isOpen ? label : undefined}
            >
              <Icon className="min-w-[20px]" size={20} />
              {isOpen && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          );
        })}

        {/* Admin Accordion */}
        {isAdmin && (
          <div>
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className="group flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-violet-600 transition-all duration-150"
              title={!isOpen ? 'Admin' : undefined}
            >
              <div className="flex items-center gap-4">
                <FaUserEdit className="min-w-[20px]" size={20} />
                {isOpen && <span className="whitespace-nowrap">Admin</span>}
              </div>
              {isOpen && <FaChevronDown size={14} className={`transition-transform ${isAdminOpen ? 'rotate-180' : ''}`} />}
            </button>
            {isAdminOpen && (
              <div className="ml-8 mt-1 space-y-1">
                {adminSubItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-2 py-1 rounded-md text-sm font-medium
                      ${isActive ? 'bg-violet-500 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-violet-600'}`
                    }
                  >
                    <Icon size={16} />
                    {isOpen && <span>{label}</span>}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
