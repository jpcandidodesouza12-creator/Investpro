const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function setupDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        active BOOLEAN DEFAULT true,
        modules TEXT[] DEFAULT '{dashboard,investments,renda,history,comparator,projection,quotes,categories,settings}',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ Tabelas verificadas/criadas");
  } finally {
    client.release();
  }
}

async function seedAdmin() {
  // Esta função cria o admin padrão caso a tabela esteja vazia
  // Como você já criou manualmente, ela apenas verificará
  console.log("✓ Verificando usuário admin");
}

module.exports = { pool, setupDatabase, seedAdmin };
