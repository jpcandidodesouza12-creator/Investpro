import { S, T } from "../../styles/theme";
import { Icon } from "../common/Icon";
import { RoleBadge } from "../common/Misc";

export function Sidebar({ sideOpen, setSideOpen, screen, setScreen, visibleNav, user, onLogout }) {
  return (
    <aside style={{ ...S.sidebar, width: sideOpen ? 240 : 68 }}>

      {/* Logo — clique abre/fecha */}
      <div style={S.sidebarLogo} onClick={() => setSideOpen(o => !o)}>
        <div style={{ width:36, height:36, borderRadius:10, background:T.accent, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:20, lineHeight:1 }}>
          🪙
        </div>
        {sideOpen && (
          <>
            <span style={S.logoText}>InvestPro</span>
            <span style={{ marginLeft:"auto", color:"#555", flexShrink:0, display:"flex" }}>
              <Icon name="close" size={14} />
            </span>
          </>
        )}
      </div>

      {/* Info do usuário */}
      {sideOpen && user && (
        <div style={{ padding:"12px 14px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {user.name}
          </div>
          <div style={{ fontSize:10, color:"#555", fontFamily:T.mono, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {user.email}
          </div>
          <div style={{ marginTop:6 }}>
            <RoleBadge role={user.role} />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={S.nav}>
        {(visibleNav || []).map(item => (
          <button key={item.id}
            style={{ ...S.navItem, ...(screen === item.id ? S.navActive : {}), justifyContent: sideOpen ? "flex-start" : "center" }}
            className={screen === item.id ? "" : "nav-hover"}
            onClick={() => setScreen(item.id)}
            title={!sideOpen ? item.label : undefined}>
            <Icon name={item.icon} size={18} style={{ flexShrink:0 }} />
            {sideOpen && <span style={{ fontSize:13, marginLeft:2 }}>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        style={{ ...S.navItem, justifyContent: sideOpen ? "flex-start" : "center", color:"#ef4444", borderTop:`1px solid ${T.border}`, flexShrink:0, padding:"14px 11px" }}
        className="nav-hover"
        onClick={onLogout}
        title={!sideOpen ? "Sair" : undefined}>
        <Icon name="close" size={18} style={{ flexShrink:0 }} />
        {sideOpen && <span style={{ fontSize:13, marginLeft:2 }}>Sair</span>}
      </button>
    </aside>
  );
}
