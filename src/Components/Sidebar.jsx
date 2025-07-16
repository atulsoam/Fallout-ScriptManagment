import React, { useState, useEffect } from 'react';
import {
  FaBars, FaHome, FaSignOutAlt, FaHistory,
  FaUpload, FaPlay, FaClock, FaUserEdit, FaChevronDown,
} from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi'; // Heroicons — clean and popular in Tailwind-based UI

import { NavLink, useNavigate } from 'react-router-dom';
import colors from '../utils/Colors';
import { logout } from '../services/auth/authServices';
import logo from "../assets/lumen-logo.png";
import { getAllPendingRequest } from '../services/AdminServices/Adminservices';

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
  { to: '/EmailHistory', label: 'Email Dashboard', icon: HiOutlineMail },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const authToken = JSON.parse(localStorage.getItem('authToken') || '{}');
  const isAdmin = authToken?.isAdmin;
  const isApprover = authToken?.isApprover;
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    if (isAdmin || isApprover) {
      getAllPendingRequest()
        .then((res) => {
          const total = res?.data?.totalPending || 0;
          setPendingCount(total);
        })
        .catch((err) => {
          console.error('Failed to fetch pending approvals:', err);
        });
    }
  }, [isAdmin, isApprover]);

  // Badge component for reuse
  const PendingBadge = () =>
    pendingCount > 0 ? (
      <span
        className="ml-1 inline-flex items-center justify-center bg-red-500 text-white text-[11px] font-semibold rounded-full h-5 min-w-[20px] px-[6px] shadow-md ring-2 ring-white transition-all duration-300 ease-in-out"
        aria-label={`${pendingCount} pending requests`}
      >
        {pendingCount}
      </span>
    ) : null;



  return (
    <aside
      className={`fixed top-0 left-0 h-full z-30 shadow-lg border-r transition-all duration-300 bg-white flex flex-col`}
      style={{
        width: isOpen ? 256 : 64,
        backgroundColor: colors.surface,
        borderRight: `1px solid ${colors.border}`,
      }}
      role="navigation"
      aria-label="Sidebar"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4 border-b"
        style={{ borderColor: colors.border }}
      >
        {isOpen ? (
          <img
            src={logo}
            alt="Lumen Logo"
            className="h-8 w-auto object-contain"
          />
        ) : (
          <div className="flex justify-center w-full">
            <img
              src={logo}
              alt="Lumen Logo"
              className="h-8 w-auto object-contain"
              style={{ opacity: 0.7 }}
            />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
          style={{ color: colors.icon }}
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-grow px-1 py-4 space-y-1 overflow-y-auto" tabIndex={-1}>
        {navItems.map(({ to, label, icon: Icon }) => {
          const isLogout = label.toLowerCase() === 'logout';

          const baseClasses =
            "group flex items-center gap-4 px-3 py-2 rounded-md transition-colors duration-150 text-sm font-medium cursor-pointer";

          if (isLogout) {
            return (
              <button
                key={label}
                onClick={handleLogout}
                className={`${baseClasses} text-gray-700 hover:bg-gray-100 hover:text-violet-600 w-full text-left focus:outline-none focus:ring-2 focus:ring-violet-500`}
                title={!isOpen ? label : undefined}
              >
                <Icon className="min-w-[20px]" size={20} />
                {isOpen && <span className="whitespace-nowrap">{label}</span>}
              </button>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `${baseClasses} ${isActive
                  ? "bg-violet-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-violet-600"
                }`
              }
              title={!isOpen ? label : undefined}
            >
              <Icon className="min-w-[20px]" size={20} />
              {isOpen && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          );
        })}

        {(isAdmin || isApprover) && (
          <div className="mt-4">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setIsAdminOpen(!isAdminOpen)}
                  className="group flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-violet-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  title={!isOpen ? 'Admin' : undefined}
                  aria-expanded={isAdminOpen}
                >
                  <div className="flex items-center gap-4">
                    <FaUserEdit className="min-w-[20px]" size={20} />
                    {isOpen && <span className="whitespace-nowrap">Admin</span>}
                  </div>
                  {isOpen && (
                    <FaChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${isAdminOpen ? 'rotate-180' : ''
                        }`}
                      aria-hidden="true"
                    />
                  )}
                </button>

                {isAdminOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    {adminSubItems.map(({ to, label, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end
                        className={({ isActive }) =>
                          `group flex items-center gap-3 px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${isActive
                            ? 'bg-violet-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-violet-600'
                          }`
                        }
                        title={!isOpen ? label : undefined}
                      >
                        <Icon size={16} />
                        {isOpen ? (
                          <span className="flex items-center gap-2">
                            {label}
                            {label === 'Admin Requests' && (
                              <div className="flex items-center gap-2">
                                {/* <span>{label}</span> */}
                                <PendingBadge />
                              </div>
                            )}

                          </span>
                        ) : (
                          label === 'Admin Requests' && (
                            <div className="relative flex items-center justify-center">
                              <PendingBadge />
                            </div>
                          )
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Only Approver (not Admin)
              <NavLink
                to="/adminRequests"
                end
                className={({ isActive }) =>
                  `group flex items-center gap-4 px-3 py-2 rounded-md transition-colors duration-150 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-violet-600 ${isActive ? 'bg-violet-500 text-white' : ''
                  }`
                }
                title={!isOpen ? 'Approver Requests' : undefined}
              >
                <FaClock className="min-w-[20px]" size={20} />
                {isOpen ? (
                  <span className="whitespace-nowrap flex items-center gap-2">
                    Approver Requests
                    <PendingBadge />
                  </span>
                ) : (
                  <PendingBadge />
                )}
              </NavLink>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
