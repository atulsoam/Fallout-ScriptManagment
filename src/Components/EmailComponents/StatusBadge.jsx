import React from 'react';

const StatusBadge = ({ status }) => {
  const getColor = (status) => {
    switch (status.toLowerCase()) {
      case 'sent': return 'green';
      case 'failed': return 'red';
      case 'pending': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <span style={{ color: getColor(status), fontWeight: 'bold' }}>
      {status}
    </span>
  );
};

export default StatusBadge;
