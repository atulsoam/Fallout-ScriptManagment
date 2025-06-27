import React from 'react';
import {
  FaBars, FaHome, FaSignOutAlt, FaChartBar, FaHistory,
  FaUpload, FaPlay, FaClock, FaUserEdit
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
  // { to: '/', label: 'Fallout Dashboard', icon: FaChartBar },
  { to: '/admin', label: 'Admin', icon: FaUserEdit },
  { to: '/logout', label: 'Logout', icon: FaSignOutAlt },

];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const authToken = JSON.parse(localStorage.getItem('authToken') || '{}');
  const isAdmin = authToken?.isAdmin;
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout()
    navigate('/login');

  }
  const filteredNavItems = navItems.filter(item => {
    if (item.label.toLowerCase() === 'admin' && !isAdmin) return false;
    return true;
  });
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
          <span
            className="text-xl font-semibold text-gray-800"
            style={{ color: colors.primary }}
          >
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

      {/* Nav Items */}
      <nav className="flex flex-col flex-grow px-1 py-4 space-y-1">
        {filteredNavItems.map(({ to, label, icon: Icon }) => {
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
        ${isActive
                  ? 'bg-violet-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-violet-600'
                }`
              }
              title={!isOpen ? label : undefined}
            >
              <Icon className="min-w-[20px]" size={20} />
              {isOpen && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          );
        })}


      </nav>
    </aside>
  );
};

export default Sidebar;
