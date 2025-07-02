import React from 'react';
import { IconContext } from 'react-icons';

const SectionDivider = ({ title, Icon }) => (
  <div className="flex items-center my-10">
    <div className="flex-grow border-t border-gray-300"></div>
    
    <div className="flex items-center space-x-2 px-4 bg-white z-10">
      <IconContext.Provider value={{ className: 'text-gray-600 text-lg' }}>
        {Icon && <Icon />}
      </IconContext.Provider>
      <span className="text-gray-700 font-semibold uppercase tracking-wide text-sm">
        {title}
      </span>
    </div>

    <div className="flex-grow border-t border-gray-300"></div>
  </div>
);

export default SectionDivider;
