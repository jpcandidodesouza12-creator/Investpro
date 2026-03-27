import { useState } from "react";
import { M, P } from "../../styles/theme";
import { TYPES, getType } from "../../utils/constants";
import { Btn, BtnCancel } from "../common/Buttons";
import { Overlay, ModalBox } from "./ModalBase";

export function InvModal({ data, cats, isMobile, onSave, onClose }) {
  const [form, setForm] = useState({
    id:          data.id,
    nome:        data.nome        || "",
    tipo:        data.tipo        || "cdb",
    valor:       data.valor       ? String(data.valor) : "",
    pct:         data.pct         ? String(data.pct)   : "",
    data:        data.data        || new Date().toISOString().split("T")[0],
    vencimento:  data.vencimento  || "",
    categoriaId: data.categoriaId || null,
  });

  const t = getType(form.tipo);

  return (
    <Overlay onClose={onClose} isMobile={isMobile}>
      <ModalBox isMobile={isMobile} maxW={500}>
        <div style={M.title}>{data.id ? "Editar" : "Novo"} Investimento</div>

        <label style={P.label}>Tipo</label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, marginBottom:4 }}>
          {TYPES.map(tp => (
            <button key={tp.id}
              onClick={() => setForm(f => ({ ...f, tipo:tp.id }))}
              style={{ ...M.typeBtn, ...(form.tipo === tp.id ? { borderColor:tp.color, color:tp.color, background:`${tp.color}18` } : {}) }}>
              <span style={{ fontSize:14 }}>{tp.icon}</span>
              <span style={{ fontSize:9 }}>{tp.label}</span>
            </button>
          ))}
        </div>

        {t.intl && (
          <div style={{ background:"#0e1520", border:"1px solid #1e3050", borderRadius:6, padding:"8px 12px", fontSize:11, color:"#7eb8e2", fontFamily:"'IBM Plex Mono',monospace", marginBottom:4 }}>
            🌍 Ativo em {t.currency}. Convertido para BRL via câmbio configurado.
          </div>
        )}

        <label style={P.label}>Nome</label>
        <input style={P.input} value={form.nome}
          onChange={e => setForm(f => ({ ...f, nome:e.target.value }))}
          placeholder={`Ex: ${t.label} XP`} />

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={P.label}>Valor {t.currency ? `(${t.currency})` : "(R$)"}</label>
            <input style={P.input} type="number" value={form.valor}
              onChange={e => setForm(f => ({ ...f, valor:e.target.value }))} placeholder="10000" />
          </div>
          <div>
            <label style={P.label}>{t.intl ? "Retorno a.a. (%)" : "% CDI"}</label>
            <input style={P.input} type="number" value={form.pct}
              onChange={e => setForm(f => ({ ...f, pct:e.target.value }))} placeholder={t.intl ? "12" : "100"} />
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={P.label}>Data de Início</label>
            <input style={{ ...P.input, colorScheme:"dark" }} type="date" value={form.data}
              onChange={e => setForm(f => ({ ...f, data:e.target.value }))} />
          </div>
          <div>
            <label style={P.label}>Vencimento (opcional)</label>
            <input style={{ ...P.input, colorScheme:"dark" }} type="date" value={form.vencimento}
              onChange={e => setForm(f => ({ ...f, vencimento:e.target.value }))} />
          </div>
        </div>

        {cats?.length > 0 && (
          <>
            <label style={P.label}>Categoria (opcional)</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:8 }}>
              <button
                style={{ ...M.catChip, ...(form.categoriaId === null ? M.catChipActive : {}) }}
                onClick={() => setForm(f => ({ ...f, categoriaId:null }))}>
                Nenhuma
              </button>
              {cats.map(cat => (
                <button key={cat.id}
                  onClick={() => setForm(f => ({ ...f, categoriaId:cat.id }))}
                  style={{ ...M.catChip, ...(form.categoriaId === cat.id ? { borderColor:cat.cor, color:cat.cor, background:`${cat.cor}18` } : {}) }}>
                  {cat.nome}
                </button>
              ))}
            </div>
          </>
        )}

        {t.ir
          ? <div style={M.irNote}>⚠️ {t.label} tem IR regressivo (22,5% → 15%)</div>
          : <div style={{ ...M.irNote, borderColor:"#22c55e44", color:"#22c55e", background:"#22c55e08" }}>✓ {t.label} é isento de IR</div>
        }

        <div style={M.actions}>
          <BtnCancel onClick={onClose}>Cancelar</BtnCancel>
          <Btn onClick={() => onSave(form)}>Salvar</Btn>
        </div>
      </ModalBox>
    </Overlay>
  );
}
