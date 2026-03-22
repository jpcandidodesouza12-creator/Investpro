require("dotenv").config();

const express     = require("express");
const helmet      = require("helmet");
const cors        = require("cors");
const rateLimit   = require("express-rate-limit");
const { setupDatabase, seedAdmin } = require("./database");

const authRoutes  = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const dataRoutes  = require("./routes/data");

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Configurações e Segurança ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: "*", // Permite que a Vercel acesse o Backend sem erros de CORS
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));

// Proteção contra muitas tentativas de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Muitas tentativas. Tente novamente em 15 minutos." },
});

// ─── Rotas ──────────────────────────────────────────────────────────────────
app.use("/auth", loginLimiter, authRoutes);
app.use("/admin", adminRoutes);
app.use("/data", dataRoutes);

// Rota de teste (Health Check)
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "InvestPro Backend is running" });
});

// Tratamento de erros globais
app.use((err, req, res, next) => {
  console.error("Erro no Servidor:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

// ─── Inicialização ──────────────────────────────────────────────────────────
async function start() {
  try {
    await setupDatabase(); // Cria as tabelas no PostgreSQL
    await seedAdmin();     // Cria o usuário admin@teste.com se não existir
    
    // O '0.0.0.0' é fundamental para o Railway expor o serviço
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error("✗ Falha crítica ao iniciar:", err.message);
    process.exit(1);
  }
}

start();
