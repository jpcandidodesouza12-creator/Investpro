import { P, T } from "../../styles/theme";
import { Icon } from "./Icon";

export function Btn({ onClick, children, disabled }) {
  return (
    <button
      style={{ ...P.btn, ...(disabled ? { opacity:.45, cursor:"not-allowed" } : {}) }}
      onClick={disabled ? undefined : onClick}
      className={disabled ? "" : "btn-hover"}>
      {children}
    </button>
  );
}

export function BtnSec({ onClick, children }) {
  return <button style={P.btnSec} onClick={onClick} className="btn-hover">{children}</button>;
}

export function BtnCancel({ onClick, children }) {
  return <button style={P.btnCancel} onClick={onClick}>{children}</button>;
}

export function IBtn({ onClick, title, iconName, children }) {
  return (
    <button style={P.iBtn} onClick={onClick} title={title} className="ibtn-hover">
      {iconName ? <Icon name={iconName} size={14} /> : children}
    </button>
  );
}

export function Toggle({ options, labels, value, onChange }) {
  return (
    <div style={{ display:"flex", gap:3, background:T.bg, borderRadius:10, padding:3, border:`1px solid ${T.border}` }}>
      {options.map((opt, i) => (
        <button key={opt}
          style={{ ...P.toggleBtn, ...(value === opt ? P.toggleActive : {}) }}
          onClick={() => onChange(opt)}>
          {labels[i]}
        </button>
      ))}
    </div>
  );
}
