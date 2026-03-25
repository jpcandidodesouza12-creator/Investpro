import { useState } from "react";
import { T } from "./styles/theme";

// Layout e Telas (Screens)
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./screens/Dashboard";
import Wallet from "./screens/Wallet";
import Settings from "./screens/Settings";

// Hooks de Negócio
import { useAuth } from "./hooks/useAuth";

/**
 * Componente de Input Reutilizável para manter o padrão visual
 */
const AuthInput = (props) => (
  <input
    {...props}
    style={{ 
      background: T.bg, 
      border: `1px solid ${T.border2}`, 
      borderRadius: 9, 
      color: T.text, 
      padding: "11px 14px", 
      fontFamily: T.mono, 
      fontSize: 13, 
      outline: "none",
      width: "100%",
      boxSizing: "border-box"
    }}
  />
);

/**
 * ECRÃ DE LOGIN
 */
function LoginScreen({ onLogin, goToRegister }) {
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
          <AuthInput type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus required />
          <AuthInput type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          
          {error && (
            <div style={{ background: "#1a0000", border: "1px solid #ef444433", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#f87171", fontFamily: T.mono }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ background: T.accent, color: "#000", border: "none", padding: "13px", borderRadius: 10, fontFamily: T.sans, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>
        
        <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: T.textMuted }}>
          Não tem conta?{" "}
          <span onClick={goToRegister} style={{ color: T.accent, cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}>
            Criar acesso gratuito
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * ECRÃ DE REGISTRO (NOVO)
 */
function RegisterScreen({ onBack, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(name, email.trim(), password);
      alert("Conta criada com sucesso! Faça login agora.");
      onBack(); // Volta para o login
    } catch (err) {
      setError("Erro ao registrar. O usuário pode já existir ou o servidor está offline.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: T.sans }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text }}>Nova Conta</h1>
          <p style={{ color: T.textMuted, marginTop: 6, fontSize: 14 }}>Comece a gerir os seus ativos agora</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <AuthInput type="text" placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} required />
          <AuthInput type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <AuthInput type="password" placeholder="Senha forte" value={password} onChange={e => setPassword(e.target.value)} required />
          
          {error && (
            <div style={{ background: "#1a0000", border: "1px solid #ef444433", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#f87171", fontFamily: T.mono }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ background: T.accent, color: "#000", border: "none", padding: "13px", borderRadius: 10, fontFamily: T.sans, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "A criar conta..." : "Registrar"}
          </button>
          
          <button type="button" onClick={onBack} style={{ background: "transparent", color: T.textMuted, border: "none", cursor: "pointer", fontSize: 13 }}>
            ← Voltar para login
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Componente Principal (Root) ───────────────────────────────────────────────
export default function App() {
  const { authenticated, user, logout, loading: authLoading } = useAuth();
  const [screen, setScreen] = useState('dashboard');
  const [authView, setAuthView] = useState('login'); // 'login' ou 'register'

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, fontFamily: T.mono }}>
        🪙 A carregar InvestPro...
      </div>
    );
  }

  // Lógica de Autenticação / Registro
  if (!authenticated) {
    return authView === 'login' 
      ? <LoginScreen onLogin={() => window.location.reload()} goToRegister={() => setAuthView('register')} />
      : <RegisterScreen onBack={() => setAuthView('login')} onLogin={() => window.location.reload()} />;
  }

  return (
    <AppLayout 
      activeScreen={screen} 
      setScreen={setScreen} 
      onLogout={logout}
      userName={user?.name || "Investidor"}
    >
      {screen === 'dashboard' && <Dashboard />}
      {screen === 'wallet' && <Wallet />}
      {screen === 'settings' && <Settings />}
      
      {screen === 'history' && (
        <div style={{ color: T.text }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Histórico</h1>
          <p style={{ color: T.textMuted }}>Registo de todas as suas transações passadas.</p>
        </div>
      )}
    </AppLayout>
  );
}