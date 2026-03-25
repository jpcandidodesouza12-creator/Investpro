// ─── Backend ──────────────────────────────────────────────────────────────────
export const API_URL = import.meta.env.VITE_API_URL || "https://backend--investpro-api--k24h5cjhwxqg.code.run";

// ─── Storage keys ─────────────────────────────────────────────────────────────
export const LS_KEY   = "investpro_v6";
export const LS_AUTH  = "investpro_auth";
export const LS_SNAPS = "investpro_snaps_v1";

// ─── Defaults financeiros ─────────────────────────────────────────────────────
export const CDI_ATUAL  = 14.51;
export const CDI_REF    = "20/03/2026";
export const FX_DEFAULT = { USD: 5.72, EUR: 6.21 };
export const MAX_SNAPS  = 10;

export const DEFAULT_SETTINGS = {
  cdiRate: CDI_ATUAL,
  fx:      FX_DEFAULT,
  meta:    { ativa: false, valor: 100000, prazo: 24 },
};

// ─── Tipos de investimento ────────────────────────────────────────────────────
export const TYPES = [
  { id: "cdb",       label: "CDB",       icon: "🏦", color: "#F5C518", ir: true,  intl: false },
  { id: "lci",       label: "LCI/LCA",   icon: "🌾", color: "#ffffff", ir: false, intl: false },
  { id: "tesouro",   label: "Tesouro",   icon: "🏛️", color: "#aaaaaa", ir: true,  intl: false },
  { id: "bolsa",     label: "Bolsa BR",  icon: "📈", color: "#F5C518", ir: false, intl: false },
  { id: "fii",       label: "FII",       icon: "🏢", color: "#e2a07e", ir: false, intl: false },
  { id: "crypto",    label: "Crypto",    icon: "₿",  color: "#f7931a", ir: false, intl: false },
  { id: "stocks_us", label: "Ações EUA", icon: "🇺🇸", color: "#60a5fa", ir: false, intl: true, currency: "USD" },
  { id: "etf_us",    label: "ETF EUA",   icon: "📊", color: "#34d399", ir: false, intl: true, currency: "USD" },
  { id: "etf_eu",    label: "ETF EUR",   icon: "🇪🇺", color: "#a78bfa", ir: false, intl: true, currency: "EUR" },
  { id: "outro",     label: "Outro",     icon: "📦", color: "#9a9a9a", ir: false, intl: false },
];

export function getType(id) {
  return TYPES.find(t => t.id === id) || TYPES[TYPES.length - 1];
}

// ─── Navegação ────────────────────────────────────────────────────────────────
export const NAV = [
  { id: "dashboard",   label: "Dashboard",    icon: "dashboard"   },
  { id: "investments", label: "Investimentos", icon: "investments" },
  { id: "renda",       label: "Minha Renda",  icon: "renda"       },
  { id: "history",     label: "Aportes",       icon: "history"     },
  { id: "comparator",  label: "Comparador",    icon: "comparator"  },
  { id: "projection",  label: "Projeção",      icon: "projection"  },
  { id: "quotes",      label: "Cotações",      icon: "quotes"      },
  { id: "categories",  label: "Categorias",    icon: "categories"  },
  { id: "settings",    label: "Config.",       icon: "settings"    },
  { id: "admin",       label: "Admin",         icon: "alert"       },
];

// ─── Minha Renda ──────────────────────────────────────────────────────────────
export const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

export const DEF_RENDA_CATS = [
  { id:1,  nome:"Consórcio Casa",  icone:"🏠" },
  { id:2,  nome:"Consórcio 80k",   icone:"🏗️" },
  { id:3,  nome:"Consórcio 20k",   icone:"🏗️" },
  { id:4,  nome:"Aluguel",         icone:"🏠" },
  { id:5,  nome:"Internet",        icone:"🌐" },
  { id:6,  nome:"Energia",         icone:"⚡" },
  { id:7,  nome:"Água",            icone:"💧" },
  { id:8,  nome:"Claro",           icone:"📱" },
  { id:9,  nome:"Plano odonto",    icone:"🦷" },
  { id:10, nome:"Plano petlove",   icone:"🐾" },
  { id:11, nome:"MEI",             icone:"💼" },
  { id:12, nome:"Inter",           icone:"💳" },
  { id:13, nome:"C6",              icone:"💳" },
  { id:14, nome:"Mercado pago",    icone:"💳" },
  { id:15, nome:"Nubank",          icone:"💳" },
  { id:16, nome:"Itaú",            icone:"💳" },
  { id:17, nome:"Supermercado",    icone:"🛒" },
  { id:18, nome:"Outros",          icone:"📦" },
];

export const DEF_RENDA_GASTOS_PREV = {
  1:0, 2:496, 3:201, 4:1000, 5:100, 6:240, 7:120, 8:40,
  9:35, 10:34, 11:86, 12:800, 13:3700, 14:90, 15:0, 16:0, 17:0, 18:0,
};

export function defRendaMes() {
  return {
    receitas: { salario: 9900, freelance: 0, outros: 200 },
    gastos:   DEF_RENDA_CATS.map(c => ({
      catId:    c.id,
      previsto: DEF_RENDA_GASTOS_PREV[c.id] || 0,
      real:     0,
    })),
  };
}

export function defRenda() {
  const r = {};
  MESES.forEach((_, i) => { r[i] = defRendaMes(); });
  return r;
}

// ─── Dados padrão ─────────────────────────────────────────────────────────────
export const DEF_CATS = [
  { id:1, nome:"Renda Fixa",    cor:"#F5C518" },
  { id:2, nome:"Renda Variável",cor:"#60a5fa" },
  { id:3, nome:"Internacional", cor:"#a78bfa" },
];

export const DEF_INVS = [];

export const DEF_QUOTES = {
  watchlist: {
    currencies: ["USD","EUR","GBP","ARS","JPY"],
    br:         ["PETR4","VALE3","ITUB4","BBDC4","MGLU3"],
    us:         ["AAPL","MSFT","NVDA","GOOGL","AMZN"],
    crypto:     ["BTC","ETH","SOL","BNB"],
  },
  data:      null,
  updatedAt: null,
  error:     null,
};

// ─── Alíquotas IR ─────────────────────────────────────────────────────────────
export const IR_TABLE = [
  { dias: 180, aliq: 22.5 },
  { dias: 360, aliq: 20.0 },
  { dias: 720, aliq: 17.5 },
  { dias: Infinity, aliq: 15.0 },
];
