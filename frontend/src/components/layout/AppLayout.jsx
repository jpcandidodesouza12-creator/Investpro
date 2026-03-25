import React from 'react';
import Sidebar from './Sidebar';

const AppLayout = ({ children, activeScreen, setScreen, onLogout }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090909' }}>
      <Sidebar 
        activeScreen={activeScreen} 
        setScreen={setScreen} 
        onLogout={onLogout} 
      />
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;