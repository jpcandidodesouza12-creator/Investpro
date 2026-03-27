import { S, T } from "../../styles/theme";
import { Icon } from "../common/Icon";
import { RoleBadge } from "../common/Misc";

export function MobileBar({ sideOpen, setSideOpen, cdiRate, fmtP }) {
  return (
    <div style={S.mobileBar}>
      <button
        style={{ ...S.hamburger, color:T.text, background:"#1f1f1f", borderRadius:10, padding:"8px 10px", border:`1px solid #333` }}
        onClick={() => setSideOpen(o => !o)}
        aria-label="Menu">
        <Icon name={sideOpen ? "close" : "menu"} size={20} />
      </button>
      <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, justifyContent:"center" }}>
        <span style={{ fontSize:20 }}>🪙</span>
        <span style={{ ...S.logoText, fontSize:16 }}>InvestPro</span>
      </div>
      <span style={S.mobileCdi}>CDI {fmtP(cdiRate)}</span>
    </div>
  );
}

export function MobileDrawer({ sideOpen, setSideOpen, screen, setScreen, visibleNav, user, onLogout }) {
  if (!sideOpen) return null;

  return (
    <div style={S.drawerOverlay} onClick={() => setSideOpen(false)}>
      <nav style={S.drawer} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={S.drawerHeader}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>🪙</span>
            <span style={{ fontSize:18, fontWeight:800, color:T.text }}>InvestPro</span>
          </div>
          <button style={{ ...S.hamburger, color:T.text }} onClick={() => setSideOpen(false)}>
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Info do usuário */}
        {user && (
          <div style={{ padding:"12px 20px 8px", borderBottom:`1px solid ${T.border}` }}>
            <div style={{ fontSize:13, color:T.text, fontWeight:600 }}>{user.name}</div>
            <div style={{ fontSize:11, color:"#555", fontFamily:T.mono, marginTop:2 }}>{user.email}</div>
            <div style={{ marginTop:6 }}><RoleBadge role={user.role} /></div>
          </div>
        )}

        {/* Nav items */}
        {(visibleNav || []).map(item => (
          <button key={item.id}
            style={{ ...S.drawerItem, ...(screen === item.id ? S.drawerItemActive : {}) }}
            onClick={() => { setScreen(item.id); setSideOpen(false); }}>
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
            {screen === item.id && <span style={S.drawerActiveDot} />}
          </button>
        ))}

        {/* Logout */}
        <button
          style={{ ...S.drawerItem, marginTop:"auto", color:"#ef4444", borderTop:`1px solid ${T.border}` }}
          onClick={() => { setSideOpen(false); onLogout(); }}>
          <Icon name="close" size={18} />
          <span>Sair</span>
        </button>
      </nav>
    </div>
  );
}
