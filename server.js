require("dotenv").config();

const express    = require("express");
const helmet     = require("helmet");
const cors       = require("cors");
const rateLimit  = require("express-rate-limit");
const { setupDatabase, seedAdmin } = require("./database");

const authRoutes  = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const dataRoutes  = require("./routes/data");

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Segurança ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "*",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5500",  // Live Server do VS Code
  ],
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));

// Rate limiting — protege contra força bruta
app.use("/auth/login", rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
}));

app.use("/", rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 120,
}));

// ─── Rotas ────────────────────────────────────────────────────────────────────
app.use("/auth",  authRoutes);
app.use("/admin", adminRoutes);
app.use("/data",  dataRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Tratamento de erros globais
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await setupDatabase();
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`✓ InvestPro Backend rodando na porta ${PORT}`);
      console.log(`  Health: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error("✗ Falha ao iniciar:", err.message);
    process.exit(1);
  }
}

start();
