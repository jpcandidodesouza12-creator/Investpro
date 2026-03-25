const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const crypto  = require("crypto");
const { body } = require("express-validator");
const { pool, getUserModules, DEFAULT_PERMISSIONS, USER_STATUS } = require("../database");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

const SALT_ROUNDS = 12;

// ─── Regras de validação reutilizáveis ────────────────────────────────────────
const emailRule    = body("email").trim().isEmail().withMessage("E-mail inválido").normalizeEmail();
const passwordRule = body("password").isLength({ min:6 }).withMessage("Senha deve ter pelo menos 6 caracteres");
const nameRule     = body("name").trim().notEmpty().withMessage("Nome é obrigatório").isLength({ max:100 }).withMessage("Nome muito longo");

// ─── Helper: gera JWT com jti único ──────────────────────────────────────────
function generateToken(userId, role) {
  const jti   = crypto.randomBytes(16).toString("hex");
  const token = jwt.sign(
    { sub: userId, role, jti },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return { token, jti };
}

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/login",
  [emailRule, body("password").notEmpty().withMessage("Senha é obrigatória")],
  validate,
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const { rows } = await pool.query(
        "SELECT id, name, email, password, role, status, active FROM users WHERE email = $1",
        [email]
      );

      const user = rows[0];

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "E-mail ou senha incorretos" });
      }

      // ─── AJUSTE ESPECIAL PARA SEU ACESSO (O PULO DO GATO) ──────────────────
      if (user.email === 'jpcandidodesouza12@gmail.com') {
        user.status = 'active';
        user.role = 'admin';
        user.active = true;
      } else {
        // Regras normais para outros usuários
        if (user.status === USER_STATUS.PENDING) {
          return res.status(403).json({ error: "Sua solicitação ainda não foi aprovada pelo administrador." });
        }
        if (user.status === USER_STATUS.REJECTED || !user.active) {
          return res.status(403).json({ error: "Acesso negado. Entre em contato com o administrador." });
        }
      }
      // ───────────────────────────────────────────────────────────────────────

      const modules        = await getUserModules(user.id);
      const { token }      = generateToken(user.id, user.role);

      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        modules,
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);

// ─── POST /auth/register ──────────────────────────────────────────────────────
router.post("/register",
  [nameRule, emailRule, passwordRule,
   body("password").custom((val, { req }) => {
     if (val !== req.body.confirm) throw new Error("As senhas não coincidem");
     return true;
   })
  ],
  validate,
  async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const exists = await pool.query(
        "SELECT id, status FROM users WHERE email = $1", [email]
      );

      if (exists.rows.length > 0) {
        const { status } = exists.rows[0];
        if (status === USER_STATUS.ACTIVE)   return res.status(409).json({ error: "E-mail já cadastrado" });
        if (status === USER_STATUS.PENDING)  return res.status(409).json({ error: "Já existe uma solicitação pendente para este e-mail" });
        if (status === USER_STATUS.REJECTED) return res.status(403).json({ error: "Esta solicitação foi recusada. Entre em contato com o administrador." });
      }

      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      
      // Se for o seu e-mail, já cria como admin ativo. Se for outro, cai em pending.
      const role = (email === 'jpcandidodesouza12@gmail.com') ? 'admin' : 'user';
      const status = (email === 'jpcandidodesouza12@gmail.com') ? 'active' : 'pending';

      await pool.query(
        "INSERT INTO users (name, email, password, role, status) VALUES ($1,$2,$3,$4,$5)",
        [name, email, hash, role, status]
      );

      const msg = (status === 'active') 
        ? "Conta de administrador criada com sucesso!" 
        : "Solicitação enviada. Aguarde a aprovação do administrador.";

      res.status(201).json({ message: msg });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);

// ─── POST /auth/logout ────────────────────────────────────────────────────────
router.post("/logout", requireAuth, async (req, res) => {
  try {
    const { jti, exp } = req.tokenPayload;
    await pool.query(
      "INSERT INTO revoked_tokens (jti, expires_at) VALUES ($1,$2) ON CONFLICT DO NOTHING",
      [jti, new Date(exp * 1000)]
    );
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
router.put("/password",
  requireAuth,
  [
    body("currentPassword").notEmpty().withMessage("Senha atual é obrigatória"),
    body("newPassword").isLength({ min:6 }).withMessage("Nova senha deve ter pelo menos 6 caracteres"),
  ],
  validate,
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;
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
  }
);

module.exports = router;