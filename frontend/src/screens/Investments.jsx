import { useState } from "react";
import { P, T } from "../styles/theme";
import { TYPES, getType } from "../utils/constants";
import { fmt, fmtP, fmtD } from "../utils/formatters";
import { getIRAlert, getVencAlert } from "../utils/calculations";
import { Btn, BtnSec, IBtn, Chip } from "../components/common/Buttons";
import { Icon } from "../components/common/Icon";
import { PageHeader, Empty, Met } from "../components/common";

/**
 * ScreenInvestments: Gerencia a listagem e filtros de ativos.
 */
export function ScreenInvestments({ invs, cats, projs, fx, isMobile, onAdd, onEdit, onDel, onDep, onExJSON, onExCSV, onImport }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

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
        <input style={P.search} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          <Chip 
            label="Todos" 
            active={filter === "all"} 
            onClick={() => setFilter("all")} 
          />
          {TYPES.filter(t => invs.some(i => i.tipo === t.id)).map(t => (
            <Chip 
              key={t.id} 
              label={`${t.icon} ${t.label}`} 
              active={filter === t.id} 
              onClick={() => setFilter(t.id)} 
              color={t.color} 
            />
          ))}
        </div>
      </div>

      {filtered.length === 0
        ? <Empty>Nenhum investimento encontrado.</Empty>
        : (
          <div style={P.cardGrid}>
            {filtered.map(inv => (
              <InvCard key={inv.id} inv={inv} cats={cats} fx={fx} onEdit={onEdit} onDel={onDel} onDep={onDep} />
            ))}
          </div>
        )
      }
    </div>
  );
}

/**
 * InvCard: Renderiza cada card individualmente.
 * Raciocínio Arquitetural: 
 * Prioriza a cotação vinda do 'fx' se o ativo possuir um 'symbol'.
 * Caso contrário, utiliza o valor nominal multiplicado pelo câmbio da moeda.
 */
function InvCard({ inv, cats, fx, onEdit, onDel, onDep }) {
  const t = getType(inv.tipo);
  const cat = cats.find(c => c.id === inv.categoriaId);
  const last = inv.months?.[11];
  
  // 1. Busca cotação específica (Ações/FIIs/Crypto) ou Câmbio (USD/EUR)
  // Normalizamos para maiúsculas para evitar erros de busca no objeto fx
  const ticker = inv.symbol?.trim().toUpperCase();
  const currentPrice = ticker ? (fx[ticker] || 0) : 0;
  
  const fxRate = t.currency ? (fx[t.currency] || 1) : 1;
  
  // 2. Cálculo do Patrimônio Atualizado (BRL)
  const isVariable = ["stock", "fii", "crypto"].includes(inv.tipo?.toLowerCase());
  
  const valBRL = isVariable && ticker
    ? (inv.quantidade || 0) * (currentPrice || inv.valor) // Fallback para o valor de compra se a cotação falhar
    : (inv.valor || 0) * fxRate;

  // 3. Métricas de Rendimento (Baseadas na projeção de 12 meses)
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
              {t.label}{t.currency && ` · ${t.currency}`} {ticker && ` · ${ticker}`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <IBtn onClick={() => onDep(inv)} title="Registrar aporte" iconName="deposit" />
          <IBtn onClick={() => onEdit(inv)} title="Editar" iconName="edit" />
          <IBtn onClick={() => onDel(inv.id)} title="Remover" iconName="trash" />
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
        {cat && (
          <span style={{ ...P.pill, borderColor: `${cat.cor}66`, color: cat.cor, fontSize: 11 }}>{cat.nome}</span>
        )}
        {vencAlert && (
          <span style={{ ...P.pill, borderColor: "#F5C51866", color: "#F5C518" }}>🔔 Vence em {vencAlert.diasAte}d</span>
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
        {/* Mostra o preço da cotação se for variável, ou valor investido se for fixa */}
        <Met 
          label={ticker ? "Cotação Atual" : (t.currency ? `Valor (${t.currency})` : "Investido")} 
          value={ticker ? (currentPrice > 0 ? fmt(currentPrice) : "---") : (t.currency ? `${t.currency} ${inv.valor.toFixed(2)}` : fmt(inv.valor))} 
        />
        
        <Met label="Patrimônio (BRL)" value={fmt(valBRL)} accent="#9a9080" />
        
        <Met label={t.intl ? "Retorno a.a." : "% CDI / Taxa"} value={fmtP(inv.pct)} />
        
        <Met label="Saldo 12m" value={fmt(last?.saldoLiquido ?? 0)} accent="#22c55e" />
        <Met label="Rend. líq." value={`+${fmt(gain)}`} accent="#22c55e" />
        
        <Met 
          label="Retorno %" 
          value={`+${gainPct.toFixed(2)}%`} 
          accent={gainPct > 50 ? "#ef4444" : "#60a5fa"} 
        />
        
        {t.ir && <Met label="IR 12m" value={`-${fmt(last?.ir ?? 0)}`} accent="#ef4444" />}
      </div>

      <div style={{ fontSize: 11, color: "#666", fontFamily: "'IBM Plex Mono',monospace", marginTop: 10 }}>
        Início: {fmtD(inv.data)}{inv.vencimento ? ` · Vence: ${fmtD(inv.vencimento)}` : ""}
      </div>
    </div>
  );
}