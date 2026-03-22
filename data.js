const express = require("express");
const { pool } = require("../database");
const { requireAuth, requireModule } = require("../middleware/auth");

const router = express.Router();

// Mapeamento: data_key → módulo necessário
const KEY_MODULE_MAP = {
  investments: "investments",
  categories:  "categories",
  deposits:    "history",
  renda:       "renda",
  quotes:      "quotes",
  settings:    "settings",
};

// ─── GET /data/:key — carrega dados de um usuário ────────────────────────────
router.get("/:key", requireAuth, async (req, res) => {
  const { key } = req.params;

  // Admin pode buscar dados de qualquer usuário via ?userId=
  const userId = req.user.role === "admin" && req.query.userId
    ? parseInt(req.query.userId)
    : req.user.id;

  try {
    const result = await pool.query(
      "SELECT data_value FROM user_data WHERE user_id = $1 AND data_key = $2",
      [userId, key]
    );
    res.json(result.rows[0]?.data_value ?? {});
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar dados" });
  }
});

// ─── PUT /data/:key — salva/atualiza dados de um usuário ─────────────────────
router.put("/:key", requireAuth, async (req, res) => {
  const { key }   = req.params;
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: "Campo 'value' é obrigatório" });
  }

  const userId = req.user.id;

  try {
    await pool.query(`
      INSERT INTO user_data (user_id, data_key, data_value, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, data_key)
      DO UPDATE SET data_value = $3, updated_at = NOW()
    `, [userId, key, JSON.stringify(value)]);

    res.json({ message: "Dados salvos", key });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar dados" });
  }
});

// ─── GET /data — carrega todos os dados do usuário (sync completo) ────────────
router.get("/", requireAuth, async (req, res) => {
  const userId = req.user.role === "admin" && req.query.userId
    ? parseInt(req.query.userId)
    : req.user.id;

  try {
    const result = await pool.query(
      "SELECT data_key, data_value FROM user_data WHERE user_id = $1",
      [userId]
    );

    const data = {};
    result.rows.forEach(r => { data[r.data_key] = r.data_value; });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar dados" });
  }
});

module.exports = router;
