import { useState, useRef } from "react";
import { M, P, T } from "../../styles/theme";
import { Btn, BtnCancel } from "../common/Buttons";
import { Overlay, ModalBox } from "./ModalBase";

export function ImportModal({ isMobile, onImport, onClose }) {
  const [drag,   setDrag]   = useState(false);
  const [error,  setError]  = useState("");
  const fileRef             = useRef(null);

  function processFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.investments && !data.categories) {
          setError("Arquivo inválido — formato não reconhecido.");
          return;
        }
        onImport(data);
      } catch {
        setError("Arquivo inválido — não é um JSON válido.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <Overlay onClose={onClose} isMobile={isMobile}>
      <ModalBox isMobile={isMobile} maxW={460}>
        <div style={M.title}>⬆ Importar Dados</div>

        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); processFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          style={{ border:`2px dashed ${drag ? T.accent : T.border2}`, borderRadius:10, padding:"32px 20px", textAlign:"center", cursor:"pointer", background:drag ? T.accentDim : "transparent", transition:"all .15s", marginBottom:12 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📁</div>
          <div style={{ color:T.text, fontSize:14 }}>Arraste o arquivo aqui</div>
          <div style={{ color:T.textMuted, fontSize:12, marginTop:4 }}>ou clique para selecionar (.json)</div>
          <input ref={fileRef} type="file" accept=".json" style={{ display:"none" }}
            onChange={e => processFile(e.target.files[0])} />
        </div>

        {error && (
          <div style={{ background:"#1a0000", border:"1px solid #ef444433", borderRadius:9, padding:"10px 14px", fontSize:13, color:"#f87171", fontFamily:T.mono, marginBottom:12 }}>
            {error}
          </div>
        )}

        <div style={M.actions}>
          <BtnCancel onClick={onClose}>Cancelar</BtnCancel>
        </div>
      </ModalBox>
    </Overlay>
  );
}
