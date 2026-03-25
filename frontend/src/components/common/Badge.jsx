import React from 'react';

const Badge = ({ type, children }) => {
  const isSuccess = type === 'success';
  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      background: isSuccess ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 68, 68, 0.1)',
      color: isSuccess ? '#4caf50' : '#ff4444',
      border: `1px solid ${isSuccess ? '#4caf50' : '#ff4444'}`
    }}>
      {children}
    </span>
  );
};

export default Badge;