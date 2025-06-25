import React, { useState } from 'react';
import { FaBars, FaHome, FaSignOutAlt, FaChartBar, FaHistory, FaUpload, FaPlay } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import colors from '../utils/Colors'; // Adjust path if needed

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: FaHome },
    { to: '/logout', label: 'Logout', icon: FaSignOutAlt },
    { to: '/', label: 'FalloutDashboard', icon: FaChartBar },
    { to: '/history', label: 'History', icon: FaHistory },
    { to: '/upload', label: 'Upload', icon: FaUpload },
    { to: '/scriptRunner', label: 'Run', icon: FaPlay },



];

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <div
            className={`flex flex-col fixed top-0 left-0 h-full z-10 transition-all duration-300 shadow-lg`}
            style={{
                width: isOpen ? 256 : 64,
                backgroundColor: colors.surface,
                borderRight: `1px solid ${colors.border}`,
            }}
        >
            {/* Header with title and toggle */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.border }}>
                {isOpen && (
                    <span
                        className="text-xl font-bold select-none"
                        style={{ color: colors.primary }}
                    >
                        Lumen
                    </span>
                )}
                <button
                    aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    onClick={toggleSidebar}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    style={{ color: colors.icon }}
                >
                    <FaBars size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col flex-grow mt-4">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 mx-1 my-1 rounded-md text-sm transition-colors
     ${isActive
                                ? `bg-[#A78BFA] text-white`
                                : `text-[${colors.textPrimary}] hover:bg-gray-100 hover:text-[${colors.primary}]`
                            }`
                        }
                        title={!isOpen ? label : undefined}
                    >
                        <Icon size={20} />
                        {isOpen && <span className="select-none">{label}</span>}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};


export default Sidebar;
