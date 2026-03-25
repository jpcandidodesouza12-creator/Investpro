const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Ajuste CRÍTICO para o Neon: SSL sempre ativo com rejectUnauthorized false
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const ALL_MODULES = [
  "dashboard","investments","renda","history",
  "comparator","projection","quotes","categories","settings",
];

const DEFAULT_PERMISSIONS = {
  admin: ALL_MODULES,
  user:  ["dashboard","investments","renda","history","comparator","projection","quotes","categories"],
  guest: ["dashboard","comparator","projection","quotes"],
};

const USER_STATUS = { ACTIVE:"active", PENDING:"pending", REJECTED:"rejected" };

async function setupDatabase() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(255) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(20)  NOT NULL DEFAULT 'user',
        status      VARCHAR(20)  NOT NULL DEFAULT 'active',
        active      BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Tabela de módulos (Acesso)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_modules (
        id      SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        module  VARCHAR(50) NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT true,
        UNIQUE(user_id, module)
      );
    `);

    // 3. Tabela de dados financeiros
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

    // 4. Tabela de tokens revogados (Logout)
    await client.query(`
      CREATE TABLE IF NOT EXISTS revoked_tokens (
        id         SERIAL PRIMARY KEY,
        jti        VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL
      );
    `);

    await client.query("COMMIT");
    console.log("✓ Banco de dados Neon pronto e tabelas verificadas");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("✗ Erro ao configurar banco:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

async function seedAdmin() {
  const bcrypt = require("bcryptjs");
  // Se você não definiu essas variáveis no Northflank, o admin não será criado!
  const email = process.env.ADMIN_EMAIL || "jpcandidodesouza12@gmail.com";
  const pass = process.env.ADMIN_PASSWORD || "123456"; 

  try {
    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (exists.rows.length > 0) {
      console.log("✓ Admin Master já existe no Neon");
      return;
    }

    const hash = await bcrypt.hash(pass, 12);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role, status) VALUES ($1,$2,$3,'admin','active') RETURNING id",
      ["João Paulo", email, hash]
    );

    const userId = result.rows[0].id;
    // Habilita todos os módulos para o admin criado
    for (const mod of ALL_MODULES) {
      await pool.query(
        "INSERT INTO user_modules (user_id, module, enabled) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
        [userId, mod, true]
      );
    }
    console.log(`✓ Admin Master criado com sucesso: ${email}`);
  } catch (err) {
    console.error("✗ Erro ao criar Seed Admin:", err.message);
  }
}

async function getUserModules(userId) {
  try {
    const result = await pool.query(
      "SELECT module FROM user_modules WHERE user_id = $1 AND enabled = true",
      [userId]
    );
    // Se não houver módulos no banco, retorna os básicos para não quebrar o dashboard
    if (result.rows.length === 0) return ["dashboard", "investments"];
    return result.rows.map(r => r.module);
  } catch (err) {
    return ["dashboard"];
  }
}

function closePool() { return pool.end(); }

module.exports = {
  pool, setupDatabase, seedAdmin,
  getUserModules, closePool,
  ALL_MODULES, DEFAULT_PERMISSIONS, USER_STATUS,
};