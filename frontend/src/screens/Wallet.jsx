import React, { useState } from 'react';
import { Plus, Search, Filter, Trash2, Edit2 } from 'lucide-react';
import { T } from '../styles/theme';
import Btn from '../components/common/Btn';
import Badge from '../components/common/Badge';
import { useInvestments } from '../hooks/useInvestments';
import { useQuotes } from '../hooks/useQuotes';

const Wallet = () => {
  const { investments, loading, addInvestment } = useInvestments();
  const { quotes } = useQuotes();
  const [searchTerm, setSearchTerm] = useState('');

  // Estilo da Tabela (Baseado no seu index.html original)
  const tableHeaderStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    color: T.textMuted,
    fontSize: '12px',
    textTransform: 'uppercase',
    borderBottom: `1px solid ${T.border2}`,
    fontFamily: T.mono
  };

  const tableCellStyle = {
    padding: '16px',
    borderBottom: `1px solid ${T.border2}`,
    fontSize: '14px',
    color: T.text
  };

  if (loading) return <div style={{ color: T.accent }}>Carregando carteira...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header com Ações */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: T.text, fontSize: '26px', fontWeight: 800, letterSpacing: '-1px' }}>Minha Carteira</h1>
          <p style={{ color: T.textMuted, fontSize: '14px' }}>{investments.length} ativos registados</p>
        </div>
        <Btn onClick={() => alert('Abrir Modal de Aporte')} variant="primary">
          <Plus size={18} /> Novo Aporte
        </Btn>
      </div>

      {/* Barra de Filtros */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        background: T.surface, 
        padding: '12px', 
        borderRadius: '12px',
        border: `1px solid ${T.border2}`
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
          <input 
            type="text" 
            placeholder="Pesquisar ativo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              background: T.bg, 
              border: `1px solid ${T.border2}`, 
              borderRadius: '8px', 
              padding: '10px 10px 10px 36px', 
              color: T.text,
              outline: 'none'
            }}
          />
        </div>
        <Btn variant="secondary"><Filter size={16} /> Filtros</Btn>
      </div>

      {/* Tabela de Ativos */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Ativo</th>
              <th style={tableHeaderStyle}>Tipo</th>
              <th style={tableHeaderStyle}>Qtd</th>
              <th style={tableHeaderStyle}>Preço Médio</th>
              <th style={tableHeaderStyle}>Atual</th>
              <th style={tableHeaderStyle}>Total</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((asset, index) => (
              <tr key={index} className="tr-hover" style={{ transition: 'background 0.2s' }}>
                <td style={tableCellStyle}>
                  <div style={{ fontWeight: 'bold' }}>{asset.ticker}</div>
                  <div style={{ fontSize: '11px', color: T.textMuted }}>{asset.name}</div>
                </td>
                <td style={tableCellStyle}>{asset.type}</td>
                <td style={tableCellStyle}>{asset.quantity}</td>
                <td style={tableCellStyle}>R$ {asset.averagePrice.toFixed(2)}</td>
                <td style={tableCellStyle}>R$ {asset.currentPrice || '0.00'}</td>
                <td style={tableCellStyle}><strong>R$ {(asset.quantity * (asset.currentPrice || 0)).toFixed(2)}</strong></td>
                <td style={tableCellStyle}>
                  <Badge type={asset.profit >= 0 ? 'success' : 'danger'}>
                    {asset.profit >= 0 ? 'Lucro' : 'Prejuízo'}
                  </Badge>
                </td>
                <td style={tableCellStyle}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer' }}><Edit2 size={16} /></button>
                    <button style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Wallet;