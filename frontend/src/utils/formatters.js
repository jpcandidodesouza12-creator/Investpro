// ─── Formatadores de valores ──────────────────────────────────────────────────

/** * Formata para moeda brasileira: 1234.56 -> R$ 1.234,56 
 */
export function fmt(v) {
  return "R$ " + Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** * Formata para porcentagem: 14.51 -> 14,51% 
 */
export function fmtP(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + "%";
}

/** * Formata data ISO para PT-BR: 2026-03-22 -> 22/03/2026 
 */
export function fmtD(iso) {
  if (!iso) return "—";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

/** * Calcula dias entre duas datas ISO 
 */
export function diffDays(from, to) {
  const a = new Date(from);
  const b = new Date(to || Date.now());
  return Math.floor((b - a) / 86_400_000);
}

/** * Trunca texto longo para UI 
 */
export function truncate(str, max = 24) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/** * Máscara de entrada para inputs financeiros.
 * Exemplo: "1500" -> "R$ 15,00"
 * Raciocínio Arquitetural: Garante que a entrada seja sempre tratada como string 
 * antes do regex para evitar crash por valor undefined/null.
 */
export function maskMoney(value) {
  const cleanValue = String(value || "").replace(/\D/g, "");
  
  if (!cleanValue) return "";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(cleanValue) / 100);
}