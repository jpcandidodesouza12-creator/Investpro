import { useState, useEffect } from "react";
import { useAuth }         from "./hooks/useAuth";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useInvestments }  from "./hooks/useInvestments";
import { useSync }         from "./hooks/useSync";
import { useToast }        from "./hooks/useToast";
import { useIsMobile }     from "./hooks/useIsMobile";
import { Sidebar }         from "./components/layout/Sidebar";
import { MobileBar, MobileDrawer } from "./components/layout/MobileMenu";
import { S, T }            from "./styles/theme";
import { NAV }             from "./utils/constants";
import { fmtP }            from "./utils/formatters";

// ─── Auth screens — migrados na Fase 5 ───────────────────────────────────────
import { authApi } from "./services/api";

function LoginPlaceholder({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await authApi.login(email.trim(), password);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:T.sans }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:64, height:64, borderRadius:18, background:T.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 16px" }}>🪙</div>
          <h1 style={{ fontSize:26, fontWeight:800, color:T.text, letterSpacing:-1 }}>InvestPro</h1>
          <p style={{ color:T.textMuted, marginTop:6, fontSize:14 }}>Entre na sua conta</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <input style={{ background:T.bg, border:`1px solid ${T.border2}`, borderRadius:9, color:T.text, padding:"11px 14px", fontFamily:T.mono, fontSize:13, outline:"none" }}
            type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          <input style={{ background:T.bg, border:`1px solid ${T.border2}`, borderRadius:9, color:T.text, padding:"11px 14px", fontFamily:T.mono, fontSize:13, outline:"none" }}
            type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          {error && (
            <div style={{ background:"#1a0000", border:"1px solid #ef444433", borderRadius:9, padding:"10px 14px", fontSize:13, color:"#f87171", fontFamily:T.mono }}>{error}</div>
          )}
          <button type="submit" disabled={loading}
            style={{ background:T.accent, color:"#000", border:"none", padding:"13px", borderRadius:10, fontFamily:T.sans, fontWeight:700, fontSize:15, cursor:loading?"not-allowed":"pointer", opacity:loading?0.6:1 }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const { auth, token, isLoggedIn, user, isAdmin, login, logout, filterNav } = useAuth();
  const store   = useLocalStorage();
  const { totalInv, urgent } = useInvestments(store.invs, store.settings);
  const { syncKey, loadFromCloud } = useSync(token);
  const { toast, showToast }       = useToast();
  const isMobile  = useIsMobile();
  const [screen,   setScreen]   = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(true);

  const visibleNav = filterNav(NAV);

  // Carrega dados da nuvem ao fazer login
  useEffect(() => {
    if (!isLoggedIn) return;
    loadFromCloud().then(cloud => {
      if (!cloud) return;
      if (cloud.investments) store.setInvs(cloud.investments);
      if (cloud.categories)  store.setCats(cloud.categories);
      if (cloud.settings)    store.setSettings(cloud.settings);
      if (cloud.deposits)    store.setDeps(cloud.deposits);
      if (cloud.quotes)      store.setQuotes(cloud.quotes);
      if (cloud.renda)       store.setRenda(cloud.renda);
      showToast("✓ Dados sincronizados");
    });
  }, [isLoggedIn]);

  if (!isLoggedIn) return <LoginPlaceholder onLogin={login} />;

  return (
    <div style={S.app}>
      {/* Toast */}
      {toast && (
        <div style={{ ...S.toast, bottom:isMobile?20:24, right:isMobile?12:24, left:isMobile?12:"auto", background:toast.ok?"#001a0a":"#1a0000", borderColor:toast.ok?"#22c55e44":"#ef444433", color:toast.ok?"#22c55e":"#f87171" }}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar (desktop) */}
      {!isMobile && (
        <Sidebar
          sideOpen={sideOpen} setSideOpen={setSideOpen}
          screen={screen}    setScreen={setScreen}
          visibleNav={visibleNav}
          user={user}
          onLogout={logout}
        />
      )}

      {/* Mobile header + drawer */}
      {isMobile && (
        <>
          <MobileBar
            sideOpen={sideOpen}   setSideOpen={setSideOpen}
            cdiRate={store.settings?.cdiRate ?? 14.51}
            fmtP={fmtP}
          />
          <MobileDrawer
            sideOpen={sideOpen}   setSideOpen={setSideOpen}
            screen={screen}       setScreen={setScreen}
            visibleNav={visibleNav}
            user={user}
            onLogout={logout}
          />
        </>
      )}

      {/* Main content */}
      <main style={{
        ...S.main,
        marginLeft: isMobile ? 0 : (sideOpen ? 240 : 68),
        padding:    isMobile ? "16px 14px 40px" : "28px 36px 56px",
        marginTop:  isMobile ? 56 : 0,
      }}>
        {/* Screens — adicionadas na Fase 4 e 5 */}
        <div style={{ background:T.surface, borderRadius:14, padding:"32px", textAlign:"center", border:`1px solid ${T.border}` }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🪙</div>
          <h2 style={{ color:T.text, fontSize:20, fontWeight:700 }}>Fase 3 completa!</h2>
          <p style={{ color:T.textMuted, marginTop:8, fontSize:14 }}>Tela: <strong style={{ color:T.accent }}>{screen}</strong></p>
          <p style={{ color:"#22c55e", fontSize:13, fontFamily:T.mono, marginTop:8 }}>
            ✓ Sidebar · ✓ MobileMenu · ✓ Modais · ✓ KPI · ✓ Buttons · ✓ Icon
          </p>
          <p style={{ color:T.textMuted, fontSize:12, marginTop:8 }}>Próximo: Fase 4 — layout completo + screens</p>
        </div>
      </main>
    </div>
  );
}
