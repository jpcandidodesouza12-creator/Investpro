import React from 'react';
import { TrendingUp, Wallet, DollarSign, ArrowUpRight } from 'lucide-react';
import KpiCard from '../components/common/KpiCard';
import ChartCard from '../components/common/ChartCard';
import AllocationChart from '../components/charts/AllocationChart';
import { useQuotes } from '../hooks/useQuotes';
import { useInvestments } from '../hooks/useInvestments';
import { T } from '../styles/theme';

const Dashboard = () => {
  const { quotes } = useQuotes();
  const { investments, loading } = useInvestments();

  // Exemplo de dados para o gráfico (na Fase 5 avançada isso virá de calculations.js)
  const allocationData = [
    { name: 'Ações', value: 400 },
    { name: 'FIIs', value: 300 },
    { name: 'Cripto', value: 200 },
    { name: 'Renda Fixa', value: 100 },
  ];

  if (loading) return <div style={{ color: T.accent }}>Carregando dados...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header da Tela */}
      <div>
        <h1 style={{ color: T.text, fontSize: '26px', fontWeight: 800, letterSpacing: '-1px' }}>
          Dashboard
        </h1>
        <p style={{ color: T.textMuted, fontSize: '14px' }}>Bem-vindo de volta ao seu resumo financeiro.</p>
      </div>

      {/* Linha de KPIs */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px' 
      }}>
        <KpiCard 
          title="Patrimônio Total" 
          value="R$ 45.230,00" 
          subValue="+R$ 1.200 (Este mês)" 
          icon={Wallet} 
          color={T.accent}
        />
        <KpiCard 
          title="Rentabilidade" 
          value="12,4%" 
          subValue="+2,1% vs CDI" 
          icon={TrendingUp} 
          color="#4caf50"
        />
        <KpiCard 
          title="Dólar (PTAX)" 
          value={`R$ ${quotes.currencies?.USD || '0.00'}`} 
          subValue="Cotação em tempo real" 
          icon={DollarSign} 
          color="#3b82f6"
        />
        <KpiCard 
          title="Dividendos" 
          value="R$ 450,20" 
          subValue="Provisionado" 
          icon={ArrowUpRight} 
          color={T.accent}
        />
      </div>

      {/* Linha de Gráficos */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        <ChartCard title="Alocação por Classe">
          <AllocationChart data={allocationData} />
        </ChartCard>
        
        <ChartCard title="Evolução Patrimonial">
          <div style={{ color: T.textMuted, textAlign: 'center', paddingTop: '100px' }}>
            Gráfico de Evolução (Em breve)
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;