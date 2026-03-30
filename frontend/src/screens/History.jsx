import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { P } from "../styles/theme";
import { getType } from "../utils/constants";
import { fmt, fmtD } from "../utils/formatters";
import { KPI, ChartCard, ChartTip, PageHeader, Muted, Empty, IBtn, Btn } from "../components/common";

function fmtS(v) {
  if (v >= 1_000) return `R$${(v/1_000).toFixed(0)}k`;
  return `R$${v.toFixed(0)}`;
}

export function ScreenHistory({ invs, deps, isMobile, onAddDep, onDelDep }) {
  const [filterInv, setFilterInv] = useState("all");

  const sorted   = [...deps].sort((a, b) => new Date(b.data) - new Date(a.data));
  const filtered = filterInv === "all" ? sorted : sorted.filter(d => d.invId === parseInt(filterInv));
  const totalDep = deps.reduce((a, d) => a + d.valor, 0);

  const byMonth = useMemo(() => {
    const map = {};
    deps.forEach(d => {
      const key = new Date(d.data + "T12:00:00").toLocaleDateString("pt-BR", { month:"short", year:"numeric" });
      map[key] = (map[key] || 0) + d.valor;
    });
    return Object.entries(map).slice(-12).map(([mes, valor]) => ({ mes, valor }));
  }, [deps]);

  const byInv = useMemo(() => {
    const map = {};
    deps.forEach(d => { map[d.invId] = (map[d.invId] || 0) + d.valor; });
    return map;
  }, [deps]);

  return (
    <div style={P.root}>
      <PageHeader title="Histórico de Aportes" subtitle={`${deps.length} aporte${deps.length!==1?"s":""} · ${fmt(totalDep)}`}>
        <Btn onClick={onAddDep}>+ Registrar Aporte</Btn>
      </PageHeader>

      <div style={P.kpiRow} className="kpi-row">
        <KPI label="Total aportado"     value={fmt(totalDep)}                                     color="#F5C518" icon="investments" />
        <KPI label="Média por aporte"   value={deps.length ? fmt(totalDep/deps.length) : "R$ 0"} color="#aaaaaa" icon="quotes" />
        <KPI label="Ativos com aportes" value={`${Object.keys(byInv).length}`}                   color="#ffffff" icon="projection" />
        <KPI label="Último aporte"      value={sorted[0] ? fmtD(sorted[0].data) : "—"}           color="#F5C518" icon="history" />
      </div>

      <div style={{ ...P.grid2, gridTemplateColumns:isMobile?"1fr":"2fr 1fr" }}>
        <ChartCard title="Aportes por Mês">
          {byMonth.length === 0
            ? <Empty>Nenhum aporte registrado.</Empty>
            : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byMonth} margin={{ top:8, right:8, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1814" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill:"#555", fontSize:10 }} axisLine={{ stroke:"#2a2820" }} tickLine={false} />
                  <YAxis tickFormatter={fmtS} tick={{ fill:"#555", fontSize:10 }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="valor" fill="#F5C518" radius={[4,4,0,0]} fillOpacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </ChartCard>

        <ChartCard title="Por Investimento">
          {invs.filter(i => byInv[i.id]).length === 0
            ? <Muted>Sem aportes.</Muted>
            : invs.filter(i => byInv[i.id]).map(inv => {
              const t   = getType(inv.tipo);
              const val = byInv[inv.id] || 0;
              const pct = totalDep > 0 ? val / totalDep * 100 : 0;
              return (
                <div key={inv.id} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ color:"#ccc", fontSize:12 }}>{t.icon} {inv.nome}</span>
                    <span style={{ color:t.color, fontFamily:"'IBM Plex Mono',monospace", fontSize:11 }}>{fmt(val)}</span>
                  </div>
                  <div style={{ height:4, background:"#1e1c16", borderRadius:2 }}>
                    <div style={{ height:4, background:t.color, borderRadius:2, width:`${pct}%` }} />
                  </div>
                </div>
              );
            })
          }
        </ChartCard>
      </div>

      <ChartCard title="Todos os Aportes">
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
          <select style={{ ...P.search, width:"auto", cursor:"pointer" }} value={filterInv} onChange={e => setFilterInv(e.target.value)}>
            <option value="all">Todos</option>
            {invs.map(inv => <option key={inv.id} value={inv.id}>{inv.nome}</option>)}
          </select>
        </div>
        {filtered.length === 0
          ? <Muted>Nenhum aporte encontrado.</Muted>
          : (
            <div style={{ overflowX:"auto" }}>
              <table style={P.table}>
                <thead><tr>
                  <th style={P.th}>Data</th>
                  <th style={P.th}>Investimento</th>
                  <th style={P.th}>Valor</th>
                  <th style={P.th}>Obs.</th>
                  <th style={P.th}></th>
                </tr></thead>
                <tbody>
                  {filtered.map(dep => {
                    const inv = invs.find(i => i.id === dep.invId);
                    const t   = getType(inv?.tipo);
                    return (
                      <tr key={dep.id} style={P.tr} className="tr-hover">
                        <td style={{ ...P.td, color:"#ccc" }}>{fmtD(dep.data)}</td>
                        <td style={{ ...P.td, color:t.color }}>{t.icon} {inv?.nome || "—"}</td>
                        <td style={{ ...P.td, color:"#22c55e", fontWeight:600 }}>{fmt(dep.valor)}</td>
                        <td style={{ ...P.td, color:"#555", fontSize:11 }}>{dep.obs || "—"}</td>
                        <td style={P.td}><IBtn onClick={() => onDelDep(dep.id)} title="Remover" iconName="trash"/></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </ChartCard>
    </div>
  );
}
