const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const crypto  = require("crypto");
const { pool, getUserModules } = require("../database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  try {
    const result = await pool.query(
      "SELECT id, name, email, password, role, active FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "E-mail ou senha incorretos" });
    }
    if (!user.active) {
      return res.status(401).json({ error: "Conta desativada. Contate o administrador." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "E-mail ou senha incorretos" });
    }

    // Módulos que este usuário pode acessar
    const modules = await getUserModules(user.id);

    // Gera JWT com ID único (jti) para permitir revogação
    const jti   = crypto.randomBytes(16).toString("hex");
    const token = jwt.sign(
      { sub: user.id, role: user.role, jti },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      modules,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────
router.post("/logout", requireAuth, async (req, res) => {
  try {
    const { jti, exp } = req.tokenPayload;
    const expiresAt = new Date(exp * 1000);

    await pool.query(
      "INSERT INTO revoked_tokens (jti, expires_at) VALUES ($1,$2) ON CONFLICT DO NOTHING",
      [jti, expiresAt]
    );

    // Limpa tokens expirados periodicamente
    await pool.query("DELETE FROM revoked_tokens WHERE expires_at < NOW()");

    res.json({ message: "Logout realizado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao fazer logout" });
  }
});

// ─── GET /auth/me — retorna dados do usuário logado ──────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  const modules = await getUserModules(req.user.id);
  res.json({
    user: {
      id:    req.user.id,
      name:  req.user.name,
      email: req.user.email,
      role:  req.user.role,
    },
    modules,
  });
});

// ─── PUT /auth/password — altera senha do próprio usuário ────────────────────
router.put("/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Informe a senha atual e a nova senha" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "A nova senha deve ter pelo menos 6 caracteres" });
  }

  try {
    const result = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [req.user.id]
    );

    const match = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!match) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
      [hash, req.user.id]
    );

    res.json({ message: "Senha alterada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao alterar senha" });
  }
});

module.exports = router;
