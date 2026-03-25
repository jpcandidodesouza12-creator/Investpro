const express = require("express");
const bcrypt  = require("bcryptjs");
const { body, param } = require("express-validator");
const { pool, getUserModules, setUserModules, ALL_MODULES, DEFAULT_PERMISSIONS, USER_STATUS } = require("../database");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();
router.use(requireAuth, requireAdmin);

const SALT_ROUNDS = 12;
const VALID_ROLES  = ["admin", "user", "guest"];

// ─── Regras compartilhadas ────────────────────────────────────────────────────
const nameRule  = body("name").optional().trim().notEmpty().withMessage("Nome não pode ser vazio").isLength({ max:100 });
const emailRule = body("email").trim().isEmail().withMessage("E-mail inválido").normalizeEmail();
const roleRule  = body("role").optional().isIn(VALID_ROLES).withMessage("Perfil inválido. Use: admin, user ou guest");
const idParam   = param("id").isInt({ min:1 }).withMessage("ID inválido");

// ─── GET /admin/users ─────────────────────────────────────────────────────────
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

// ─── GET /admin/pending ───────────────────────────────────────────────────────
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

// ─── PUT /admin/pending/:id/approve ──────────────────────────────────────────
router.put("/pending/:id/approve",
  [idParam, roleRule],
  validate,
  async (req, res) => {
    const userId = parseInt(req.params.id);
    const role   = req.body.role || "user";
    try {
      const { rows } = await pool.query(
        "UPDATE users SET status='active', active=true, role=$1, updated_at=NOW() WHERE id=$2 AND status='pending' RETURNING id, name, email, role",
        [role, userId]
      );
      if (!rows.length) return res.status(404).json({ error: "Solicitação não encontrada" });
      await setUserModules(userId, DEFAULT_PERMISSIONS[role]);
      res.json({ ...rows[0], message: "Usuário aprovado com sucesso" });
    } catch (err) {
      res.status(500).json({ error: "Erro ao aprovar usuário" });
    }
  }
);

// ─── PUT /admin/pending/:id/reject ───────────────────────────────────────────
router.put("/pending/:id/reject",
  [idParam],
  validate,
  async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
      const { rows } = await pool.query(
        "UPDATE users SET status='rejected', updated_at=NOW() WHERE id=$1 AND status='pending' RETURNING id, name",
        [userId]
      );
      if (!rows.length) return res.status(404).json({ error: "Solicitação não encontrada" });
      res.json({ message: `Solicitação de ${rows[0].name} recusada` });
    } catch (err) {
      res.status(500).json({ error: "Erro ao recusar solicitação" });
    }
  }
);

// ─── POST /admin/users ────────────────────────────────────────────────────────
router.post("/users",
  [
    body("name").trim().notEmpty().withMessage("Nome é obrigatório").isLength({ max:100 }),
    emailRule,
    body("password").isLength({ min:6 }).withMessage("Senha deve ter pelo menos 6 caracteres"),
    body("role").isIn(VALID_ROLES).withMessage("Perfil inválido"),
  ],
  validate,
  async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
      if (exists.rows.length > 0) return res.status(409).json({ error: "E-mail já cadastrado" });

      const hash   = await bcrypt.hash(password, SALT_ROUNDS);
      const result = await pool.query(
        "INSERT INTO users (name, email, password, role, status) VALUES ($1,$2,$3,$4,'active') RETURNING id, name, email, role",
        [name, email, hash, role]
      );
      await setUserModules(result.rows[0].id, DEFAULT_PERMISSIONS[role]);
      res.status(201).json({ ...result.rows[0], modules: DEFAULT_PERMISSIONS[role] });
    } catch (err) {
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  }
);

// ─── PUT /admin/users/:id ─────────────────────────────────────────────────────
router.put("/users/:id",
  [idParam, nameRule, roleRule, body("active").optional().isBoolean().withMessage("active deve ser true ou false")],
  validate,
  async (req, res) => {
    const userId = parseInt(req.params.id);
    const { name, role, active } = req.body;

    if (userId === req.user.id && role && role !== "admin") {
      return res.status(400).json({ error: "Você não pode remover seu próprio perfil de Admin" });
    }

    try {
      const fields = [];
      const values = [];
      let i = 1;
      if (name   !== undefined) { fields.push(`name = $${i++}`);   values.push(name); }
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
  }
);

// ─── PUT /admin/users/:id/modules ─────────────────────────────────────────────
router.put("/users/:id/modules",
  [idParam, body("modules").isArray().withMessage("modules deve ser um array")],
  validate,
  async (req, res) => {
    const userId  = parseInt(req.params.id);
    const { modules } = req.body;

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
  }
);

// ─── DELETE /admin/users/:id ──────────────────────────────────────────────────
router.delete("/users/:id", [idParam], validate, async (req, res) => {
  const userId = parseInt(req.params.id);
  if (userId === req.user.id) {
    return res.status(400).json({ error: "Você não pode remover sua própria conta" });
  }
  try {
    const { rows } = await pool.query("DELETE FROM users WHERE id = $1 RETURNING name", [userId]);
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
