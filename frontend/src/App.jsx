import { useState } from "react";
import { T } from "./styles/theme";

// Layout e Telas (Screens) - Fase 4 e 5
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./screens/Dashboard";
import Wallet from "./screens/Wallet";
import Settings from "./screens/Settings";

// Hooks de Negócio - Fase 2
import { useAuth } from "./hooks/useAuth";

/**
 * Ecrã de Login - Mantém o visual original do InvestPro
 * mas agora totalmente integrado com o Backend via useAuth.
 */
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email.trim(), password);
      onLogin(); 
    } catch (err) {
      setError("Falha na autenticação. Verifique os dados ou a ligação ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: T.sans }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px" }}>🪙</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: -1 }}>InvestPro</h1>
          <p style={{ color: T.textMuted, marginTop: 6, fontSize: 14 }}>Entre na sua conta profissional</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            style={{ background: T.bg, border: `1px solid ${T.border2}`, borderRadius: 9, color: T.text, padding: "11px 14px", fontFamily: T.mono, fontSize: 13, outline: "none" }}
            type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus
          />
          <input
            style={{ background: T.bg, border: `1px solid ${T.border2}`, borderRadius: 9, color: T.text, padding: "11px 14px", fontFamily: T.mono, fontSize: 13, outline: "none" }}
            type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
          />
          
          {error && (
            <div style={{ background: "#1a0000", border: "1px solid #ef444433", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#f87171", fontFamily: T.mono }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ background: T.accent, color: "#000", border: "none", padding: "13px", borderRadius: 10, fontFamily: T.sans, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>
        
        <p style={{ textAlign: "center", marginTop: 28, fontSize: 11, color: "#333", fontFamily: T.mono }}>
          InvestPro v2.0 · Migração Vite Concluída ✅
        </p>
      </div>
    </div>
  );
}

// ─── Componente Principal (Root) ───────────────────────────────────────────────
export default function App() {
  const { authenticated, user, logout, loading: authLoading } = useAuth();
  const [screen, setScreen] = useState('dashboard');

  // 1. Estado de carregamento inicial (splash screen)
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, fontFamily: T.mono }}>
        🪙 A carregar InvestPro...
      </div>
    );
  }

  // 2. Se não estiver autenticado, renderiza o Login
  if (!authenticated) {
    return <LoginScreen onLogin={() => window.location.reload()} />;
  }

  /**
   * 3. Se logado, renderiza o AppLayout que contém a Sidebar Retrátil.
   * O conteúdo interno (children) muda de acordo com o estado 'screen'.
   */
  return (
    <AppLayout 
      activeScreen={screen} 
      setScreen={setScreen} 
      onLogout={logout}
      userName={user?.name || "Investidor"}
    >
      {/* Gestão de Telas - Fase 5 */}
      {screen === 'dashboard' && <Dashboard />}
      {screen === 'wallet' && <Wallet />}
      {screen === 'settings' && <Settings />}
      
      {/* Fallback para ecrãs em desenvolvimento */}
      {screen === 'history' && (
        <div style={{ color: T.text }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Histórico</h1>
          <p style={{ color: T.textMuted }}>Registo de todas as suas transações passadas.</p>
        </div>
      )}
    </AppLayout>
  );
}