require("dotenv").config();

const express   = require("express");
const helmet    = require("helmet");
const cors      = require("cors");
const rateLimit = require("express-rate-limit");
const { setupDatabase, seedAdmin, closePool } = require("./database");

const app  = express();
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
].filter(Boolean);

// ─── Middlewares globais ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: "2mb" }));

// ─── Rate limiting ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Muitas tentativas. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Muitas solicitações. Tente novamente em 1 hora." },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ─── Rotas ────────────────────────────────────────────────────────────────────
app.use("/auth/login",    loginLimiter);
app.use("/auth/register", registerLimiter);

app.use("/auth",   require("./routes/auth"));
app.use("/admin",  require("./routes/admin"));
app.use("/data",   require("./routes/data"));
app.use("/quotes", require("./routes/quotes"));

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
