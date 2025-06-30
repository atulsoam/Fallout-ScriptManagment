// Navbar.jsx (or your Navbar component)
import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import colors from '../utils/Colors';

const Navbar = ({ sidebarOpen }) => {
  const storedAuth = JSON.parse(localStorage.getItem("authToken") || "{}");
  const cuid = storedAuth.cuid || "";
  const userName = storedAuth.username || "NA";

  return (
    <nav
      className="fixed top-0 right-0 h-14 flex items-center justify-between px-4 text-sm shadow-md transition-all duration-300 z-20"
      style={{
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        width: `calc(100% - ${sidebarOpen ? '256px' : '64px'})`,
        marginLeft: sidebarOpen ? 256 : 64,
      }}
    >
      {/* Cool Title */}
      <div className="text-2xl font-semibold text-gray-800 tracking-wide animate-fadeIn">
        Fallout & Script Management
      </div>

      <div className="flex items-center gap-4">
        <span style={{ color: colors.textSecondary }}>
          Welcome, {userName} ({cuid})
        </span>
        <FontAwesomeIcon icon={faUserCircle} style={{ color: colors.icon }} />
      </div>
    </nav>
  );
};

export default Navbar;
