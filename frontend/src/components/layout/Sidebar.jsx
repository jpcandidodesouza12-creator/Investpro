import { S, T } from "../../styles/theme";
import { Icon } from "../common/Icon";
import { RoleBadge } from "../common/Misc";

export function Sidebar({ sideOpen, setSideOpen, screen, setScreen, visibleNav, user, onLogout }) {
  const W = sideOpen ? 230 : 60;

  return (
    <aside style={{ ...S.sidebar, width: W }}>

      {/* Logo */}
      <div style={S.sidebarLogo} onClick={() => setSideOpen(o => !o)}>
        <div style={{ width:32, height:32, borderRadius:8, background:T.accent, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:17 }}>
          🪙
        </div>
        {sideOpen && (
          <span style={S.logoText}>InvestPro</span>
        )}
        {sideOpen && (
          <div style={{ marginLeft:"auto", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", color:T.textSub, flexShrink:0 }}>
            <Icon name="close" size={12} />
          </div>
        )}
      </div>

      {/* User */}
      {sideOpen && user && (
        <div style={{ padding:"12px 14px 10px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
          <div style={{ fontSize:12, fontWeight:600, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {user.name}
          </div>
          <div style={{ marginTop:5 }}>
            <RoleBadge role={user.role} />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={S.nav}>
        {(visibleNav || []).map(item => {
          const active = screen === item.id;
          return (
            <button key={item.id}
              style={{ ...S.navItem, ...(active ? S.navActive : {}), justifyContent: sideOpen ? "flex-start" : "center", paddingLeft: active && sideOpen ? 8 : sideOpen ? 10 : undefined }}
              className={active ? "" : "nav-hover"}
              onClick={() => setScreen(item.id)}
              title={!sideOpen ? item.label : undefined}>
              <Icon name={item.icon} size={16} style={{ flexShrink:0 }} />
              {sideOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        style={{ ...S.navItem, justifyContent: sideOpen ? "flex-start" : "center", color:T.red, borderTop:`1px solid ${T.border}`, flexShrink:0, padding:"12px 10px" }}
        className="nav-hover"
        onClick={onLogout}
        title={!sideOpen ? "Sair" : undefined}>
        <Icon name="close" size={16} style={{ flexShrink:0 }} />
        {sideOpen && <span>Sair</span>}
      </button>
    </aside>
  );
}
