const express = require("express");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ─── Cache em memória — evita chamar a API a cada requisição ──────────────────
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos
const cache = { data: null, updatedAt: null };

function isCacheValid() {
  return cache.data && cache.updatedAt && (Date.now() - cache.updatedAt) < CACHE_TTL_MS;
}

// ─── Busca o CDI e PTAX (USD/EUR) no Banco Central ───────────────────────────
async function fetchBCB() {
  const [cdiRes, usdRes, eurRes] = await Promise.allSettled([
    fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.4392/dados/ultimos/1?formato=json"),
    fetch("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='USD'&@dataCotacao='" + ptaxDate() + "'&$top=1&$format=json&$select=cotacaoVenda"),
    fetch("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='EUR'&@dataCotacao='" + ptaxDate() + "'&$top=1&$format=json&$select=cotacaoVenda"),
  ]);

  let cdi = null, usd = null, eur = null;

  if (cdiRes.status === "fulfilled" && cdiRes.value.ok) {
    const data = await cdiRes.value.json();
    cdi = parseFloat(data[0]?.valor?.replace(",", ".")) || null;
  }

  if (usdRes.status === "fulfilled" && usdRes.value.ok) {
    const data = await usdRes.value.json();
    usd = data.value?.[0]?.cotacaoVenda || null;
  }

  if (eurRes.status === "fulfilled" && eurRes.value.ok) {
    const data = await eurRes.value.json();
    eur = data.value?.[0]?.cotacaoVenda || null;
  }

  return { cdi, usd, eur };
}

// ─── Data no formato MM-DD-YYYY que o BCB espera ─────────────────────────────
function ptaxDate() {
  const d = new Date();
  // Se for fim de semana, usa a sexta anterior (BCB não publica PTAX no fim de semana)
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() - 2);
  if (day === 6) d.setDate(d.getDate() - 1);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

// ─── Busca ações e crypto na Brapi ────────────────────────────────────────────
async function fetchBrapi(tickers, type = "stocks") {
  if (!tickers?.length) return {};

  try {
    const url = type === "crypto"
      ? `https://brapi.dev/api/v2/crypto?coin=${tickers.join(",")}&currency=BRL`
      : `https://brapi.dev/api/quote/${tickers.join(",")}?fundamental=false`;

    const res = await fetch(url, {
      headers: { "User-Agent": "InvestPro/1.0" },
    });

    if (!res.ok) return {};
    const data = await res.json();

    if (type === "crypto") {
      const result = {};
      (data.coins || []).forEach(c => {
        result[c.coin] = {
          price:     c.regularMarketPrice,
          change:    c.regularMarketChange,
          changePct: c.regularMarketChangePercent,
        };
      });
      return result;
    }

    const result = {};
    (data.results || []).forEach(s => {
      result[s.symbol] = {
        price:     s.regularMarketPrice,
        change:    s.regularMarketChange,
        changePct: s.regularMarketChangePercent,
      };
    });
    return result;
  } catch {
    return {};
  }
}

// ─── GET /quotes — retorna cotações reais com cache ───────────────────────────
router.get("/", requireAuth, async (req, res) => {
  // Serve do cache se ainda for válido
  if (isCacheValid()) {
    return res.json({ ...cache.data, cached: true, cachedAt: new Date(cache.updatedAt).toISOString() });
  }

  try {
    // Busca BCB e Brapi em paralelo
    const [bcb, brStocks, usStocks, crypto] = await Promise.allSettled([
      fetchBCB(),
      fetchBrapi(["PETR4", "VALE3", "ITUB4", "BBDC4", "MGLU3"]),
      fetchBrapi(["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN"]),
      fetchBrapi(["BTC", "ETH", "SOL", "BNB"], "crypto"),
    ]);

    const bcbData    = bcb.status    === "fulfilled" ? bcb.value    : {};
    const brData     = brStocks.status === "fulfilled" ? brStocks.value : {};
    const usData     = usStocks.status === "fulfilled" ? usStocks.value : {};
    const cryptoData = crypto.status  === "fulfilled" ? crypto.value  : {};

    const result = {
      cdi: bcbData.cdi,
      currencies: {
        USD: bcbData.usd ? { price: bcbData.usd, source: "BCB/PTAX" } : null,
        EUR: bcbData.eur ? { price: bcbData.eur, source: "BCB/PTAX" } : null,
      },
      br:     brData,
      us:     usData,
      crypto: cryptoData,
      updatedAt: new Date().toLocaleString("pt-BR"),
      source: "BCB + Brapi",
    };

    // Atualiza o cache
    cache.data      = result;
    cache.updatedAt = Date.now();

    res.json({ ...result, cached: false });
  } catch (err) {
    console.error("Quotes error:", err);
    res.status(500).json({ error: "Erro ao buscar cotações" });
  }
});

// ─── DELETE /quotes/cache — força atualização (apenas admin) ─────────────────
router.delete("/cache", requireAuth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Apenas admins podem limpar o cache" });
  }
  cache.data      = null;
  cache.updatedAt = null;
  res.json({ message: "Cache limpo — próxima requisição buscará dados frescos" });
});

module.exports = router;
