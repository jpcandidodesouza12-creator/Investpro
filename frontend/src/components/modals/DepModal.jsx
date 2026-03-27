import { useState } from "react";
import { M, P } from "../../styles/theme";
import { getType } from "../../utils/constants";
import { Btn, BtnCancel } from "../common/Buttons";
import { Overlay, ModalBox } from "./ModalBase";

export function DepModal({ data, invs, isMobile, onSave, onClose }) {
  const [form, setForm] = useState({
    invId: data.invId || invs[0]?.id || null,
    valor: "",
    data:  new Date().toISOString().split("T")[0],
    obs:   "",
  });

  return (
    <Overlay onClose={onClose} isMobile={isMobile}>
      <ModalBox isMobile={isMobile} maxW={400}>
        <div style={M.title}>💰 Registrar Aporte</div>

        <label style={P.label}>Investimento</label>
        <select style={{ ...P.input, cursor:"pointer" }}
          value={form.invId || ""}
          onChange={e => setForm(f => ({ ...f, invId:parseInt(e.target.value) }))}>
          {invs.map(inv => {
            const t = getType(inv.tipo);
            return <option key={inv.id} value={inv.id}>{t.icon} {inv.nome}</option>;
          })}
        </select>

        <label style={P.label}>Valor (R$)</label>
        <input style={P.input} type="number" value={form.valor}
          onChange={e => setForm(f => ({ ...f, valor:e.target.value }))} placeholder="1000" />

        <label style={P.label}>Data</label>
        <input style={{ ...P.input, colorScheme:"dark" }} type="date" value={form.data}
          onChange={e => setForm(f => ({ ...f, data:e.target.value }))} />

        <label style={P.label}>Observação (opcional)</label>
        <input style={P.input} value={form.obs}
          onChange={e => setForm(f => ({ ...f, obs:e.target.value }))} placeholder="Ex: Aporte mensal" />

        <div style={{ background:"#0e1520", border:"1px solid #1e3050", borderRadius:6, padding:"8px 12px", fontSize:11, color:"#7eb8e2", fontFamily:"'IBM Plex Mono',monospace", marginTop:6 }}>
          💡 O valor será somado ao saldo do investimento.
        </div>

        <div style={M.actions}>
          <BtnCancel onClick={onClose}>Cancelar</BtnCancel>
          <Btn onClick={() => onSave(form)}>Registrar</Btn>
        </div>
      </ModalBox>
    </Overlay>
  );
}
