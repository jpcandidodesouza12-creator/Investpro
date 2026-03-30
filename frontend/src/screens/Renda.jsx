import { useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from "recharts";

import { P, T } from "../styles/theme";
import { MESES, DEF_RENDA_CATS, DEF_RENDA_GASTOS_PREV, defRendaMes } from "../utils/constants";
import { fmt } from "../utils/formatters";

// ARQUITETURA: Importação centralizada e segura.
// Certifique-se que BtnSec e Btn estão exportados no seu index.js da pasta common.
import { Btn, BtnSec, PageHeader } from "../components/common";

export function ScreenRenda({ renda, isMobile, onSave }) {
  const hoje = new Date();
  const [mesIdx, setMesIdx] = useState(hoje.getMonth());
  const [editReceita, setEditReceita] = useState(false);
  const [addCat, setAddCat] = useState(false);
  const [newCatNome, setNewCatNome] = useState("");

  // LÓGICA: Garantindo dados padrão caso o mês esteja vazio
  const mesData = useMemo(() => renda[mesIdx] || defRendaMes(), [renda, mesIdx]);
  
  const cats = useMemo(() => {
    return mesData.gastos || DEF_RENDA_CATS.map(c => ({ 
      catId: c.id, 
      previsto: DEF_RENDA_GASTOS_PREV[c.id] || 0, 
      real: 0 
    }));
  }, [mesData]);

  // CÁLCULOS FINANCEIROS
  const totalReceita = (mesData.receitas?.salario || 0) + (mesData.receitas?.freelance || 0) + (mesData.receitas?.outros || 0);
  const totalPrevisto = cats.reduce((a, g) => a + (g.previsto || 0), 0);
  const totalReal = cats.reduce((a, g) => a + (g.real || 0), 0);
  const saldo = totalReceita - totalReal;
  const comprometido = totalReceita > 0 ? (totalReal / totalReceita * 100) : 0;
  const saldoOk = saldo >= 0;

  // HANDLERS
  function updateReceita(field, val) {
    onSave(mesIdx, { 
      ...mesData, 
      receitas: { ...mesData.receitas, [field]: parseFloat(val) || 0 } 
    });
  }

  function updateGasto(catId, field, val) {
    const newGastos = cats.map(g => g.catId === catId ? { ...g, [field]: parseFloat(val) || 0 } : g);
    onSave(mesIdx, { ...mesData, gastos: newGastos });
  }

  function addNewCat() {
    if (!newCatNome.trim()) return;
    const newId = Date.now();
    
    // CLEAN CODE: Em vez de push na constante global, injetamos no estado via onSave
    // A constante DEF_RENDA_CATS deve ser tratada como imutável.
    const newGastoEntry = { catId: newId, previsto: 0, real: 0 };
    
    // Nota: Para o nome aparecer, o componente pai deve gerenciar a lista de nomes de categorias customizadas
    onSave(mesIdx, { ...mesData, gastos: [...cats, newGastoEntry] });
    setNewCatNome(""); 
    setAddCat(false);
  }

  function removeCat(catId) {
    onSave(mesIdx, { ...mesData, gastos: cats.filter(g => g.catId !== catId) });
  }

  // DATA VIZ: Preparação para o Gráfico
  const chartData = cats
    .map(g => { 
      const c = DEF_RENDA_CATS.find(x => x.id === g.catId); 
      return { 
        nome: c?.nome || "Nova Cat.", 
        real: g.real || 0, 
        previsto: g.previsto || 0 
      }; 
    })
    .filter(x => x.real > 0 || x.previsto > 0)
    .sort((a, b) => b.real - a.real)
    .slice(0, 8);

  return (
    <div style={P.root}>
      <PageHeader title="Minha Renda" subtitle="Controle financeiro mensal" />

      {/* Seletor de mês */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
        {MESES.map((m, i) => (
          <button 
            key={i} 
            onClick={() => setMesIdx(i)}
            style={{ 
              padding: "6px 12px", borderRadius: 20, border: "1px solid", 
              fontSize: 12, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", 
              background: mesIdx === i ? T.accent : "transparent", 
              color: mesIdx === i ? "#000" : i === hoje.getMonth() ? "#F5C518" : "#555", 
              borderColor: mesIdx === i ? T.accent : i === hoje.getMonth() ? "#F5C51855" : "#222" 
            }}
          >
            {m.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={P.kpiRow} className="kpi-row">
        <div style={P.kpiCard}>
          <div style={P.kpiLabel}>Receita Total</div>
          <div style={{ ...P.kpiValue, color: "#F5C518" }}>{fmt(totalReceita)}</div>
        </div>
        <div style={P.kpiCard}>
          <div style={P.kpiLabel}>Gastos Reais</div>
          <div style={{ ...P.kpiValue, color: totalReal > totalPrevisto ? "#ef4444" : "#fff" }}>{fmt(totalReal)}</div>
        </div>
        <div style={P.kpiCard}>
          <div style={P.kpiLabel}>Saldo</div>
          <div style={{ ...P.kpiValue, color: saldoOk ? "#22c55e" : "#ef4444" }}>{fmt(saldo)}</div>
        </div>
        <div style={P.kpiCard}>
          <div style={P.kpiLabel}>% Comprometido</div>
          <div style={{ ...P.kpiValue, color: comprometido > 80 ? "#ef4444" : comprometido > 60 ? "#F5C518" : "#22c55e" }}>
            {comprometido.toFixed(1)}%
          </div>
        </div>
      </div>

      <div style={{ ...P.grid2, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", marginBottom: 16 }}>
        {/* Receitas */}
        <div style={P.chartCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={P.chartTitle}>💰 Receitas</div>
            <BtnSec style={{ fontSize: 11, padding: "4px 8px" }} onClick={() => setEditReceita(e => !e)}>
              {editReceita ? "✓ Fechar" : "✏️ Editar"}
            </BtnSec>
          </div>
          {[{ key: "salario", label: "Salário", icon: "👔" }, { key: "freelance", label: "Freelance", icon: "💡" }, { key: "outros", label: "Outros", icon: "📦" }].map(({ key, label, icon }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
              <span style={{ fontSize: 18, width: 28 }}>{icon}</span>
              <span style={{ flex: 1, color: "#ccc", fontSize: 13 }}>{label}</span>
              {editReceita ? (
                <input 
                  type="number" 
                  defaultValue={mesData.receitas?.[key] || 0}
                  onBlur={e => updateReceita(key, e.target.value)}
                  style={{ ...P.input, width: 120, textAlign: "right", fontSize: 13 }} 
                />
              ) : (
                <span style={{ color: "#F5C518", fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace", fontSize: 14 }}>
                  {fmt(mesData.receitas?.[key] || 0)}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Gráfico de Gastos */}
        <div style={P.chartCard}>
          <div style={P.chartTitle}>📊 Gastos por Categoria</div>
          {chartData.length === 0 ? (
            <div style={{ color: "#444", fontSize: 12, fontFamily: "'IBM Plex Mono',monospace", padding: "20px 0" }}>Nenhum gasto lançado.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `R$${(v / 1000).toFixed(1)}k`} tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nome" tick={{ fill: "#aaa", fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} iconType="square" iconSize={7} />
                <Bar dataKey="previsto" name="Previsto" fill="#333" radius={[0, 3, 3, 0]} />
                <Bar dataKey="real" name="Real" fill="#F5C518" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div style={{ ...P.chartCard, marginTop: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div style={P.chartTitle}>💸 Lançamento — {MESES[mesIdx]}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <BtnSec style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => setAddCat(true)}>+ Categoria</BtnSec>
          </div>
        </div>

        {addCat && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14, padding: 12, background: "#0a0a0a", borderRadius: 8, border: "1px solid #2a2a2a" }}>
            <input 
              style={{ ...P.input, flex: 1 }} 
              placeholder="Nome da categoria" 
              value={newCatNome}
              onChange={e => setNewCatNome(e.target.value)} 
              onKeyDown={e => e.key === "Enter" && addNewCat()} 
              autoFocus 
            />
            <Btn onClick={addNewCat}>Adicionar</Btn>
            <BtnSec onClick={() => setAddCat(false)}>Cancelar</BtnSec>
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={P.table}>
            <thead>
              <tr>
                <th style={P.th}>Categoria</th>
                <th style={{ ...P.th, textAlign: "right" }}>Previsto</th>
                <th style={{ ...P.th, textAlign: "right" }}>Real</th>
                <th style={{ ...P.th, textAlign: "right" }}>Diferença</th>
                <th style={{ ...P.th, textAlign: "right" }}>% Total</th>
                <th style={P.th}></th>
              </tr>
            </thead>
            <tbody>
              {cats.map(g => {
                const cat = DEF_RENDA_CATS.find(c => c.id === g.catId);
                const diff = (g.real || 0) - (g.previsto || 0);
                const pct = totalReal > 0 ? ((g.real || 0) / totalReal * 100) : 0;
                return (
                  <tr key={g.catId} style={P.tr}>
                    <td style={{ ...P.td, color: "#fff" }}>{cat?.icone || "📦"} {cat?.nome || "Nova Cat."}</td>
                    <td style={{ ...P.td, textAlign: "right" }}>
                      <input 
                        type="number" 
                        value={g.previsto || 0}
                        onChange={e => updateGasto(g.catId, "previsto", e.target.value)}
                        style={{ background: "transparent", border: "none", color: "#777", textAlign: "right", width: 80, outline: "none" }} 
                      />
                    </td>
                    <td style={{ ...P.td, textAlign: "right" }}>
                      <input 
                        type="number" 
                        value={g.real || 0}
                        onChange={e => updateGasto(g.catId, "real", e.target.value)}
                        style={{ background: "transparent", border: "none", borderBottom: "1px solid #F5C518", color: "#fff", textAlign: "right", width: 80, outline: "none", fontWeight: 600 }} 
                      />
                    </td>
                    <td style={{ ...P.td, textAlign: "right", color: diff > 0 ? "#ef4444" : "#22c55e", fontWeight: 600 }}>
                      {diff !== 0 ? (diff > 0 ? `+${fmt(diff)}` : fmt(diff)) : "—"}
                    </td>
                    <td style={{ ...P.td, textAlign: "right", color: "#555" }}>{pct.toFixed(1)}%</td>
                    <td style={P.td}>
                      <button style={{ background: "none", border: "none", color: "#444", cursor: "pointer" }} onClick={() => removeCat(g.catId)}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}