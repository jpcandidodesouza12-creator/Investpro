import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { P } from "../styles/theme";
import { fmt, fmtP } from "../utils/formatters";
import { ChartCard, ChartTip, PageHeader, Empty, Met } from "../components/common";

export function ScreenComparator({ invs, projs, isMobile }) {
  const [selA, setSelA] = useState(invs[0]?.id ?? null);
  const [selB, setSelB] = useState(invs[1]?.id ?? null);

  const invA = projs.find(p => p.id === selA);
  const invB = projs.find(p => p.id === selB);

  const chartData = invA && invB
    ? Array.from({ length:12 }, (_, i) => ({
        mes:         invA.months[i].mes.split(" ")[0],
        [invA.nome]: invA.months[i].saldoLiquido,
        [invB.nome]: invB.months[i].saldoLiquido,
      }))
    : [];

  return (
    <div style={P.root}>
      <PageHeader title="Comparador" subtitle="Compare dois investimentos lado a lado" />

      {invs.length < 2
        ? <Empty>Cadastre ao menos 2 investimentos para comparar.</Empty>
        : (
          <>
            <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:16, marginBottom:20 }}>
              {[
                { sel:selA, set:setSelA, label:"Investimento A", color:"#F5C518" },
                { sel:selB, set:setSelB, label:"Investimento B", color:"#60a5fa" },
              ].map(({ sel, set, label, color }) => {
                const inv = projs.find(p => p.id === sel);
                return (
                  <div key={label} style={{ ...P.chartCard, borderColor:`${color}44` }}>
                    <div style={{ ...P.chartTitle, color }}>{label}</div>
                    <select style={{ ...P.search, width:"100%", cursor:"pointer", marginTop:10 }}
                      value={sel ?? ""} onChange={e => set(parseInt(e.target.value))}>
                      {invs.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                    </select>
                    {inv && (
                      <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        <Met label="Investido"  value={fmt(inv.valor)} />
                        <Met label="% CDI/Ret." value={fmtP(inv.pct)} />
                        <Met label="Saldo 12m"  value={fmt(inv.months[11].saldoLiquido)} accent={color} />
                        <Met label="Rend. líq." value={`+${fmt(inv.months[11].rendLiquido)}`} accent={color} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {invA && invB && (
              <>
                <ChartCard title="Saldo Líquido — 12 meses">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top:8, right:8, left:0, bottom:0 }}>
                      <defs>
                        <linearGradient id="cA" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#F5C518" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#F5C518" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="cB" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#60a5fa" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1814" vertical={false} />
                      <XAxis dataKey="mes" tick={{ fill:"#555", fontSize:10 }} axisLine={{ stroke:"#2a2820" }} tickLine={false} />
                      <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fill:"#555", fontSize:10 }} axisLine={false} tickLine={false} width={56} />
                      <Tooltip content={<ChartTip />} />
                      <Legend wrapperStyle={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#555" }} iconType="circle" iconSize={7} />
                      <Area type="monotone" dataKey={invA.nome} stroke="#F5C518" strokeWidth={2} fill="url(#cA)" dot={false} />
                      <Area type="monotone" dataKey={invB.nome} stroke="#60a5fa" strokeWidth={2} fill="url(#cB)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <div style={{ marginTop:16 }}>
                  <ChartCard title="Confronto direto — 12 meses">
                    <div style={{ overflowX:"auto" }}>
                      <table style={P.table}>
                        <thead><tr>
                          <th style={P.th}>Métrica</th>
                          <th style={{ ...P.th, color:"#F5C518" }}>{invA.nome}</th>
                          <th style={{ ...P.th, color:"#60a5fa" }}>{invB.nome}</th>
                          <th style={{ ...P.th, color:"#22c55e" }}>Vencedor</th>
                        </tr></thead>
                        <tbody>
                          {[
                            { label:"Valor investido",   a:invA.valor,                                b:invB.valor },
                            { label:"Saldo bruto 12m",   a:invA.months[11].saldo,                     b:invB.months[11].saldo },
                            { label:"IR 12m",            a:invA.months[11].ir,                        b:invB.months[11].ir, lower:true },
                            { label:"Saldo líquido 12m", a:invA.months[11].saldoLiquido,              b:invB.months[11].saldoLiquido },
                            { label:"Rend. líquido 12m", a:invA.months[11].rendLiquido,               b:invB.months[11].rendLiquido },
                            { label:"Retorno %", a:invA.months[11].rendLiquido/invA.valor*100, b:invB.months[11].rendLiquido/invB.valor*100, pct:true },
                          ].map(({ label, a, b, lower, pct }) => {
                            const w = lower ? (a<b?"A":b<a?"B":null) : (a>b?"A":b>a?"B":null);
                            return (
                              <tr key={label} style={P.tr}>
                                <td style={{ ...P.td, color:"#888" }}>{label}</td>
                                <td style={{ ...P.td, color:w==="A"?"#22c55e":"#aaa", fontWeight:w==="A"?700:400 }}>{pct ? fmtP(a) : fmt(a)}</td>
                                <td style={{ ...P.td, color:w==="B"?"#22c55e":"#aaa", fontWeight:w==="B"?700:400 }}>{pct ? fmtP(b) : fmt(b)}</td>
                                <td style={P.td}>
                                  {w==="A" && <span style={{ color:"#F5C518", fontWeight:700 }}>🏆 {invA.nome}</span>}
                                  {w==="B" && <span style={{ color:"#60a5fa", fontWeight:700 }}>🏆 {invB.nome}</span>}
                                  {!w      && <span style={{ color:"#333" }}>—</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </ChartCard>
                </div>
              </>
            )}
          </>
        )
      }
    </div>
  );
}
