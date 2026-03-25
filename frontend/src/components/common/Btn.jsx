import React from 'react';

const Btn = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = {
    padding: '10px 16px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const variants = {
    primary: { background: '#F5C518', color: '#000' },
    secondary: { background: '#2a2a2a', color: '#fff' },
    danger: { background: '#ff4444', color: '#fff' }
  };

  return (
    <button 
      onClick={onClick}
      style={{ ...baseStyle, ...variants[variant] }}
      className={`btn-custom ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Btn;