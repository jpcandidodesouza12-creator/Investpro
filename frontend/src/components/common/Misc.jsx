import { useState } from "react";
import { P, T } from "../../styles/theme";
import { Btn, BtnCancel, BtnSec } from "./Buttons";
import { Icon } from "./Icon";

export function Empty({ children }) {
  return (
    <div style={P.empty}>
      <div style={{ fontSize:32, marginBottom:12, opacity:.3 }}>◎</div>
      {children}
    </div>
  );
}

export function Muted({ children }) {
  return (
    <div style={{ color:T.textMuted, fontSize:12, fontFamily:T.mono, padding:"16px 0" }}>
      {children}
    </div>
  );
}

export function RoleBadge({ role }) {
  const map = {
    admin: { label:"Admin",     bg:"#F5C51822", color:"#F5C518" },
    user:  { label:"Usuário",   bg:"#3b82f622", color:"#60a5fa" },
    guest: { label:"Convidado", bg:"#22222244", color:"#888888" },
  };
  const r = map[role] || map.guest;
  return (
    <span style={{ fontSize:10, fontWeight:700, fontFamily:T.mono, textTransform:"uppercase", letterSpacing:1, background:r.bg, color:r.color, padding:"3px 9px", borderRadius:20 }}>
      {r.label}
    </span>
  );
}

export function AlertRow({ name, sub, badge, badgeColor, urgent }) {
  return (
    <div style={{ display:"flex", alignItems:"center", padding:"12px 14px", marginBottom:8, background:T.bg, border:`1px solid ${urgent ? `${badgeColor}33` : T.border}`, borderRadius:10, gap:12, transition:"border-color .2s" }}>
      <div style={{ width:8, height:8, borderRadius:50, background:badgeColor, flexShrink:0, boxShadow:urgent ? `0 0 8px ${badgeColor}66` : "none" }} />
      <div style={{ flex:1 }}>
        <div style={{ color:T.text, fontWeight:600, fontSize:13 }}>{name}</div>
        <div style={{ color:"#555", fontSize:11, fontFamily:T.mono, marginTop:2 }}>{sub}</div>
      </div>
      <div style={{ color:badgeColor, fontWeight:700, fontFamily:T.mono, fontSize:12, background:`${badgeColor}18`, padding:"3px 10px", borderRadius:20 }}>
        {badge}
      </div>
    </div>
  );
}

export function Met({ label, value, accent }) {
  return (
    <div style={P.metricBox}>
      <div style={P.metricLabel}>{label}</div>
      <div style={{ ...P.metricValue, ...(accent ? { color:accent } : {}) }}>{value}</div>
    </div>
  );
}

export function Chip({ active, onClick, color, children }) {
  const c = color || T.accent;
  return (
    <button
      style={{ ...P.chip, ...(active ? { borderColor:c, color:c, background:`${c}22`, fontWeight:600 } : {}) }}
      onClick={onClick}>
      {children}
    </button>
  );
}

export function SnapRestoreBtn({ snap, onRestore }) {
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        <span style={{ fontSize:11, color:T.accent, fontFamily:T.mono }}>Confirmar?</span>
        <Btn onClick={() => { onRestore(snap); setConfirm(false); }}>Sim</Btn>
        <BtnCancel onClick={() => setConfirm(false)}>Não</BtnCancel>
      </div>
    );
  }

  return (
    <button
      style={{ ...P.btnSec, padding:"6px 14px", fontSize:11, display:"flex", alignItems:"center", gap:6 }}
      onClick={() => setConfirm(true)}>
      <Icon name="restore" size={13} /> Restaurar
    </button>
  );
}
