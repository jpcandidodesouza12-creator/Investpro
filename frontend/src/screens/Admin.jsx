import { useState, useEffect } from "react";
import { P, T } from "../styles/theme";
import { adminApi } from "../services/api";
import { Btn, BtnCancel, IBtn, PageHeader, Empty, RoleBadge } from "../components/common";

const MODULE_LABELS = {
  dashboard:"Dashboard", investments:"Investimentos", renda:"Minha Renda",
  history:"Aportes", comparator:"Comparador", projection:"Projeção",
  quotes:"Cotações", categories:"Categorias", settings:"Config.",
};

const ADMIN_TABS = [
  { id:"users",       label:"Usuários"     },
  { id:"pending",     label:"Solicitações" },
  { id:"new",         label:"Novo usuário" },
  { id:"permissions", label:"Permissões"   },
];

export function ScreenAdmin({ auth, isMobile }) {
  const [users,     setUsers]     = useState([]);
  const [pending,   setPending]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [editId,    setEditId]    = useState(null);
  const [modules,   setModules]   = useState({});
  const [newUser,   setNewUser]   = useState({ name:"", email:"", password:"", role:"user" });
  const [saving,    setSaving]    = useState(false);

  const editingUser = users.find(u => u.id === editId);

  async function loadAll() {
    setLoading(true); setError("");
    try {
      const [u, p] = await Promise.all([
        adminApi.getUsers(auth.token),
        adminApi.getPending(auth.token),
      ]);
      setUsers(u);
      setPending(p);
      const mods = {};
      u.forEach(usr => { mods[usr.id] = usr.modules || []; });
      setModules(mods);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAll(); }, []);

  async function approveUser(id, role = "user") {
    try { await adminApi.approveUser(auth.token, id, role); await loadAll(); }
    catch (err) { setError(err.message); }
  }

  async function rejectUser(id) {
    if (!window.confirm("Recusar esta solicitação?")) return;
    try { await adminApi.rejectUser(auth.token, id); await loadAll(); }
    catch (err) { setError(err.message); }
  }

  async function createUser() {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    setSaving(true);
    try {
      await adminApi.createUser(auth.token, newUser);
      setNewUser({ name:"", email:"", password:"", role:"user" });
      await loadAll(); setActiveTab("users");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function toggleModule(userId, module) {
    const current = modules[userId] || [];
    const updated = current.includes(module) ? current.filter(m => m !== module) : [...current, module];
    setModules(m => ({ ...m, [userId]: updated }));
    try { await adminApi.setModules(auth.token, userId, updated); }
    catch (err) { setModules(m => ({ ...m, [userId]: current })); setError(err.message); }
  }

  async function toggleActive(user) {
    try { await adminApi.updateUser(auth.token, user.id, { active: !user.active }); await loadAll(); }
    catch (err) { setError(err.message); }
  }

  async function deleteUser(id) {
    if (!window.confirm("Remover este usuário?")) return;
    try { await adminApi.deleteUser(auth.token, id); await loadAll(); }
    catch (err) { setError(err.message); }
  }

  return (
    <div style={P.root}>
      <PageHeader title="Painel Admin" subtitle="Gerencie usuários e permissões" />

      {error && (
        <div style={{ background:"#1a0000", border:"1px solid #ef444433", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:"#f87171", fontFamily:T.mono, display:"flex", justifyContent:"space-between" }}>
          <span>✗ {error}</span>
          <button onClick={() => setError("")} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer" }}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:24, background:T.surface2, borderRadius:12, padding:4, border:`1px solid ${T.border}`, width:"fit-content", flexWrap:"wrap" }}>
        {ADMIN_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ ...P.toggleBtn, ...(activeTab===tab.id ? P.toggleActive : {}), padding:"8px 16px", fontSize:13, position:"relative" }}>
            {tab.label}
            {tab.id === "pending" && pending.length > 0 && (
              <span style={{ position:"absolute", top:-4, right:-4, width:18, height:18, borderRadius:50, background:"#ef4444", color:"#fff", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Usuários ativos */}
      {activeTab === "users" && (
        <div style={P.chartCard}>
          <div style={P.chartTitle}>Usuários ativos</div>
          {loading ? <div style={{ color:"#555", fontFamily:T.mono, fontSize:13, padding:"20px 0" }}>Carregando...</div>
          : users.length === 0 ? <Empty>Nenhum usuário</Empty>
          : (
            <div style={{ overflowX:"auto" }}>
              <table style={P.table}>
                <thead><tr>
                  <th style={P.th}>Nome</th>
                  <th style={P.th}>E-mail</th>
                  <th style={P.th}>Perfil</th>
                  <th style={P.th}>Status</th>
                  <th style={P.th}>Módulos</th>
                  <th style={P.th}></th>
                </tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={P.tr} className="tr-hover">
                      <td style={{ ...P.td, color:"#fff", fontWeight:600 }}>{u.name}</td>
                      <td style={{ ...P.td, fontFamily:T.mono, fontSize:11 }}>{u.email}</td>
                      <td style={P.td}><RoleBadge role={u.role} /></td>
                      <td style={P.td}>
                        <button onClick={() => toggleActive(u)}
                          style={{ fontSize:11, fontFamily:T.mono, background:u.active?"#22c55e22":"#ef444422", color:u.active?"#22c55e":"#ef4444", border:`1px solid ${u.active?"#22c55e33":"#ef444433"}`, borderRadius:20, padding:"3px 12px", cursor:"pointer" }}>
                          {u.active ? "Ativo" : "Inativo"}
                        </button>
                      </td>
                      <td style={{ ...P.td, color:"#555", fontSize:12 }}>{(modules[u.id]||[]).length} módulos</td>
                      <td style={P.td}>
                        <div style={{ display:"flex", gap:6 }}>
                          <IBtn onClick={() => { setEditId(u.id); setActiveTab("permissions"); }} title="Permissões" iconName="edit" />
                          {u.role !== "admin" && <IBtn onClick={() => deleteUser(u.id)} title="Remover" iconName="trash" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Solicitações pendentes */}
      {activeTab === "pending" && (
        <div style={P.chartCard}>
          <div style={P.chartTitle}>Solicitações aguardando aprovação</div>
          {loading ? <div style={{ color:"#555", fontFamily:T.mono, fontSize:13, padding:"20px 0" }}>Carregando...</div>
          : pending.length === 0 ? <Empty>Nenhuma solicitação pendente</Empty>
          : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {pending.map(u => (
                <div key={u.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 16px", background:T.surface2, borderRadius:10, border:`1px solid ${T.border}`, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:120 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{u.name}</div>
                    <div style={{ fontSize:11, color:"#555", fontFamily:T.mono, marginTop:2 }}>{u.email}</div>
                    <div style={{ fontSize:11, color:"#444", marginTop:4 }}>
                      {new Date(u.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                    <select defaultValue="user" id={`role-${u.id}`}
                      style={{ ...P.input, width:"auto", padding:"6px 10px", fontSize:12 }}>
                      <option value="user">Usuário</option>
                      <option value="guest">Convidado</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Btn onClick={() => approveUser(u.id, document.getElementById(`role-${u.id}`).value)}>Aprovar</Btn>
                    <button onClick={() => rejectUser(u.id)}
                      style={{ ...P.btnCancel, padding:"7px 16px", fontSize:12, color:"#ef4444", borderColor:"#ef444433" }}>
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Novo usuário */}
      {activeTab === "new" && (
        <div style={{ ...P.chartCard, maxWidth:500 }}>
          <div style={P.chartTitle}>Criar usuário diretamente</div>
          {[["Nome completo","text",newUser.name,"name","João Silva"],["E-mail","email",newUser.email,"email","joao@email.com"],["Senha inicial","password",newUser.password,"password","mínimo 6 caracteres"]].map(([label, type, val, field, ph]) => (
            <div key={field}>
              <label style={P.label}>{label}</label>
              <input style={P.input} type={type} value={val} placeholder={ph}
                onChange={e => setNewUser(u => ({ ...u, [field]: e.target.value }))} />
            </div>
          ))}
          <label style={P.label}>Perfil</label>
          <select style={{ ...P.input, cursor:"pointer" }} value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role:e.target.value }))}>
            <option value="user">Usuário — acesso padrão</option>
            <option value="guest">Convidado — acesso limitado</option>
            <option value="admin">Admin — acesso total</option>
          </select>
          <div style={{ marginTop:16 }}>
            <Btn onClick={createUser} disabled={saving}>{saving ? "Criando..." : "Criar usuário"}</Btn>
          </div>
        </div>
      )}

      {/* Permissões */}
      {activeTab === "permissions" && (
        <div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
            {users.filter(u => u.role !== "admin").map(u => (
              <button key={u.id} onClick={() => setEditId(u.id)}
                style={{ padding:"8px 16px", borderRadius:20, border:"1px solid", fontSize:12, cursor:"pointer", fontFamily:T.mono, background:editId===u.id?T.accentDim:T.surface, color:editId===u.id?T.accent:"#aaa", borderColor:editId===u.id?T.accent:T.border2 }}>
                {u.name}
              </button>
            ))}
          </div>

          {editingUser ? (
            <div style={P.chartCard}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>{editingUser.name}</div>
                  <div style={{ fontSize:11, color:"#555", fontFamily:T.mono, marginTop:2 }}>{editingUser.email}</div>
                </div>
                <RoleBadge role={editingUser.role} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:8 }}>
                {Object.entries(MODULE_LABELS).map(([mod, label]) => {
                  const enabled = (modules[editingUser.id] || []).includes(mod);
                  return (
                    <button key={mod} onClick={() => toggleModule(editingUser.id, mod)}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:10, background:enabled?T.accentDim:T.surface2, border:`1px solid ${enabled?T.accent:T.border}`, cursor:"pointer", textAlign:"left" }}>
                      <div style={{ width:18, height:18, borderRadius:5, background:enabled?T.accent:"#2a2a2a", border:`2px solid ${enabled?T.accent:"#444"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, color:"#000", fontWeight:800 }}>
                        {enabled ? "✓" : ""}
                      </div>
                      <span style={{ fontSize:13, color:enabled?"#fff":"#666", fontWeight:enabled?600:400 }}>{label}</span>
                    </button>
                  );
                })}
              </div>
              <p style={P.note}>Alterações salvas automaticamente.</p>
            </div>
          ) : (
            <Empty>Selecione um usuário acima para editar suas permissões.</Empty>
          )}
        </div>
      )}
    </div>
  );
}
