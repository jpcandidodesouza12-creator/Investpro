import { useState } from "react";
import { P } from "../styles/theme";
import { TYPES, getType } from "../utils/constants";
import { fmt, fmtP, fmtD } from "../utils/formatters";
import { getIRAlert, getVencAlert } from "../utils/calculations";

// ARQUITETURA: Centralização de imports via Barrel File (common/index.js)
// Resolve o erro do 'Chip' que não estava no arquivo 'Buttons.jsx'
import { 
  Btn, 
  BtnSec, 
  IBtn, 
  Chip, 
  Icon, 
  PageHeader, 
  Empty, 
  Met 
} from "../components/common";

export function ScreenInvestments({ invs, cats, projs, fx, onAdd, onEdit, onDel, onDep, onExJSON, onExCSV, onImport }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // LÓGICA: Filtro memoizado por execução (Pode ser envolvido em useMemo se projs for massivo)
  const filtered = projs.filter(inv =>
    (filter === "all" || inv.tipo === filter) &&
    inv.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={P.root}>
      <PageHeader title="Investimentos" subtitle={`${invs.length} ativo${invs.length !== 1 ? "s" : ""}`}>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <BtnSec onClick={onImport}><Icon name="upload" size={13} /> Importar</BtnSec>
          <BtnSec onClick={onExCSV}><Icon name="download" size={13} /> CSV</BtnSec>
          <BtnSec onClick={onExJSON}><Icon name="download" size={13} /> JSON</BtnSec>
          <Btn onClick={onAdd}>+ Novo</Btn>
        </div>
      </PageHeader>

      <div style={P.filterRow}>
        <input 
          style={P.search} 
          placeholder="Buscar..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>Todos</Chip>
          {TYPES.filter(t => invs.some(i => i.tipo === t.id)).map(t => (
            <Chip 
              key={t.id} 
              active={filter === t.id} 
              onClick={() => setFilter(t.id)} 
              color={t.color}
            >
              {t.icon} {t.label}
            </Chip>
          ))}
        </div>
      </div>

      {filtered.length === 0
        ? <Empty>Nenhum investimento encontrado.</Empty>
        : (
          <div style={P.cardGrid}>
            {filtered.map(inv => (
              <InvCard 
                key={inv.id} 
                inv={inv} 
                cats={cats} 
                fx={fx} 
                onEdit={onEdit} 
                onDel={onDel} 
                onDep={onDep} 
              />
            ))}
          </div>
        )
      }
    </div>
  );
}

function InvCard({ inv, cats, fx, onEdit, onDel, onDep }) {
  const t = getType(inv.tipo);
  const cat = cats.find(c => c.id === inv.categoriaId);
  const last = inv.months?.[11];
  
  // CÁLCULOS: Conversão de moeda e rentabilidade
  const fxRate = t.currency ? (fx[t.currency] || 1) : 1;
  const valBRL = inv.valor * fxRate;
  const gain = last?.rendLiquido ?? 0;
  const gainPct = valBRL > 0 ? (gain / valBRL) * 100 : 0;
  
  const irAlert = getIRAlert(inv);
  const vencAlert = getVencAlert(inv);

  return (
    <div style={{ ...P.invCard, borderColor: `${t.color}55` }} className="card-hover">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ 
            width: 36, height: 36, borderRadius: 10, 
            background: `${t.color}22`, color: t.color, 
            display: "flex", alignItems: "center", justifyContent: "center", 
            fontSize: 18, flexShrink: 0 
          }}>
            {t.icon}
          </span>
          <div>
            <div style={{ color: "#f0ebe0", fontWeight: 700, fontSize: 14 }}>{inv.nome}</div>
            <div style={{ color: t.color, fontSize: 11, fontFamily: "'IBM Plex Mono',monospace" }}>
              {t.label}{t.currency && ` · ${t.currency}`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <IBtn onClick={() => onDep(inv)} title="Registrar aporte" iconName="deposit" />
          <IBtn onClick={() => onEdit(inv)} title="Editar" iconName="edit" />
          <IBtn onClick={() => onDel(inv.id)} title="Remover" iconName="trash" />
        </div>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL: Badges e Alertas */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
        {cat && (
          <span style={{ ...P.pill, borderColor: `${cat.cor}66`, color: cat.cor, fontSize: 11 }}>
            {cat.nome}
          </span>
        )}
        {vencAlert && (
          <span style={{ ...P.pill, borderColor: "#F5C51866", color: "#F5C518" }}>
            🔔 Vence em {vencAlert.diasAte}d
          </span>
        )}
        {irAlert && (
          <span style={{ 
            ...P.pill, 
            borderColor: irAlert.restam <= 7 ? "#ef444466" : "#F5C51866", 
            color: irAlert.restam <= 7 ? "#ef4444" : "#F5C518" 
          }}>
            ⚠️ IR: {irAlert.aliqAtual.toFixed(1)}%→{irAlert.aliqProx.toFixed(1)}% em {irAlert.restam}d
          </span>
        )}
      </div>

      <div style={P.metrics}>
        <Met 
          label={t.currency ? `Valor (${t.currency})` : "Investido"} 
          value={t.currency ? `${t.currency} ${inv.valor.toFixed(2)}` : fmt(inv.valor)} 
        />
        {t.currency && <Met label="Valor (BRL)" value={fmt(valBRL)} accent="#9a9080" />}
        <Met label={t.intl ? "Retorno a.a." : "% CDI"} value={fmtP(inv.pct)} />
        <Met label="Saldo 12m" value={fmt(last?.saldoLiquido ?? 0)} accent="#22c55e" />
        <Met label="Rend. líq." value={`+${fmt(gain)}`} accent="#22c55e" />
        <Met label="Retorno %" value={`+${gainPct.toFixed(2)}%`} accent="#60a5fa" />
        {t.ir && <Met label="IR 12m" value={`-${fmt(last?.ir ?? 0)}`} accent="#ef4444" />}
      </div>

      <div style={{ fontSize: 11, color: "#888", marginTop: 8, fontFamily: "'IBM Plex Mono',monospace" }}>
        Início: {fmtD(inv.data)}{inv.vencimento ? ` · Vence: ${fmtD(inv.vencimento)}` : ""}
      </div>
    </div>
  );
}