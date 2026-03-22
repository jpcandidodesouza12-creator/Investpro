const express = require("express");
const bcrypt  = require("bcryptjs");
const { pool, getUserModules, setUserModules, ALL_MODULES, DEFAULT_PERMISSIONS } = require("../database");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Todas as rotas exigem Admin
router.use(requireAuth, requireAdmin);

// ─── GET /admin/users — lista todos os usuários ───────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT id, name, email, role, active, created_at FROM users ORDER BY created_at DESC"
    );

    // Busca módulos de cada usuário
    const result = await Promise.all(
      users.rows.map(async u => ({
        ...u,
        modules: await getUserModules(u.id),
      }))
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

// ─── POST /admin/users — cria novo usuário ────────────────────────────────────
router.post("/users", async (req, res) => {
  const { name, email, password, role = "user" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
  }
  if (!["admin", "user", "guest"].includes(role)) {
    return res.status(400).json({ error: "Perfil inválido (admin/user/guest)" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
  }

  try {
    const exists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role",
      [name.trim(), email.toLowerCase().trim(), hash, role]
    );

    const newUser = result.rows[0];

    // Permissões padrão do perfil
    await setUserModules(newUser.id, DEFAULT_PERMISSIONS[role]);

    res.status(201).json({
      ...newUser,
      modules: DEFAULT_PERMISSIONS[role],
      message: "Usuário criado com sucesso",
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

// ─── PUT /admin/users/:id — edita nome, perfil e status ─────────────────────
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, role, active } = req.body;

  // Impede editar o próprio Admin Master
  if (parseInt(id) === req.user.id && role && role !== "admin") {
    return res.status(400).json({ error: "Você não pode remover seu próprio perfil de Admin" });
  }

  try {
    const fields = [];
    const values = [];
    let i = 1;

    if (name)   { fields.push(`name = $${i++}`);   values.push(name.trim()); }
    if (role)   { fields.push(`role = $${i++}`);   values.push(role); }
    if (active !== undefined) { fields.push(`active = $${i++}`); values.push(active); }
    fields.push(`updated_at = NOW()`);
    values.push(parseInt(id));

    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${i} RETURNING id, name, email, role, active`,
      values
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Se mudou o perfil, ajusta permissões para o padrão do novo perfil
    if (role) {
      await setUserModules(parseInt(id), DEFAULT_PERMISSIONS[role]);
    }

    const modules = await getUserModules(parseInt(id));
    res.json({ ...result.rows[0], modules });
  } catch (err) {
    res.status(500).json({ error: "Erro ao editar usuário" });
  }
});

// ─── PUT /admin/users/:id/modules — define módulos do usuário ────────────────
router.put("/users/:id/modules", async (req, res) => {
  const { id }     = req.params;
  const { modules } = req.body;

  if (!Array.isArray(modules)) {
    return res.status(400).json({ error: "modules deve ser um array de strings" });
  }

  // Valida que todos os módulos são válidos
  const invalid = modules.filter(m => !ALL_MODULES.includes(m));
  if (invalid.length > 0) {
    return res.status(400).json({ error: `Módulos inválidos: ${invalid.join(", ")}` });
  }

  try {
    const user = await pool.query("SELECT id FROM users WHERE id = $1", [parseInt(id)]);
    if (!user.rows.length) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await setUserModules(parseInt(id), modules);
    res.json({ userId: parseInt(id), modules, message: "Permissões atualizadas" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar permissões" });
  }
});

// ─── DELETE /admin/users/:id — remove usuário ────────────────────────────────
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: "Você não pode remover sua própria conta" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, name",
      [parseInt(id)]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json({ message: `Usuário '${result.rows[0].name}' removido` });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover usuário" });
  }
});

// ─── GET /admin/modules — lista todos os módulos disponíveis ─────────────────
router.get("/modules", (req, res) => {
  res.json({ modules: ALL_MODULES, defaults: DEFAULT_PERMISSIONS });
});

module.exports = router;
