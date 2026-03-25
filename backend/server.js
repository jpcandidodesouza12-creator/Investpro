require("dotenv").config();

const express   = require("express");
const helmet    = require("helmet");
const cors      = require("cors");
const rateLimit = require("express-rate-limit");
const { setupDatabase, seedAdmin, closePool } = require("./database");

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares globais ───────────────────────────────────────────────────────

// Ajuste no Helmet para permitir que o backend converse com o localhost sem bloqueios de segurança rígidos
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// MARRETA DO CORS: Liberado para aceitar seu computador (localhost) e as nuvens
app.use(cors({ 
  origin: true, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "2mb" }));

// ─── Rate limiting (Aumentei o limite para evitar que você seja bloqueado nos testes) ───
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos apenas
  max: 50, // 50 tentativas (mais folga para você)
  message: { error: "Muitas tentativas. Tente novamente em alguns minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 20,
  message: { error: "Muitas solicitações de registro. Aguarde um pouco." },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ─── Rotas ────────────────────────────────────────────────────────────────────
app.use("/auth/login",    loginLimiter);
app.use("/auth/register", registerLimiter);

app.use("/auth",  require("./routes/auth"));
app.use("/admin", require("./routes/admin"));
app.use("/data",  require("./routes/data"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ error: "Rota não encontrada" }));

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await setupDatabase();
    await seedAdmin();
    const server = app.listen(PORT, () => {
      console.log(`✓ InvestPro Backend na porta ${PORT}`);
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