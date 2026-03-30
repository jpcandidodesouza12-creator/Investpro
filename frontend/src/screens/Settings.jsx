import { useState, useEffect } from "react";
import { P, T } from "../styles/theme";
import { FX_DEFAULT, CDI_REF } from "../utils/constants";
import { fmt, fmtP } from "../utils/formatters";
import { Btn, PageHeader, SnapRestoreBtn } from "../components/common";

export function ScreenSettings({ settings, isMobile, onSave, snaps, onRestore }) {
  const [form, setForm] = useState({
    cdiRate: settings.cdiRate,
    fx:      { ...FX_DEFAULT, ...settings.fx },
    meta:    { ativa:false, valor:100000, prazo:24, ...settings.meta },
  });

  useEffect(() => {
    setForm(f => ({ ...f, cdiRate: settings.cdiRate }));
  }, [settings.cdiRate]);

  return (
    <div style={P.root}>
      <PageHeader title="Configurações" subtitle="Personalize os parâmetros" />
      <div style={{ maxWidth:520 }}>

        {/* ── Taxa CDI ── */}
        <div style={P.setCard}>
          <div style={P.setTitle}>📡 Taxa CDI</div>
          <div style={{ display:"flex", gap:16, background:"#0e0d0b", border:"1px solid #2a2820", borderRadius:10, padding:16, marginBottom:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:28, fontWeight:800, color:"#F5C518", fontFamily:"'IBM Plex Mono',monospace" }}>{fmtP(settings.cdiRate)}</div>
              <div style={{ fontSize:10, color:"#555", textTransform:"uppercase", fontFamily:"'IBM Plex Mono',monospace", marginTop:4 }}>CDI atual a.a. · {CDI_REF}</div>
            </div>
            <div style={{ background:"#13120f", border:"1px solid #1e1c16", borderRadius:8, padding:"10px 14px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:20 }}>📡</span>
              <span style={{ fontSize:9, color:"#555", fontFamily:"'IBM Plex Mono',monospace", marginTop:4 }}>BCB</span>
            </div>
          </div>
          <div style={{ background:"#0a1a0a", border:"1px solid #22c55e33", borderRadius:6, padding:"9px 12px", fontSize:11, color:"#22c55e", fontFamily:"'IBM Plex Mono',monospace", marginBottom:10 }}>
            ✓ CDI atualizado via Banco Central ao usar a tela de Cotações.
          </div>
          <label style={P.label}>Ajuste manual (% a.a.)</label>
          <div style={{ display:"flex", gap:10 }}>
            <input style={{ ...P.input, flex:1 }} type="number" step="0.01" value={form.cdiRate}
              onChange={e => setForm(f => ({ ...f, cdiRate: parseFloat(e.target.value)||0 }))} />
            <Btn onClick={() => onSave(form)}>Salvar</Btn>
          </div>
        </div>

        {/* ── Câmbio ── */}
        <div style={P.setCard}>
          <div style={P.setTitle}>🌍 Câmbio USD / EUR</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            {[["USD","🇺🇸","#60a5fa"],["EUR","🇪🇺","#a78bfa"]].map(([cur, flag, color]) => (
              <div key={cur} style={{ background:"#0e0d0b", border:"1px solid #2a2820", borderRadius:8, padding:"12px 14px" }}>
                <div style={{ fontSize:10, color:"#555", fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>{flag} {cur} / BRL</div>
                <div style={{ fontSize:22, fontWeight:800, color, fontFamily:"'IBM Plex Mono',monospace" }}>R${form.fx[cur]?.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"#0a1a0a", border:"1px solid #22c55e33", borderRadius:6, padding:"9px 12px", fontSize:11, color:"#22c55e", fontFamily:"'IBM Plex Mono',monospace", marginBottom:10 }}>
            ✓ USD/EUR atualizados via PTAX do BCB ao usar a tela de Cotações.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["USD","USD manual"],["EUR","EUR manual"]].map(([cur, label]) => (
              <div key={cur}>
                <label style={P.label}>{label}</label>
                <input style={P.input} type="number" step="0.01" value={form.fx[cur]}
                  onChange={e => setForm(f => ({ ...f, fx:{ ...f.fx, [cur]:parseFloat(e.target.value)||f.fx[cur] } }))} />
              </div>
            ))}
          </div>
          <div style={{ marginTop:12 }}>
            <Btn onClick={() => onSave(form)}>Salvar Câmbio</Btn>
          </div>
        </div>

        {/* ── Meta ── */}
        <div style={P.setCard}>
          <div style={P.setTitle}>🎯 Meta de Patrimônio</div>
          <label style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, cursor:"pointer" }}>
            <input type="checkbox" checked={form.meta?.ativa ?? false}
              onChange={e => setForm(f => ({ ...f, meta:{ ...f.meta, ativa:e.target.checked } }))}
              style={{ width:16, height:16, accentColor:"#b77ee2" }} />
            <span style={{ color:"#ccc", fontSize:13 }}>Ativar meta de patrimônio</span>
          </label>
          {form.meta?.ativa && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={P.label}>Valor meta (R$)</label>
                <input style={P.input} type="number" value={form.meta.valor}
                  onChange={e => setForm(f => ({ ...f, meta:{ ...f.meta, valor:parseFloat(e.target.value)||0 } }))} />
              </div>
              <div>
                <label style={P.label}>Prazo (meses)</label>
                <input style={P.input} type="number" value={form.meta.prazo}
                  onChange={e => setForm(f => ({ ...f, meta:{ ...f.meta, prazo:parseInt(e.target.value)||0 } }))} />
              </div>
            </div>
          )}
          <div style={{ marginTop:12 }}><Btn onClick={() => onSave(form)}>Salvar Meta</Btn></div>
        </div>

        {/* ── Tabela IR ── */}
        <div style={P.setCard}>
          <div style={P.setTitle}>📊 Tabela IR Regressiva</div>
          {[["Até 180 dias","22,5%","Curto prazo"],["181–360 dias","20,0%","Médio prazo"],["361–720 dias","17,5%","Longo prazo"],["Acima de 720 dias","15,0%","Muito longo prazo"]].map(([l, a, d]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #191714" }}>
              <div>
                <div style={{ color:"#ccc", fontSize:13 }}>{l}</div>
                <div style={{ color:"#555", fontSize:11, fontFamily:"'IBM Plex Mono',monospace" }}>{d}</div>
              </div>
              <span style={{ color:"#ef4444", fontWeight:700, fontFamily:"'IBM Plex Mono',monospace" }}>{a}</span>
            </div>
          ))}
          <div style={{ color:"#444", fontSize:11, fontFamily:"'IBM Plex Mono',monospace", marginTop:8, fontStyle:"italic" }}>
            * LCI/LCA e Bolsa são isentos de IR.
          </div>
        </div>

        {/* ── Snapshots ── */}
        <div style={P.setCard}>
          <div style={P.setTitle}>🕐 Versões Anteriores</div>
          {(!snaps || snaps.length === 0)
            ? <div style={{ color:"#444", fontSize:12, fontFamily:"'IBM Plex Mono',monospace" }}>Nenhuma versão salva ainda.</div>
            : (
              <>
                <div style={{ color:"#555", fontSize:11, fontFamily:"'IBM Plex Mono',monospace", marginBottom:12 }}>
                  {snaps.length} versão{snaps.length!==1?"ões":""} salva{snaps.length!==1?"s":""}. Limite: 10.
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {snaps.map((snap, i) => {
                    const d    = new Date(snap.ts);
                    const date = d.toLocaleDateString("pt-BR");
                    const time = d.toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
                    return (
                      <div key={snap.ts} style={{ display:"flex", alignItems:"center", gap:12, background:"#0e0d0b", border:"1px solid #2a2820", borderRadius:8, padding:"10px 14px" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ color:"#ccc", fontSize:13, fontWeight:600 }}>{date} às {time}</div>
                          <div style={{ color:"#444", fontSize:11, fontFamily:"'IBM Plex Mono',monospace", marginTop:2 }}>{snap.label}{i===0?" · versão anterior":""}</div>
                        </div>
                        <SnapRestoreBtn snap={snap} onRestore={onRestore} />
                      </div>
                    );
                  })}
                </div>
              </>
            )
          }
        </div>

      </div>
    </div>
  );
}
