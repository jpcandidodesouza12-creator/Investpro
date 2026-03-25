const jwt  = require("jsonwebtoken");
const { pool } = require("../database");

// ─── Verifica token JWT ────────────────────────────────────────────────────────
async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Verifica se o token foi revogado (logout)
    const revoked = await pool.query(
      "SELECT id FROM revoked_tokens WHERE jti = $1",
      [payload.jti]
    );
    if (revoked.rows.length > 0) {
      return res.status(401).json({ error: "Token inválido — faça login novamente" });
    }

    // Verifica se o usuário ainda está ativo
    const user = await pool.query(
      "SELECT id, name, email, role, active FROM users WHERE id = $1",
      [payload.sub]
    );
    if (!user.rows.length || !user.rows[0].active) {
      return res.status(401).json({ error: "Usuário inativo ou removido" });
    }

    req.user = user.rows[0];
    req.tokenPayload = payload;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Sessão expirada — faça login novamente" });
    }
    return res.status(401).json({ error: "Token inválido" });
  }
}

// ─── Garante que só Admin acessa ──────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
}

// ─── Verifica se usuário tem acesso ao módulo ──────────────────────────────────
async function requireModule(moduleName) {
  return async (req, res, next) => {
    if (req.user.role === "admin") return next(); // Admin sempre passa

    const result = await pool.query(
      "SELECT enabled FROM user_modules WHERE user_id = $1 AND module = $2",
      [req.user.id, moduleName]
    );

    if (!result.rows.length || !result.rows[0].enabled) {
      return res.status(403).json({ error: `Acesso ao módulo '${moduleName}' não autorizado` });
    }
    next();
  };
}

module.exports = { requireAuth, requireAdmin, requireModule };
