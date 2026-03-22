const express = require("express");
const bcrypt  = require("bcryptjs");
const { pool, getUserModules, setUserModules, ALL_MODULES, DEFAULT_PERMISSIONS, USER_STATUS } = require("../database");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireAdmin);

const SALT_ROUNDS = 12;

// ─── GET /admin/users — lista usuários ativos e rejeitados ────────────────────
router.get("/users", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, role, status, active, created_at FROM users WHERE status != 'pending' ORDER BY created_at DESC"
    );
    const users = await Promise.all(
      rows.map(async u => ({ ...u, modules: await getUserModules(u.id) }))
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

// ─── GET /admin/pending — solicitações aguardando aprovação ───────────────────
router.get("/pending", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE status = 'pending' ORDER BY created_at ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar solicitações" });
  }
});

// ─── PUT /admin/pending/:id/approve — aprova solicitação ─────────────────────
router.put("/pending/:id/approve", async (req, res) => {
  const userId = parseInt(req.params.id);
  const { role = "user" } = req.body;

  if (!["admin", "user", "guest"].includes(role)) {
    return res.status(400).json({ error: "Perfil inválido" });
  }

  try {
    const { rows } = await pool.query(
      "UPDATE users SET status = 'active', active = true, role = $1, updated_at = NOW() WHERE id = $2 AND status = 'pending' RETURNING id, name, email, role",
      [role, userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Solicitação não encontrada" });

    await setUserModules(userId, DEFAULT_PERMISSIONS[role]);
    res.json({ ...rows[0], message: "Usuário aprovado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao aprovar usuário" });
  }
});

// ─── PUT /admin/pending/:id/reject — recusa solicitação ──────────────────────
router.put("/pending/:id/reject", async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const { rows } = await pool.query(
      "UPDATE users SET status = 'rejected', updated_at = NOW() WHERE id = $1 AND status = 'pending' RETURNING id, name",
      [userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Solicitação não encontrada" });
    res.json({ message: `Solicitação de ${rows[0].name} recusada` });
  } catch (err) {
    res.status(500).json({ error: "Erro ao recusar solicitação" });
  }
});

// ─── POST /admin/users — cria usuário diretamente (já ativo) ─────────────────
router.post("/users", async (req, res) => {
  const { name, email, password, role = "user" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
  }
  if (!["admin", "user", "guest"].includes(role)) {
    return res.status(400).json({ error: "Perfil inválido" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
  }

  try {
    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    if (exists.rows.length > 0) return res.status(409).json({ error: "E-mail já cadastrado" });

    const hash   = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role, status) VALUES ($1,$2,$3,$4,'active') RETURNING id, name, email, role",
      [name.trim(), email.toLowerCase().trim(), hash, role]
    );
    await setUserModules(result.rows[0].id, DEFAULT_PERMISSIONS[role]);
    res.status(201).json({ ...result.rows[0], modules: DEFAULT_PERMISSIONS[role] });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

// ─── PUT /admin/users/:id — edita nome, perfil, status ───────────────────────
router.put("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, role, active } = req.body;

  if (userId === req.user.id && role && role !== "admin") {
    return res.status(400).json({ error: "Você não pode remover seu próprio perfil de Admin" });
  }

  try {
    const fields = [];
    const values = [];
    let i = 1;
    if (name   !== undefined) { fields.push(`name = $${i++}`);   values.push(name.trim()); }
    if (role   !== undefined) { fields.push(`role = $${i++}`);   values.push(role); }
    if (active !== undefined) { fields.push(`active = $${i++}`); values.push(active); }
    fields.push("updated_at = NOW()");
    values.push(userId);

    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${i} RETURNING id, name, email, role, active`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: "Usuário não encontrado" });

    if (role) await setUserModules(userId, DEFAULT_PERMISSIONS[role]);

    const modules = await getUserModules(userId);
    res.json({ ...rows[0], modules });
  } catch (err) {
    res.status(500).json({ error: "Erro ao editar usuário" });
  }
});

// ─── PUT /admin/users/:id/modules — permissões individuais ───────────────────
router.put("/users/:id/modules", async (req, res) => {
  const userId  = parseInt(req.params.id);
  const { modules } = req.body;

  if (!Array.isArray(modules)) {
    return res.status(400).json({ error: "modules deve ser um array" });
  }
  const invalid = modules.filter(m => !ALL_MODULES.includes(m));
  if (invalid.length > 0) {
    return res.status(400).json({ error: `Módulos inválidos: ${invalid.join(", ")}` });
  }

  try {
    const user = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (!user.rows.length) return res.status(404).json({ error: "Usuário não encontrado" });

    await setUserModules(userId, modules);
    res.json({ userId, modules });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar permissões" });
  }
});

// ─── DELETE /admin/users/:id ──────────────────────────────────────────────────
router.delete("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  if (userId === req.user.id) {
    return res.status(400).json({ error: "Você não pode remover sua própria conta" });
  }
  try {
    const { rows } = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING name", [userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json({ message: `Usuário '${rows[0].name}' removido` });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover usuário" });
  }
});

// ─── GET /admin/modules ───────────────────────────────────────────────────────
router.get("/modules", (req, res) => {
  res.json({ modules: ALL_MODULES, defaults: DEFAULT_PERMISSIONS });
});

module.exports = router;
