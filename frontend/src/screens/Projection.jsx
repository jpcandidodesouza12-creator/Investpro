import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { P } from "../styles/theme";
import { fmt, fmtP } from "../utils/formatters";
import { KPI, ChartCard, ChartTip, PageHeader, Empty } from "../components/common";
import { Toggle } from "../components/common/Buttons";

function fmtS(v) {
  if (v >= 1_000) return `R$${(v/1_000).toFixed(0)}k`;
  return `R$${v.toFixed(0)}`;
}

export function ScreenProjection({ projs, cons, totalInv, settings, isMobile }) {
  const [view,   setView]   = useState("liquido");
  const [months, setMonths] = useState(12);
  const isLiq = view === "liquido";
  const rows  = cons.slice(0, months);
  const last  = rows[rows.length - 1];

  const barData = rows.map((r, i) => {
    const prev = rows[i - 1];
    return {
      mes:              r.mes.split(" ")[0],
      "Rend. Bruto":    i===0 ? r.rendimento  : r.rendimento  - (prev?.rendimento  ?? 0),
      "Rend. Líquido":  i===0 ? r.rendLiquido : r.rendLiquido - (prev?.rendLiquido ?? 0),
      "IR":             i===0 ? r.ir          : r.ir          - (prev?.ir          ?? 0),
    };
  });

  return (
    <div style={P.root}>
      <PageHeader title="Projeção" subtitle={`CDI ${fmtP(settings.cdiRate)} a.a.`}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <Toggle options={["liquido","bruto"]} labels={["Líquido","Bruto"]} value={view} onChange={setView} />
          <Toggle options={[12,24]} labels={["12m","24m"]} value={months} onChange={v => setMonths(Number(v))} />
        </div>
      </PageHeader>

      {cons.length === 0
        ? <Empty>Adicione investimentos para ver a projeção.</Empty>
        : (
          <>
            <div style={P.kpiRow} className="kpi-row">
              <KPI label={`Saldo (${months}m)`}   value={fmt(isLiq ? last?.saldoLiquido : last?.saldo)}            color="#ffffff" icon="projection" />
              <KPI label="Rendimento total"        value={`+${fmt(isLiq ? last?.rendLiquido : last?.rendimento)}`}  color="#aaaaaa" icon="quotes" />
              <KPI label="IR total"                value={`-${fmt(last?.ir ?? 0)}`}                                 color="#ef4444" icon="alert" />
              <KPI label="Retorno s/ capital"      value={fmtP(((last?.rendLiquido ?? 0) / (totalInv||1)) * 100)}  color="#F5C518" icon="investments" />
            </div>

            <ChartCard title="Rendimento Mensal Incremental">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top:8, right:8, left:0, bottom:0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1814" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill:"#555", fontSize:10 }} axisLine={{ stroke:"#2a2820" }} tickLine={false} />
                  <YAxis tickFormatter={fmtS} tick={{ fill:"#555", fontSize:10 }} axisLine={false} tickLine={false} width={56} />
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#555", paddingTop:4 }} iconType="square" iconSize={8} />
                  <Bar dataKey="Rend. Bruto"   fill="#F5C518" radius={[3,3,0,0]} fillOpacity={0.85} />
                  <Bar dataKey="IR"            fill="#ef4444" radius={[3,3,0,0]} fillOpacity={0.85} />
                  <Bar dataKey="Rend. Líquido" fill="#22c55e" radius={[3,3,0,0]} fillOpacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div style={{ marginTop:16 }}>
              <ChartCard title="Tabela Detalhada">
                <div style={{ overflowX:"auto" }}>
                  <table style={P.table}>
                    <thead><tr>
                      <th style={P.th}>Mês</th>
                      {projs.map(p => <th key={p.id} style={{ ...P.th, color:"#F5C518" }}>{p.nome}</th>)}
                      {projs.length > 1 && <th style={{ ...P.th, color:"#22c55e" }}>Total</th>}
                      <th style={{ ...P.th, color:"#ef4444" }}>IR</th>
                      <th style={{ ...P.th, color:"#60a5fa" }}>Rend. Líq.</th>
                    </tr></thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} style={P.tr} className="tr-hover">
                          <td style={{ ...P.td, color:"#ccc", fontWeight:600 }}>{row.mes}</td>
                          {projs.map(p => (
                            <td key={p.id} style={{ ...P.td, color:isLiq?"#22c55e":"#aaa" }}>
                              {fmt(isLiq ? p.months[i]?.saldoLiquido : p.months[i]?.saldo)}
                            </td>
                          ))}
                          {projs.length > 1 && (
                            <td style={{ ...P.td, color:"#22c55e", fontWeight:700 }}>
                              {fmt(isLiq ? row.saldoLiquido : row.saldo)}
                            </td>
                          )}
                          <td style={{ ...P.td, color:"#ef4444" }}>-{fmt(row.ir)}</td>
                          <td style={{ ...P.td, color:"#60a5fa", fontWeight:600 }}>+{fmt(row.rendLiquido)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p style={P.note}>* CDI {fmtP(settings.cdiRate)} a.a. IR regressivo. Estimativas.</p>
              </ChartCard>
            </div>
          </>
        )
      }
    </div>
  );
}
