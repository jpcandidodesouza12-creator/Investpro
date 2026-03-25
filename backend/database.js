const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(255) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,
        role        VARCHAR(20)  NOT NULL DEFAULT 'user'
                    CHECK (role IN ('admin','user','guest')),
        status      VARCHAR(20)  NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','pending','rejected')),
        active      BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      );
    `);

    // Migração segura: garante coluna status em bancos existentes
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'status'
        ) THEN
          ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'
          CHECK (status IN ('active','pending','rejected'));
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_modules (
        id      SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        module  VARCHAR(50) NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT true,
        UNIQUE(user_id, module)
      );
    `);

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

    await client.query(`
      CREATE TABLE IF NOT EXISTS revoked_tokens (
        id         SERIAL PRIMARY KEY,
        jti        VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_data_user_id    ON user_data(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_modules_user_id ON user_modules(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_status         ON users(status);
      CREATE INDEX IF NOT EXISTS idx_users_email          ON users(email);
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

async function seedAdmin() {
  const bcrypt = require("bcryptjs");
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: pass, ADMIN_NAME: name = "Admin" } = process.env;

  if (!email || !pass) {
    console.warn("⚠ ADMIN_EMAIL / ADMIN_PASSWORD não definidos — pulando seed");
    return;
  }

  const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (exists.rows.length > 0) { console.log("✓ Admin já existe"); return; }

  const hash   = await bcrypt.hash(pass, 12);
  const result = await pool.query(
    "INSERT INTO users (name, email, password, role, status) VALUES ($1,$2,$3,'admin','active') RETURNING id",
    [name, email, hash]
  );
  await setUserModules(result.rows[0].id, ALL_MODULES);
  console.log(`✓ Admin Master criado: ${email}`);
}

async function getUserModules(userId) {
  const result = await pool.query(
    "SELECT module FROM user_modules WHERE user_id = $1 AND enabled = true",
    [userId]
  );
  return result.rows.map(r => r.module);
}

async function setUserModules(userId, modules) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM user_modules WHERE user_id = $1", [userId]);
    for (const module of ALL_MODULES) {
      await client.query(
        "INSERT INTO user_modules (user_id, module, enabled) VALUES ($1,$2,$3)",
        [userId, module, modules.includes(module)]
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

function closePool() { return pool.end(); }

module.exports = {
  pool, setupDatabase, seedAdmin,
  getUserModules, setUserModules, closePool,
  ALL_MODULES, DEFAULT_PERMISSIONS, USER_STATUS,
};
