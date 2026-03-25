import React, { useState } from 'react';
import { User, Bell, Shield, Database, Globe, Save } from 'lucide-react';
import { T } from '../styles/theme';
import Btn from '../components/common/Btn';

const Settings = () => {
  const [currency, setCurrency] = useState('BRL');
  const [notifications, setNotifications] = useState(true);

  const sectionStyle = {
    background: T.surface,
    border: `1px solid ${T.border2}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    color: T.textMuted,
    fontSize: '13px',
    marginBottom: '8px',
    fontFamily: T.mono
  };

  const inputStyle = {
    width: '100%',
    background: T.bg,
    border: `1px solid ${T.border2}`,
    borderRadius: '8px',
    padding: '12px',
    color: T.text,
    outline: 'none',
    fontSize: '14px'
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: T.text, fontSize: '26px', fontWeight: 800, letterSpacing: '-1px' }}>Configurações</h1>
        <p style={{ color: T.textMuted, fontSize: '14px' }}>Gerencie suas preferências e segurança da conta.</p>
      </div>

      {/* Perfil */}
      <div style={sectionStyle}>
        <h3 style={{ color: T.accent, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <User size={20} /> Perfil do Investidor
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Nome de Exibição</label>
            <input style={inputStyle} type="text" defaultValue="Usuário InvestPro" />
          </div>
          <div>
            <label style={labelStyle}>E-mail Principal</label>
            <input style={inputStyle} type="email" defaultValue="investidor@email.com" disabled />
          </div>
        </div>
      </div>

      {/* Preferências do Sistema */}
      <div style={sectionStyle}>
        <h3 style={{ color: T.accent, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Globe size={20} /> Preferências de Exibição
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Moeda Base</label>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              style={inputStyle}
            >
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dólar (US$)</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '25px' }}>
            <input 
              type="checkbox" 
              checked={notifications} 
              onChange={() => setNotifications(!notifications)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label style={{ color: T.text, fontSize: '14px', cursor: 'pointer' }}>Receber alertas de cotações</label>
          </div>
        </div>
      </div>

      {/* Status da API (Substitui o bloco de chaves antigo) */}
      <div style={sectionStyle}>
        <h3 style={{ color: T.accent, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Database size={20} /> Conexão de Dados
        </h3>
        <div style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid #22c55e33', padding: '15px', borderRadius: '8px' }}>
          <p style={{ color: '#22c55e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} /> O backend (Northflank) está gerindo suas chaves de API com segurança.
          </p>
          <p style={{ color: T.textMuted, fontSize: '12px', marginTop: '8px' }}>
            As cotações do Banco Central e B3 são atualizadas automaticamente via servidor.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <Btn variant="primary" onClick={() => alert('Configurações salvas!')}>
          <Save size={18} /> Salvar Alterações
        </Btn>
      </div>
    </div>
  );
};

export default Settings;