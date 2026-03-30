import { useState } from "react";
import { P, T } from "../styles/theme";
import { DEF_QUOTES } from "../utils/constants";
import { fmtP } from "../utils/formatters";
import { Btn, BtnSec, PageHeader, Muted } from "../components/common";
import { Icon } from "../components/common/Icon";

const SECTIONS = [
  { key:"currencies", label:"💵 Moedas",     unit:"BRL", color:"#F5C518", hint:"USD, EUR, GBP..." },
  { key:"br",         label:"📈 Ações BR",   unit:"BRL", color:"#22c55e", hint:"PETR4, VALE3..."  },
  { key:"us",         label:"🇺🇸 Ações EUA", unit:"USD", color:"#60a5fa", hint:"AAPL, MSFT..."    },
  { key:"crypto",     label:"₿ Crypto",      unit:"USD", color:"#f7931a", hint:"BTC, ETH..."      },
];

function fmtQuote(val) {
  if (val == null) return "—";
  if (val >= 1000) return val.toLocaleString("pt-BR", { maximumFractionDigits:0 });
  return val.toLocaleString("pt-BR", { minimumFractionDigits:2, maximumFractionDigits:2 });
}

function changePctColor(pct) {
  if (pct == null) return "#555";
  return pct >= 0 ? "#22c55e" : "#ef4444";
}

