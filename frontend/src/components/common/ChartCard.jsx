import React from 'react';

const ChartCard = ({ title, children }) => {
  return (
    <div className="card" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ 
        color: '#F5C518', 
        fontSize: '16px', 
        marginBottom: '16px',
        borderLeft: '3px solid #F5C518',
        paddingLeft: '10px'
      }}>
        {title}
      </h3>
      <div style={{ width: '100%', height: '300px' }}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;