import { useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { P } from "../styles/theme";
import { TYPES, getType } from "../utils/constants";
import { fmt, fmtD } from "../utils/formatters";
import { KPI, ChartCard, ChartTip, PageHeader, AlertRow, Muted, Btn } from "../components/common";

function fmtS(v) {
  if (v >= 1_000_000) return `R$${(v/1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `R$${(v/1_000).toFixed(0)}k`;
  return `R$${v.toFixed(0)}`;
}

export function ScreenDashboard({ invs, cats, settings, cons, totalInv, fx, isMobile, onAdd, irAlerts, vencAlerts }) {
  const last12 = cons[11];
  const next1  = cons[0];
  const meta   = settings.meta;
  const metaPct = meta?.ativa && meta.valor > 0 ? Math.min(100, totalInv / meta.valor * 100) : null;

  const byType = useMemo(() =>
    TYPES.map(t => ({
      ...t,
      value: invs.filter(i => i.tipo === t.id).reduce((a, c) => a + c.valor * (t.currency ? (fx[t.currency]||1) : 1), 0),
    })).filter(t => t.value > 0),
    [invs, fx]
  );

  const byCat = useMemo(() =>
    cats.map(cat => ({
      name:  cat.nome,
      color: cat.cor,
      value: invs.filter(i => i.categoriaId === cat.id).reduce((a, c) => {
        const t = getType(c.tipo);
        return a + c.valor * (t.currency ? (fx[t.currency]||1) : 1);
      }, 0),
    })).filter(c => c.value > 0),
    [invs, cats, fx]
  );

  const areaData = cons.slice(0, 12).map(r => ({
    mes:        r.mes.split(" ")[0],
    "Líquido":  r.saldoLiquido,
    "Bruto":    r.saldo,
    "Principal":totalInv,
  }));

  return (
    <div style={P.root}>
      <PageHeader title="Dashboard" subtitle="Visão geral">
        <Btn onClick={onAdd}>+ Novo</Btn>
      </PageHeader>

      <div style={P.kpiRow} className="kpi-row">
        <KPI label="Total Investido"   value={fmt(totalInv)}                     color="#F5C518" icon="investments" />
        <KPI label="Patrimônio 12m"    value={fmt(last12?.saldoLiquido ?? 0)}    color="#ffffff" icon="projection" />
        <KPI label="IR estimado 12m"   value={fmt(last12?.ir ?? 0)}              color="#ef4444" icon="alert" />
        <KPI label="Rend. próximo mês" value={`+${fmt(next1?.rendLiquido ?? 0)}`} color="#aaaaaa" icon="quotes" />
      </div>

      {metaPct !== null && (
        <div style={P.metaCard}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <span style={{ color:"#b77ee2", fontWeight:700, fontSize:13 }}>
              🎯 Meta · <span style={{ color:"#555", fontWeight:400, fontSize:11, fontFamily:"'IBM Plex Mono',monospace" }}>{fmt(totalInv)} de {fmt(meta.valor)}</span>
            </span>
            <span style={{ color:"#b77ee2", fontWeight:800, fontFamily:"'IBM Plex Mono',monospace" }}>{metaPct.toFixed(1)}%</span>
          </div>
          <div style={P.metaTrack}><div style={{ ...P.metaFill, width:`${metaPct}%` }} /></div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:10, color:"#444", fontFamily:"'IBM Plex Mono',monospace" }}>
            <span>Faltam {fmt(Math.max(0, meta.valor - totalInv))}</span>
            <span>Prazo: {meta.prazo}m</span>
          </div>
        </div>
      )}

      <div style={{ ...P.grid2, gridTemplateColumns:isMobile?"1fr":"1fr 1fr" }}>
        <ChartCard title="Evolução Patrimonial — 12m">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData} margin={{ top:8, right:8, left:0, bottom:0 }}>
              <defs>
                {[["l","#22c55e"],["b","#F5C518"],["p","#3a3020"]].map(([id, c]) => (
                  <linearGradient key={id} id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={c} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={c} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1814" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill:"#555", fontSize:10 }} axisLine={{ stroke:"#2a2820" }} tickLine={false} />
              <YAxis tickFormatter={fmtS} tick={{ fill:"#555", fontSize:10 }} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="Principal" stroke="#4a4030" strokeWidth={1} fill="url(#gp)" strokeDasharray="4 3" dot={false} />
              <Area type="monotone" dataKey="Bruto"     stroke="#F5C518" strokeWidth={1.5} fill="url(#gb)" dot={false} />
              <Area type="monotone" dataKey="Líquido"   stroke="#22c55e" strokeWidth={2}   fill="url(#gl)" dot={false} activeDot={{ r:4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Alocação por Tipo">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byType} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={75} innerRadius={42} paddingAngle={3}
                label={({ label: lb, percent }) => `${lb} ${(percent*100).toFixed(0)}%`}
                labelLine={{ stroke:"#2a2820" }}>
                {byType.map((t, i) => <Cell key={i} fill={t.color} stroke="#0e0d0b" strokeWidth={2} />)}
              </Pie>
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background:"#0e0d0b", border:"1px solid #2a2820", borderRadius:8, fontFamily:"'IBM Plex Mono',monospace", fontSize:11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ ...P.grid2, gridTemplateColumns:isMobile?"1fr":"1fr 1fr" }}>
        <ChartCard title="🔔 Vencimentos">
          {vencAlerts.length === 0
            ? <Muted>✓ Nenhum vencimento próximo (30 dias).</Muted>
            : vencAlerts.map(({ inv, diasAte }) => (
              <AlertRow key={inv.id} name={inv.nome} sub={`Vence: ${fmtD(inv.vencimento)}`}
                badge={`${diasAte}d`} badgeColor={diasAte <= 7 ? "#ef4444" : "#F5C518"} urgent={diasAte <= 7} />
            ))
          }
        </ChartCard>

        <ChartCard title="⚠️ Alertas de IR">
          {irAlerts.length === 0
            ? <Muted>✓ Nenhum investimento próximo de mudar de faixa.</Muted>
            : irAlerts.map(({ inv, restam, aliqAtual, aliqProx }) => (
              <AlertRow key={inv.id} name={inv.nome}
                sub={`IR: ${aliqAtual.toFixed(1)}% → ${aliqProx.toFixed(1)}%`}
                badge={`${restam}d`} badgeColor={restam <= 7 ? "#ef4444" : "#F5C518"} urgent={restam <= 7} />
            ))
          }
        </ChartCard>
      </div>

      {byCat.length > 0 && (
        <ChartCard title="Distribuição por Categoria">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byCat} layout="vertical" margin={{ top:4, right:8, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1814" horizontal={false} />
              <XAxis type="number" tickFormatter={fmtS} tick={{ fill:"#555", fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill:"#ccc", fontSize:11, fontFamily:"'IBM Plex Mono',monospace" }} axisLine={false} tickLine={false} width={90} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background:"#0e0d0b", border:"1px solid #2a2820", borderRadius:8, fontFamily:"'IBM Plex Mono',monospace", fontSize:11 }} />
              <Bar dataKey="value" radius={[0,4,4,0]}>
                {byCat.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
