import { useState } from "react";
import { M, P } from "../../styles/theme";
import { Btn, BtnCancel } from "../common/Buttons";
import { Overlay, ModalBox } from "./ModalBase";

const PRESET_COLORS = ["#F5C518","#22c55e","#60a5fa","#a78bfa","#f87171","#fb923c","#f7931a","#9a9a9a"];

export function CatModal({ data, isMobile, onSave, onClose }) {
  const [form, setForm] = useState({
    id:  data.id,
    nome:data.nome || "",
    cor: data.cor  || "#F5C518",
  });

  return (
    <Overlay onClose={onClose} isMobile={isMobile}>
      <ModalBox isMobile={isMobile} maxW={360}>
        <div style={M.title}>{data.id ? "Editar" : "Nova"} Categoria</div>

        <label style={P.label}>Nome</label>
        <input style={P.input} value={form.nome}
          onChange={e => setForm(f => ({ ...f, nome:e.target.value }))}
          onKeyDown={e => e.key === "Enter" && onSave(form)}
          placeholder="Ex: Renda Fixa" />

        <label style={P.label}>Cor</label>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
          {PRESET_COLORS.map(c => (
            <button key={c}
              onClick={() => setForm(f => ({ ...f, cor:c }))}
              style={{ width:28, height:28, borderRadius:6, background:c, border:form.cor === c ? "2px solid #fff" : "2px solid transparent", cursor:"pointer" }} />
          ))}
        </div>

        <div style={M.actions}>
          <BtnCancel onClick={onClose}>Cancelar</BtnCancel>
          <Btn onClick={() => onSave(form)}>Salvar</Btn>
        </div>
      </ModalBox>
    </Overlay>
  );
}
