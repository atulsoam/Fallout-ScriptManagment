import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import colors from '../utils/Colors';

const Navbar = ({ sidebarOpen }) => {
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

      <div className="text-lg font-semibold" style={{ color: colors.primary }}>
        Fallout & ScriptManagement
      </div>
      <div className="flex items-center gap-4">
        <span style={{ color: colors.textSecondary }}>Welcome, User</span>
        <FontAwesomeIcon icon={faUserCircle} style={{ color: colors.icon }} />
      </div>
    </nav>
  );
};

export default Navbar;
