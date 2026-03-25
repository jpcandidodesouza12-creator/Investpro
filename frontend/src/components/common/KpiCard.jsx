import React from 'react';

const KpiCard = ({ title, value, subValue, icon: Icon, color = '#F5C518' }) => {
  return (
    <div className="card" style={{ flex: 1, minWidth: '200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ color: '#a0a0a0', fontSize: '14px' }}>{title}</span>
        {Icon && <Icon size={20} color={color} />}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
        {value}
      </div>
      {subValue && (
        <div style={{ fontSize: '12px', color: subValue.startsWith('+') ? '#4caf50' : '#ff4444', marginTop: '4px' }}>
          {subValue}
        </div>
      )}
    </div>
  );
};

export default KpiCard;