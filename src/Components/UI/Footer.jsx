import React from "react";
import { FaRegCopyright } from "react-icons/fa";
import logo from "../../assets/lumen-logo.png";
import colors from "../../utils/Colors"; // Make sure path is correct

const Footer = ({ sidebarOpen }) => {
  return (
    <footer
      className="h-20 flex items-center justify-between px-6 text-sm shadow-inner transition-all duration-300 z-10 mt-8"
      style={{
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        width: `calc(100% - ${sidebarOpen ? "256px" : "64px"})`,
        marginLeft: sidebarOpen ? 256 : 64,
      }}
    >
      {/* Logo + Name */}
      <div className="flex items-center space-x-3">
        <img
          src={logo}
          alt="Lumen Logo"
          className="h-5 w-auto object-contain"
        />
      </div>

      {/* Copyright */}
      <div className="flex items-center space-x-1 text-gray-500 text-sm">
        <FaRegCopyright className="text-base" />
        <span>
          {new Date().getFullYear()} Lumen Technologies. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
