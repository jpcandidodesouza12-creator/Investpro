import { P, T } from "../../styles/theme";
import { Icon } from "./Icon";

/**
 * Botão Primário
 * Utiliza o estilo padrão P.btn. Se desabilitado, reduz opacidade e remove hover.
 */
export function Btn({ onClick, children, disabled }) {
  return (
    <button
      style={{ ...P.btn, ...(disabled ? { opacity: .45, cursor: "not-allowed" } : {}) }}
      onClick={disabled ? undefined : onClick}
      className={disabled ? "" : "btn-hover"}>
      {children}
    </button>
  );
}

/**
 * Botão Secundário
 * Estilização alternativa para ações de menor hierarquia.
 */
export function BtnSec({ onClick, children }) {
  return <button style={P.btnSec} onClick={onClick} className="btn-hover">{children}</button>;
}

/**
 * Botão de Cancelamento
 * Focado em ações de exclusão ou retrocesso (geralmente tons neutros ou vermelhos).
 */
export function BtnCancel({ onClick, children }) {
  return <button style={P.btnCancel} onClick={onClick}>{children}</button>;
}

/**
 * Botão com Ícone (Icon Button)
 * Suporta um ícone direto via 'iconName' ou componentes filhos (children).
 */
export function IBtn({ onClick, title, iconName, children }) {
  return (
    <button style={P.iBtn} onClick={onClick} title={title} className="ibtn-hover">
      {iconName ? <Icon name={iconName} size={14} /> : children}
    </button>
  );
}

/**
 * Toggle Switch
 * Componente de seleção única entre múltiplas opções (Segmented Control).
 */
export function Toggle({ options, labels, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 3, background: T.bg, borderRadius: 10, padding: 3, border: `1px solid ${T.border}` }}>
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

/**
 * Chip / Badge
 * Elemento de status ou categoria. Adicionado para resolver o erro de build.
 * Raciocínio: Se houver onClick, renderiza como button, caso contrário, span.
 */
export function Chip({ label, color, onClick, style }) {
  const isClickable = !!onClick;
  const Tag = isClickable ? "button" : "span";

  // Mescla o estilo do tema (P.chip) com a cor dinâmica e overrides manuais
  const finalStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px 10px",
    borderRadius: "100px",
    fontSize: "11px",
    fontWeight: "600",
    border: "none",
    backgroundColor: color || T.primary,
    color: "#FFF",
    cursor: isClickable ? "pointer" : "default",
    ...P.chip, // Garante que regras do tema tenham prioridade
    ...style   // Permite ajustes pontuais vindos do componente pai
  };

  return (
    <Tag style={finalStyle} onClick={onClick}>
      {label}
    </Tag>
  );
}