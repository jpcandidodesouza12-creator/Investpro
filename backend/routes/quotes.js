const express = require("express");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = { data: null, updatedAt: null };

function isCacheValid() {
  return cache.data && cache.updatedAt && (Date.now() - cache.updatedAt) < CACHE_TTL_MS;
}

// ─── Data no formato MM-DD-YYYY para o BCB (sexta se for fim de semana) ───────
function ptaxDate() {
  const d   = new Date();
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() - 2);
  if (day === 6) d.setDate(d.getDate() - 1);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}-${d.getFullYear()}`;
}

// ─── BCB: CDI + PTAX USD/EUR ──────────────────────────────────────────────────
async function fetchBCB() {
  const date = ptaxDate();
  const [cdiRes, usdRes, eurRes] = await Promise.allSettled([
    fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.4392/dados/ultimos/1?formato=json"),
    fetch(`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='USD'&@dataCotacao='${date}'&$top=1&$format=json&$select=cotacaoVenda`),
    fetch(`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='EUR'&@dataCotacao='${date}'&$top=1&$format=json&$select=cotacaoVenda`),
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

// ─── Brapi: ações B3 e ações EUA ─────────────────────────────────────────────
async function fetchBrapiStocks(tickers) {
  if (!tickers?.length) return {};
  try {
    const res = await fetch(
      `https://brapi.dev/api/quote/${tickers.join(",")}?fundamental=false`,
      { headers: { "User-Agent": "InvestPro/1.0" } }
    );
    if (!res.ok) return {};
    const data = await res.json();
    const result = {};
    (data.results || []).forEach(s => {
      result[s.symbol] = {
        price:     s.regularMarketPrice,
        change:    s.regularMarketChange,
        changePct: s.regularMarketChangePercent,
      };
    });
    return result;
  } catch { return {}; }
}

// ─── Brapi: crypto ────────────────────────────────────────────────────────────
async function fetchBrapiCrypto(tickers) {
  if (!tickers?.length) return {};
  try {
    const res = await fetch(
      `https://brapi.dev/api/v2/crypto?coin=${tickers.join(",")}&currency=BRL`,
      { headers: { "User-Agent": "InvestPro/1.0" } }
    );
    if (!res.ok) return {};
    const data = await res.json();
    const result = {};
    (data.coins || []).forEach(c => {
      result[c.coin] = {
        price:     c.regularMarketPrice,
        change:    c.regularMarketChange,
        changePct: c.regularMarketChangePercent,
      };
    });
    return result;
  } catch { return {}; }
}

// ─── GET /quotes — aceita tickers customizados via query params ───────────────
// Ex: GET /quotes?br=PETR4,VALE3&us=AAPL,MSFT&crypto=BTC,ETH
router.get("/", requireAuth, async (req, res) => {
  // Extrai tickers da query string (opcional — usa defaults se não enviado)
  const brTickers     = req.query.br     ? req.query.br.split(",").filter(Boolean).slice(0, 10)     : ["PETR4","VALE3","ITUB4","BBDC4","MGLU3"];
  const usTickers     = req.query.us     ? req.query.us.split(",").filter(Boolean).slice(0, 10)     : ["AAPL","MSFT","NVDA","GOOGL","AMZN"];
  const cryptoTickers = req.query.crypto ? req.query.crypto.split(",").filter(Boolean).slice(0, 10) : ["BTC","ETH","SOL","BNB"];

  // Cache só é válido se os tickers forem os defaults
  const isDefault = !req.query.br && !req.query.us && !req.query.crypto;
  if (isDefault && isCacheValid()) {
    return res.json({ ...cache.data, cached: true, cachedAt: new Date(cache.updatedAt).toISOString() });
  }

  try {
    const [bcb, brData, usData, cryptoData] = await Promise.allSettled([
      fetchBCB(),
      fetchBrapiStocks(brTickers),
      fetchBrapiStocks(usTickers),
      fetchBrapiCrypto(cryptoTickers),
    ]);

    const bcb_    = bcb.status     === "fulfilled" ? bcb.value     : {};
    const br_     = brData.status  === "fulfilled" ? brData.value  : {};
    const us_     = usData.status  === "fulfilled" ? usData.value  : {};
    const crypto_ = cryptoData.status === "fulfilled" ? cryptoData.value : {};

    const result = {
      cdi: bcb_.cdi,
      currencies: {
        USD: bcb_.usd ? { price: bcb_.usd, source: "BCB/PTAX" } : null,
        EUR: bcb_.eur ? { price: bcb_.eur, source: "BCB/PTAX" } : null,
      },
      br:     br_,
      us:     us_,
      crypto: crypto_,
      updatedAt: new Date().toLocaleString("pt-BR"),
      source:    "BCB + Brapi",
    };

    if (isDefault) {
      cache.data      = result;
      cache.updatedAt = Date.now();
    }

    res.json({ ...result, cached: false });
  } catch (err) {
    console.error("Quotes error:", err);
    res.status(500).json({ error: "Erro ao buscar cotações" });
  }
});

// ─── DELETE /quotes/cache ─────────────────────────────────────────────────────
router.delete("/cache", requireAuth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Apenas admins podem limpar o cache" });
  }
  cache.data = null; cache.updatedAt = null;
  res.json({ message: "Cache limpo" });
});

module.exports = router;