function changePctStr(pct) {
  if (pct == null) return "—";
  return (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%";
}

export function ScreenQuotes({ quotes, isMobile, onFetch, onUpdateWatchlist, qLoading }) {
  const [editSection, setEditSection] = useState(null);
  const [editInput,   setEditInput]   = useState("");

  const wl   = quotes?.watchlist || DEF_QUOTES.watchlist;
  const data = quotes?.data      || { currencies:{}, br:{}, us:{}, crypto:{} };

  function startEdit(key) {
    setEditSection(key);
    setEditInput((wl[key] || []).join(", "));
  }

  function saveEdit(key) {
    const tickers = editInput.split(/[,\s]+/).map(t => t.trim().toUpperCase()).filter(Boolean);
    onUpdateWatchlist(key, tickers);
    setEditSection(null);
  }

  return (
    <div style={P.root}>
      <PageHeader title="Cotações" subtitle="Dados oficiais — BCB (CDI, PTAX) + Brapi (B3, Crypto)">
        <Btn onClick={onFetch} disabled={qLoading}>
          {qLoading
            ? "Buscando..."
            : <span style={{ display:"flex", alignItems:"center", gap:7 }}><Icon name="refresh" size={14}/> Atualizar</span>
          }
        </Btn>
      </PageHeader>

      {/* Status */}
      {quotes?.updatedAt && (
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, color:"#555", fontFamily:"'IBM Plex Mono',monospace" }}>
            Última atualização: {quotes.updatedAt}
          </span>
          {data.cached && (
            <span style={{ fontSize:11, background:"#1a1a00", border:"1px solid #F5C51833", color:"#F5C518", fontFamily:"'IBM Plex Mono',monospace", padding:"2px 10px", borderRadius:20 }}>
              cache ativo
            </span>
          )}
          {data.source && (
            <span style={{ fontSize:11, color:"#333", fontFamily:"'IBM Plex Mono',monospace" }}>fonte: {data.source}</span>
          )}
        </div>
      )}

      {/* CDI Card */}
      {data.cdi && (
        <div style={{ background:"#111", border:"1px solid #F5C51844", borderRadius:14, padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
          <div style={{ fontSize:32 }}>📡</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:1.5, fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>Taxa CDI — Banco Central do Brasil</div>
            <div style={{ fontSize:28, fontWeight:800, color:"#F5C518", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:-1 }}>
              {fmtP(data.cdi)}
              <span style={{ fontSize:13, color:"#555", marginLeft:8, fontWeight:400 }}>ao ano</span>
            </div>
          </div>
          <div style={{ background:"#001a00", border:"1px solid #22c55e33", borderRadius:8, padding:"6px 14px", fontSize:11, color:"#22c55e", fontFamily:"'IBM Plex Mono',monospace" }}>
            ✓ Sincronizado com o portfólio
          </div>
        </div>
      )}

      {/* Erro */}
      {quotes?.error && (
        <div style={{ background:"#1a0000", border:"1px solid #ef444433", borderRadius:10, padding:"14px 16px", marginBottom:20, fontSize:11, color:"#f87171", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.8 }}>
          <strong>✗ Erro na última busca:</strong><br/>
          {quotes.error}<br/>
          <span style={{ color:"#555" }}>Tente novamente ou verifique sua conexão.</span>
        </div>
      )}

      {/* Estado inicial */}
      {!quotes?.updatedAt && !quotes?.error && (
        <div style={{ background:"#111", border:"1px solid #222", borderRadius:10, padding:"14px 18px", marginBottom:20, fontSize:12, color:"#888", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.7 }}>
          Clique em <strong style={{ color:"#F5C518" }}>Atualizar</strong> para buscar cotações oficiais do BCB e B3.<br/>
          <span style={{ color:"#444", fontSize:11 }}>Gratuito · Sem chave de API · Cache de 30 minutos.</span>
        </div>
      )}

      {/* Seções de cotações */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:14 }}>
        {SECTIONS.map(sec => (
          <div key={sec.key} style={{ ...P.chartCard, borderColor:`${sec.color}22` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ ...P.chartTitle, color:sec.color }}>{sec.label}</div>
              {editSection !== sec.key
                ? <button style={{ ...P.iBtn, fontSize:11, display:"flex", alignItems:"center", gap:5 }} onClick={() => startEdit(sec.key)}>
                    <Icon name="edit" size={12}/> Editar
                  </button>
                : <div style={{ display:"flex", gap:6 }}>
                    <button style={{ ...P.btn, padding:"4px 12px", fontSize:11 }} onClick={() => saveEdit(sec.key)}>Salvar</button>
                    <button style={{ ...P.btnCancel, padding:"4px 10px", fontSize:11 }} onClick={() => setEditSection(null)}>✕</button>
                  </div>
              }
            </div>

            {editSection === sec.key && (
              <div style={{ marginBottom:12 }}>
                <input style={{ ...P.input, fontSize:12 }} value={editInput}
                  onChange={e => setEditInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveEdit(sec.key)}
                  placeholder={sec.hint} autoFocus />
                <div style={{ fontSize:10, color:"#444", fontFamily:"'IBM Plex Mono',monospace", marginTop:5 }}>
                  Separe com vírgulas. Ex: {sec.hint}
                </div>
              </div>
            )}

            <table style={{ ...P.table, tableLayout:"fixed" }}>
              <thead><tr>
                <th style={{ ...P.th, width:"40%" }}>ATIVO</th>
                <th style={{ ...P.th, textAlign:"right" }}>PREÇO</th>
                <th style={{ ...P.th, textAlign:"right" }}>VAR. %</th>
              </tr></thead>
              <tbody>
                {(wl[sec.key] || []).map(ticker => {
                  const q   = data[sec.key]?.[ticker];
                  const pct = q?.changePct;
                  return (
                    <tr key={ticker} style={P.tr} className="tr-hover">
                      <td style={{ ...P.td, color:"#fff", fontWeight:600 }}>
                        {ticker}
                        <span style={{ fontSize:9, color:"#444", marginLeft:4 }}>{sec.unit}</span>
                      </td>
                      <td style={{ ...P.td, textAlign:"right", fontFamily:"'IBM Plex Mono',monospace", color: q ? "#fff" : "#333" }}>
                        {q ? fmtQuote(q.price) : "— —"}
                      </td>
                      <td style={{ ...P.td, textAlign:"right", color: changePctColor(pct), fontFamily:"'IBM Plex Mono',monospace", fontWeight: pct != null ? 600 : 400 }}>
                        {changePctStr(pct)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
