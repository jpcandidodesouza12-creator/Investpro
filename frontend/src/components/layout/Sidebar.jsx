import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut 
} from 'lucide-react';

const Sidebar = ({ activeScreen, setScreen, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wallet', label: 'Minha Carteira', icon: Wallet },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const sidebarStyle = {
    width: isCollapsed ? '70px' : '240px',
    height: '100vh',
    background: '#111',
    borderRight: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'sticky',
    top: 0,
    overflow: 'hidden'
  };

  return (
    <aside style={sidebarStyle}>
      {/* Header da Sidebar */}
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
        {!isCollapsed && <span style={{ color: '#F5C518', fontWeight: 'bold', fontSize: '1.2rem' }}>InvestPro</span>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer' }}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Itens */}
      <nav style={{ flex: 1, padding: '10px' }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '4px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeScreen === item.id ? 'rgba(245, 197, 24, 0.1)' : 'transparent',
              color: activeScreen === item.id ? '#F5C518' : '#a0a0a0',
              transition: 'all 0.2s'
            }}
          >
            <item.icon size={20} style={{ minWidth: '20px' }} />
            {!isCollapsed && <span style={{ marginLeft: '12px', fontWeight: '500' }}>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '10px', borderTop: '1px solid #2a2a2a' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: '#ff4444',
            cursor: 'pointer'
          }}
        >
          <LogOut size={20} />
          {!isCollapsed && <span style={{ marginLeft: '12px' }}>Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;