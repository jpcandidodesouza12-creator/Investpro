const { validationResult } = require("express-validator");

// ─── Middleware que verifica os resultados das validações ─────────────────────
// Uso: router.post("/rota", [...regras], validate, handler)
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Retorna apenas o primeiro erro — mensagem limpa para o frontend
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

module.exports = { validate };
