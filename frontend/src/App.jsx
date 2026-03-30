import { useState, useEffect, useCallback } from "react";
import { useAuth }         from "./hooks/useAuth";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useInvestments }  from "./hooks/useInvestments";
import { useSync }         from "./hooks/useSync";
import { useToast }        from "./hooks/useToast";
import { useIsMobile }     from "./hooks/useIsMobile";
import { Sidebar }         from "./components/layout/Sidebar";
import { MobileBar, MobileDrawer } from "./components/layout/MobileMenu";
import { InvModal, DepModal, CatModal, ImportModal } from "./components/modals";
import { S, T }            from "./styles/theme";
import { NAV, FX_DEFAULT, getType } from "./utils/constants";
import { fmt, fmtP, fmtD }  from "./utils/formatters";
import { authApi, quotesApi } from "./services/api";
import {
  ScreenDashboard, ScreenInvestments, ScreenHistory,
  ScreenComparator, ScreenProjection, ScreenCategories,
  ScreenSettings, ScreenQuotes, ScreenRenda, ScreenAdmin,
} from "./screens";

// ─── Auth screens inline (Fase 5 vai extrair para arquivos separados) ─────────
function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [view, setView]         = useState("login"); // "login" | "register" | "success"
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [form, setForm]         = useState({ name:"", email:"", password:"", confirm:"" });

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try { onLogin(await authApi.login(email.trim(), password)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("As senhas não coincidem."); return; }
    setLoading(true); setError("");
    try {
      await authApi.register(form.name.trim(), form.email.trim(), form.password);
      setView("success");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:T.sans }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:64, height:64, borderRadius:18, background:T.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 16px" }}>🪙</div>
          <h1 style={{ fontSize:26, fontWeight:800, color:T.text, letterSpacing:-1 }}>InvestPro</h1>
          <p style={{ color:T.textMuted, marginTop:6, fontSize:14 }}>
            {view === "login" ? "Entre na sua conta" : view === "register" ? "Solicitar acesso" : ""}
          </p>
        </div>

        {view === "success" ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
            <h2 style={{ fontSize:18, fontWeight:700, color:T.text, marginBottom:10 }}>Solicitação enviada!</h2>
            <p style={{ fontSize:13, color:T.textMuted, lineHeight:1.6, marginBottom:24 }}>
              Aguarde a aprovação do administrador.
            </p>
            <button onClick={() => setView("login")} style={{ ...S.app, background:"transparent", border:`1px solid ${T.border2}`, color:T.accent, padding:"10px 20px", borderRadius:10, cursor:"pointer", fontFamily:T.sans, display:"inline-flex" }}>
              Voltar ao login
            </button>
          </div>
        ) : view === "login" ? (
          <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <input style={{ background:T.bg, border:`1px solid ${T.border2}`, borderRadius:9, color:T.text, padding:"11px 14px", fontFamily:T.mono, fontSize:13, outline:"none" }}
              type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
            <input style={{ background:T.bg, border:`1px solid ${T.border2}`, borderRadius:9, color:T.text, padding:"11px 14px", fontFamily:T.mono, fontSize:13, outline:"none" }}
              type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            {error && <div style={{ background:"#1a0000", border:"1px solid #ef444433", borderRadius:9, padding:"10px 14px", fontSize:13, color:"#f87171", fontFamily:T.mono }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ background:T.accent, color:"#000", border:"none", padding:"13px", borderRadius:10, fontFamily:T.sans, fontWeight:700, fontSize:15, cursor:loading?"not-allowed":"pointer", opacity:loading?0.6:1 }}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <div style={{ textAlign:"center", marginTop:6 }}>
              <span style={{ fontSize:13, color:"#555" }}>Não tem acesso? </span>
              <button type="button" onClick={() => { setView("register"); setError(""); }}
                style={{ background:"none", border:"none", color:T.accent, fontSize:13, cursor:"pointer", fontWeight:600 }}>
                Solicitar acesso
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["Nome completo","text",form.name,"name","João Silva"],["E-mail","email",form.email,"email","seu@email.com"],["Senha","password",form.password,"password","mín. 6 caracteres"],["Confirmar senha","password",form.confirm,"confirm","repita a senha"]].map(([label, type, val, field, ph]) => (
              <div key={field}>
                <label style={{ ...S, fontSize:10, color:T.textMuted, textTransform:"uppercase", letterSpacing:1.3, fontFamily:T.mono, display:"block", marginBottom:6 }}>{label}</label>
                <input style={{ background:T.bg, border:`1px solid ${T.border2}`, borderRadius:9, color:T.text, padding:"11px 14px", fontFamily:T.mono, fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" }}
                  type={type} placeholder={ph} value={val} onChange={e => setForm(f => ({ ...f, [field]:e.target.value }))} />
              </div>
            ))}
            {error && <div style={{ background:"#1a0000", border:"1px solid #ef444433", borderRadius:9, padding:"10px 14px", fontSize:13, color:"#f87171", fontFamily:T.mono }}>{error}</div>}
            <div style={{ background:"#111", border:`1px solid ${T.border}`, borderRadius:9, padding:"10px 14px", fontSize:12, color:"#555", fontFamily:T.mono }}>
              Sua solicitação ficará pendente até o administrador aprovar.
            </div>
            <button type="submit" disabled={loading} style={{ background:T.accent, color:"#000", border:"none", padding:"13px", borderRadius:10, fontFamily:T.sans, fontWeight:700, fontSize:15, cursor:loading?"not-allowed":"pointer", opacity:loading?0.6:1 }}>
              {loading ? "Enviando..." : "Solicitar acesso"}
            </button>
            <div style={{ textAlign:"center" }}>
              <button type="button" onClick={() => { setView("login"); setError(""); }}
                style={{ background:"none", border:"none", color:"#555", fontSize:13, cursor:"pointer" }}>
                ← Voltar ao login
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign:"center", marginTop:28, fontSize:11, color:"#333", fontFamily:T.mono }}>
          InvestPro · Dados protegidos com JWT
        </p>
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const { auth, token, isLoggedIn, user, isAdmin, login, logout, filterNav } = useAuth();
  const store   = useLocalStorage();
  const { projs, cons, totalInv, irAlerts, vencAlerts, urgent } = useInvestments(store.invs, store.settings);
  const { syncKey, loadFromCloud } = useSync(token);
  const { toast, showToast }       = useToast();
  const isMobile  = useIsMobile();
  const [screen,   setScreen]   = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(true);
  const [modal,    setModal]    = useState(null); // { type, data }
  const [qLoading, setQLoading] = useState(false);

  const fx         = store.settings?.fx || FX_DEFAULT;
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

  // ── Helpers de persistência ───────────────────────────────────────────────
  function persist(invs, cats, settings, deps, nii, nci, ndi, quotes, renda) {
    store.save(invs, cats, settings, deps, nii, nci, ndi, quotes, renda);
    syncKey("investments", invs);
    syncKey("categories",  cats);
    syncKey("settings",    settings);
    syncKey("deposits",    deps);
    syncKey("quotes",      quotes);
    syncKey("renda",       renda);
  }

  // ── Investimentos ─────────────────────────────────────────────────────────
  function saveInv(form) {
    const valor = parseFloat(form.valor) || 0;
    const pct   = parseFloat(form.pct)   || 0;
    const inv   = { ...form, valor, pct };
    const newInvs = form.id
      ? store.invs.map(i => i.id === form.id ? inv : i)
      : [...store.invs, { ...inv, id: Date.now() }];
    persist(newInvs, store.cats, store.settings, store.deps, store.nii, store.nci, store.ndi, store.quotes, store.renda);
    store.setInvs(newInvs);
    setModal(null);
    showToast(`✓ Investimento ${form.id ? "atualizado" : "adicionado"}`);
  }

  function delInv(id) {
    if (!window.confirm("Remover este investimento?")) return;
    const newInvs = store.invs.filter(i => i.id !== id);
    persist(newInvs, store.cats, store.settings, store.deps, store.nii, store.nci, store.ndi, store.quotes, store.renda);
    store.setInvs(newInvs);
    showToast("✓ Investimento removido");
  }

  // ── Aportes ───────────────────────────────────────────────────────────────
  function saveDep(form) {
    const dep = { ...form, id: Date.now(), valor: parseFloat(form.valor) || 0 };
    const newDeps = [...store.deps, dep];
    persist(store.invs, store.cats, store.settings, newDeps, store.nii, store.nci, store.ndi, store.quotes, store.renda);
    store.setDeps(newDeps);
    setModal(null);
    showToast("✓ Aporte registrado");
  }

  function delDep(id) {
    const newDeps = store.deps.filter(d => d.id !== id);
    persist(store.invs, store.cats, store.settings, newDeps, store.nii, store.nci, store.ndi, store.quotes, store.renda);
    store.setDeps(newDeps);
    showToast("✓ Aporte removido");
  }

  // ── Categorias ────────────────────────────────────────────────────────────
  function saveCat(form) {
    const newCats = form.id
      ? store.cats.map(c => c.id === form.id ? form : c)
      : [...store.cats, { ...form, id: Date.now() }];
    persist(store.invs, newCats, store.settings, store.deps, store.nii, store.nci, store.ndi, store.quotes, store.renda);
    store.setCats(newCats);
    setModal(null);
    showToast("✓ Categoria salva");
  }

  function delCat(id) {
    const newCats = store.cats.filter(c => c.id !== id);
    persist(store.invs, newCats, store.settings, store.deps, store.nii, store.nci, store.ndi, store.quotes, store.renda);
    store.setCats(newCats);
    showToast("✓ Categoria removida");
  }

  // ── Configurações ─────────────────────────────────────────────────────────
  function saveSettings(form) {
    const newSet = { ...store.settings, ...form };
    persist(store.invs, store.cats, newSet, store.deps, store.nii, store.nci, store.ndi, store.quotes, store.renda);
    store.setSettings(newSet);
    showToast("✓ Configurações salvas");
  }

  // ── Renda ─────────────────────────────────────────────────────────────────
  function saveRenda(mesIdx, mesData) {
    const newRenda = { ...store.renda, [mesIdx]: mesData };
    persist(store.invs, store.cats, store.settings, store.deps, store.nii, store.nci, store.ndi, store.quotes, newRenda);
    store.setRenda(newRenda);
  }

  // ── Cotações ──────────────────────────────────────────────────────────────
  async function fetchQuotes() {
    setQLoading(true);
    try {
      const data = await quotesApi.get(token);
      const now  = new Date().toLocaleString("pt-BR");
      const newQ = { ...store.quotes, data, updatedAt: now, error: null };
      store.setQuotes(newQ);
      const newFx = { ...fx };
      if (data.currencies?.USD?.price) newFx.USD = data.currencies.USD.price;
      if (data.currencies?.EUR?.price) newFx.EUR = data.currencies.EUR.price;
      const newSet = { ...store.settings, fx: newFx };
      if (data.cdi && data.cdi > 0) newSet.cdiRate = data.cdi;
      store.setSettings(newSet);
      persist(store.invs, store.cats, newSet, store.deps, store.nii, store.nci, store.ndi, newQ, store.renda);
      const cdiMsg = data.cdi ? ` · CDI ${fmtP(data.cdi)}` : "";
      showToast(`✓ Cotações atualizadas${cdiMsg}`);
    } catch (err) {
      const newQ = { ...store.quotes, error: err.message };
      store.setQuotes(newQ);
      showToast(`✗ ${err.message.substring(0, 60)}`, false);
    } finally {
      setQLoading(false);
    }
  }

  function updateWatchlist(section, tickers) {
    const newQ = { ...store.quotes, watchlist: { ...store.quotes.watchlist, [section]: tickers } };
    store.setQuotes(newQ);
    syncKey("quotes", newQ);
  }

  // ── Importar / Exportar ───────────────────────────────────────────────────
  function importData(data) {
    if (data.investments) store.setInvs(data.investments);
    if (data.categories)  store.setCats(data.categories);
    if (data.settings)    store.setSettings(data.settings);
    if (data.deposits)    store.setDeps(data.deposits);
    persist(data.investments||store.invs, data.categories||store.cats, data.settings||store.settings, data.deposits||store.deps, store.nii, store.nci, store.ndi, store.quotes, store.renda);
    setModal(null);
    showToast("✓ Dados importados com sucesso");
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify({ investments:store.invs, categories:store.cats, settings:store.settings, deposits:store.deps }, null, 2)], { type:"application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download:"investpro-backup.json" });
    a.click();
  }

  function exportCSV() {
    const header = "Nome,Tipo,Valor,% CDI,Data,Vencimento";
    const rows   = store.invs.map(i => `${i.nome},${i.tipo},${i.valor},${i.pct},${i.data||""},${i.vencimento||""}`);
    const blob   = new Blob([[header, ...rows].join("\n")], { type:"text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download:"investpro.csv" });
    a.click();
  }

  // ── Snapshot restore ──────────────────────────────────────────────────────
  function restoreSnap(snap) {
    const ok = store.restoreSnap(snap);
    if (ok) showToast("✓ Versão restaurada"); else showToast("✗ Erro ao restaurar", false);
  }

  if (!isLoggedIn) return <LoginScreen onLogin={login} />;

  // Props compartilhados entre todas as screens
  const sp = { isMobile, fx, invs:store.invs, cats:store.cats, settings:store.settings, deps:store.deps, projs, cons, totalInv, irAlerts, vencAlerts, urgent, snaps:store.snaps, quotes:store.quotes };

  return (
    <div style={S.app}>
      {/* Toast */}
      {toast && (
        <div style={{ ...S.toast, bottom:isMobile?20:24, right:isMobile?12:24, left:isMobile?12:"auto", background:toast.ok?"#001a0a":"#1a0000", borderColor:toast.ok?"#22c55e44":"#ef444433", color:toast.ok?"#22c55e":"#f87171" }}>
          {toast.msg}
        </div>
      )}

      {/* Alerta de urgência */}
      {urgent.length > 0 && (
        <div style={S.alertBanner}>
          <span>⚠️</span>
          <span style={{ flex:1, fontSize:11 }}>{urgent.slice(0,3).map(x => x.inv?.nome).join(" · ")}</span>
        </div>
      )}

      {/* Sidebar (desktop) */}
      {!isMobile && (
        <Sidebar sideOpen={sideOpen} setSideOpen={setSideOpen}
          screen={screen} setScreen={setScreen}
          visibleNav={visibleNav} user={user} onLogout={logout} />
      )}

      {/* Mobile */}
      {isMobile && (
        <>
          <MobileBar sideOpen={sideOpen} setSideOpen={setSideOpen}
            cdiRate={store.settings?.cdiRate ?? 14.51} fmtP={fmtP} />
          <MobileDrawer sideOpen={sideOpen} setSideOpen={setSideOpen}
            screen={screen} setScreen={setScreen}
            visibleNav={visibleNav} user={user} onLogout={logout} />
        </>
      )}

      {/* Main */}
      <main style={{ ...S.main, marginLeft: isMobile ? 0 : (sideOpen ? 240 : 68), padding: isMobile ? "16px 14px 40px" : "28px 36px 56px", marginTop: isMobile ? 56 : 0 }}>
        {screen === "dashboard"   && <ScreenDashboard   {...sp} setScreen={setScreen} onAdd={() => setModal({ type:"inv", data:{} })} />}
        {screen === "investments" && <ScreenInvestments {...sp} onAdd={() => setModal({ type:"inv", data:{} })} onEdit={inv => setModal({ type:"inv", data:inv })} onDel={delInv} onDep={inv => setModal({ type:"dep", data:{ invId:inv.id } })} onExJSON={exportJSON} onExCSV={exportCSV} onImport={() => setModal({ type:"import" })} />}
        {screen === "renda"       && <ScreenRenda       {...sp} onSave={saveRenda} />}
        {screen === "history"     && <ScreenHistory     {...sp} onAddDep={() => setModal({ type:"dep", data:{} })} onDelDep={delDep} />}
        {screen === "comparator"  && <ScreenComparator  {...sp} />}
        {screen === "projection"  && <ScreenProjection  {...sp} />}
        {screen === "quotes"      && <ScreenQuotes      {...sp} onFetch={fetchQuotes} onUpdateWatchlist={updateWatchlist} qLoading={qLoading} />}
        {screen === "categories"  && <ScreenCategories  {...sp} onAdd={() => setModal({ type:"cat", data:{} })} onEdit={cat => setModal({ type:"cat", data:cat })} onDel={delCat} />}
        {screen === "settings"    && <ScreenSettings    {...sp} onSave={saveSettings} onRestore={restoreSnap} />}
        {screen === "admin"       && isAdmin && <ScreenAdmin auth={auth} isMobile={isMobile} />}
      </main>

      {/* Modais */}
      {modal?.type === "inv"    && <InvModal    data={modal.data} cats={store.cats} isMobile={isMobile} onSave={saveInv} onClose={() => setModal(null)} />}
      {modal?.type === "dep"    && <DepModal    data={modal.data} invs={store.invs} isMobile={isMobile} onSave={saveDep} onClose={() => setModal(null)} />}
      {modal?.type === "cat"    && <CatModal    data={modal.data} isMobile={isMobile} onSave={saveCat} onClose={() => setModal(null)} />}
      {modal?.type === "import" && <ImportModal isMobile={isMobile} onImport={importData} onClose={() => setModal(null)} />}
    </div>
  );
}
