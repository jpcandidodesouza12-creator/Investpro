const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const crypto  = require("crypto");
const { pool, getUserModules, setUserModules, DEFAULT_PERMISSIONS, USER_STATUS } = require("../database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ─── Helpers internos ─────────────────────────────────────────────────────────
const SALT_ROUNDS = 12;

function generateToken(userId, role) {
  const jti = crypto.randomBytes(16).toString("hex");
  const token = jwt.sign(
    { sub: userId, role, jti },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return { token, jti };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  if (!password || password.length < 6) return "Senha deve ter pelo menos 6 caracteres";
  return null;
}

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  try {
    const result = await pool.query(
      "SELECT id, name, email, password, role, status, active FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    // Mesma mensagem para usuário inexistente e senha errada — evita enumeração de e-mails
    if (!user) {
      return res.status(401).json({ error: "E-mail ou senha incorretos" });
    }

    if (user.status === USER_STATUS.PENDING) {
      return res.status(403).json({ error: "Sua solicitação ainda não foi aprovada pelo administrador." });
    }

    if (user.status === USER_STATUS.REJECTED || !user.active) {
      return res.status(403).json({ error: "Acesso negado. Entre em contato com o administrador." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "E-mail ou senha incorretos" });
    }

    const modules       = await getUserModules(user.id);
    const { token, jti } = generateToken(user.id, user.role);

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

// ─── POST /auth/register — auto-cadastro aguardando aprovação ─────────────────
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: "E-mail inválido" });
  }
  const passError = validatePassword(password);
  if (passError) {
    return res.status(400).json({ error: passError });
  }

  try {
    const exists = await pool.query(
      "SELECT id, status FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (exists.rows.length > 0) {
      const status = exists.rows[0].status;
      // Não revelamos se o e-mail existe em status ativo (evita enumeração)
      if (status === USER_STATUS.ACTIVE) {
        return res.status(409).json({ error: "E-mail já cadastrado" });
      }
      if (status === USER_STATUS.PENDING) {
        return res.status(409).json({ error: "Já existe uma solicitação pendente para este e-mail" });
      }
      if (status === USER_STATUS.REJECTED) {
        return res.status(403).json({ error: "Esta solicitação foi recusada. Entre em contato com o administrador." });
      }
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await pool.query(
      "INSERT INTO users (name, email, password, role, status) VALUES ($1,$2,$3,'user','pending')",
      [name.trim(), email.toLowerCase().trim(), hash]
    );

    res.status(201).json({
      message: "Solicitação enviada com sucesso. Aguarde a aprovação do administrador.",
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────
router.post("/logout", requireAuth, async (req, res) => {
  try {
    const { jti, exp } = req.tokenPayload;
    await pool.query(
      "INSERT INTO revoked_tokens (jti, expires_at) VALUES ($1,$2) ON CONFLICT DO NOTHING",
      [jti, new Date(exp * 1000)]
    );
    // Limpeza periódica de tokens expirados
    await pool.query("DELETE FROM revoked_tokens WHERE expires_at < NOW()");
    res.json({ message: "Logout realizado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao fazer logout" });
  }
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  const modules = await getUserModules(req.user.id);
  res.json({
    user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
    modules,
  });
});

// ─── PUT /auth/password ───────────────────────────────────────────────────────
router.put("/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Informe a senha atual e a nova senha" });
  }
  const passError = validatePassword(newPassword);
  if (passError) return res.status(400).json({ error: passError });

  try {
    const { rows } = await pool.query("SELECT password FROM users WHERE id = $1", [req.user.id]);
    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(401).json({ error: "Senha atual incorreta" });

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query("UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2", [hash, req.user.id]);
    res.json({ message: "Senha alterada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao alterar senha" });
  }
});

module.exports = router;
