// ─── Formatadores de valores ──────────────────────────────────────────────────

/** R$ 1.234,56 */
export function fmt(v) {
  return "R$ " + Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 14,51% */
export function fmtP(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + "%";
}

/** 22/03/2026 */
export function fmtD(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Dias entre duas datas ISO */
export function diffDays(from, to) {
  const a = new Date(from);
  const b = new Date(to || Date.now());
  return Math.floor((b - a) / 86_400_000);
}

/** Trunca texto longo */
export function truncate(str, max = 24) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}
