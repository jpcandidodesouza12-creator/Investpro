const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ─── Lista de todos os módulos do app ─────────────────────────────────────────
const ALL_MODULES = [
  "dashboard",
  "investments",
  "renda",
  "history",
  "comparator",
  "projection",
  "quotes",
  "categories",
  "settings",
];

// ─── Permissões padrão por perfil ─────────────────────────────────────────────
const DEFAULT_PERMISSIONS = {
  admin: ALL_MODULES, // Admin vê tudo
  user:  ["dashboard", "investments", "renda", "history", "comparator", "projection", "quotes", "categories"],
  guest: ["dashboard", "comparator", "projection", "quotes"],
};

// ─── Cria tabelas se não existirem ────────────────────────────────────────────
async function setupDatabase() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(255) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(20)  NOT NULL DEFAULT 'user'
                    CHECK (role IN ('admin','user','guest')),
        active      BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      );
    `);

    // Tabela de permissões por módulo (uma linha por usuário/módulo)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_modules (
        id        SERIAL PRIMARY KEY,
        user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        module    VARCHAR(50) NOT NULL,
        enabled   BOOLEAN NOT NULL DEFAULT true,
        UNIQUE(user_id, module)
      );
    `);

    // Tabela de dados por usuário (investimentos, renda etc. em JSONB)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_data (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        data_key   VARCHAR(50) NOT NULL,
        data_value JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, data_key)
      );
    `);

    // Tabela de sessões revogadas (logout + expiração)
    await client.query(`
      CREATE TABLE IF NOT EXISTS revoked_tokens (
        id         SERIAL PRIMARY KEY,
        jti        VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL
      );
    `);

    await client.query("COMMIT");
    console.log("✓ Banco de dados pronto");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("✗ Erro ao configurar banco:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

// ─── Cria o Admin Master no primeiro start ────────────────────────────────────
async function seedAdmin() {
  const bcrypt = require("bcryptjs");
  const email  = process.env.ADMIN_EMAIL;
  const pass   = process.env.ADMIN_PASSWORD;
  const name   = process.env.ADMIN_NAME || "Admin";

  if (!email || !pass) {
    console.warn("⚠ ADMIN_EMAIL / ADMIN_PASSWORD não definidos no .env — pulando seed");
    return;
  }

  const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (exists.rows.length > 0) {
    console.log("✓ Admin já existe");
    return;
  }

  const hash = await bcrypt.hash(pass, 12);
  const res  = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,'admin') RETURNING id",
    [name, email, hash]
  );
  const adminId = res.rows[0].id;

  // Libera todos os módulos para o admin
  const inserts = ALL_MODULES.map(m =>
    pool.query(
      "INSERT INTO user_modules (user_id, module, enabled) VALUES ($1,$2,true) ON CONFLICT DO NOTHING",
      [adminId, m]
    )
  );
  await Promise.all(inserts);
  console.log(`✓ Admin Master criado: ${email}`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function getUserModules(userId) {
  const res = await pool.query(
    "SELECT module, enabled FROM user_modules WHERE user_id = $1",
    [userId]
  );
  return res.rows
    .filter(r => r.enabled)
    .map(r => r.module);
}

async function setUserModules(userId, modules) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Remove todas as permissões atuais
    await client.query("DELETE FROM user_modules WHERE user_id = $1", [userId]);
    // Insere as novas
    for (const m of ALL_MODULES) {
      await client.query(
        "INSERT INTO user_modules (user_id, module, enabled) VALUES ($1,$2,$3)",
        [userId, m, modules.includes(m)]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  setupDatabase,
  seedAdmin,
  getUserModules,
  setUserModules,
  ALL_MODULES,
  DEFAULT_PERMISSIONS,
};
