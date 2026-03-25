require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { setupDatabase, seedAdmin, closePool } = require("./database");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares ─────────────────────────────────────────────────────────────

// LIBERAÇÃO TOTAL DE CORS: Aberto para qualquer origem para teste
app.use(cors({
  origin: '*', 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "2mb" }));

// ─── Rotas ────────────────────────────────────────────────────────────────────
// Removido os limiters temporariamente para garantir que você não seja bloqueado
app.use("/auth",  require("./routes/auth"));
app.use("/admin", require("./routes/admin"));
app.use("/data",  require("./routes/data"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ error: "Rota não encontrada" }));

// Middleware de erro detalhado
app.use((err, req, res, next) => {
  console.error("Erro no Servidor:", err);
  res.status(500).json({ error: "Erro interno do servidor", details: err.message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await setupDatabase();
    await seedAdmin();
    const server = app.listen(PORT, () => {
      console.log(`✓ Servidor InvestPro rodando na porta ${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} recebido — encerrando servidor...`);
      server.close(async () => {
        await closePool();
        console.log("✓ Servidor encerrado com segurança");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));
  } catch (err) {
    console.error("✗ Falha ao iniciar:", err.message);
    process.exit(1);
  }
}

start();