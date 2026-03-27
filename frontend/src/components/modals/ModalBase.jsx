import { M } from "../../styles/theme";

export function Overlay({ onClose, children, isMobile }) {
  return (
    <div
      style={{ ...M.overlay, alignItems: isMobile ? "flex-end" : "center" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function ModalBox({ children, isMobile, maxW }) {
  return (
    <div style={{
      ...M.box,
      maxWidth:     isMobile ? "100vw" : maxW,
      width:        isMobile ? "100vw" : "100%",
      borderRadius: isMobile ? "20px 20px 0 0" : 16,
      paddingBottom:isMobile ? 36 : 28,
    }}>
      {children}
    </div>
  );
}
