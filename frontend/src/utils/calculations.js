import { IR_TABLE, FX_DEFAULT } from "./constants";
import { diffDays } from "./formatters";

// ─── Alíquota IR pelo prazo em dias ───────────────────────────────────────────
export function getIRAliq(dias) {
  const row = IR_TABLE.find(r => dias <= r.dias);
  return (row?.aliq ?? 15) / 100;
}

// ─── Projeta 24 meses para um investimento ────────────────────────────────────
export function calcMonths(inv, cdiRate, fx = FX_DEFAULT, total = 24) {
  const fxRate  = inv.intl ? (fx[inv.currency] || 1) : 1;
  const capital = (inv.valor || 0) * fxRate;
  const taxaAA  = inv.tipo === "cdb" || inv.tipo === "tesouro"
    ? ((inv.pct || 100) / 100) * (cdiRate / 100)
    : (inv.pct || 0) / 100;
  const taxaMensal = Math.pow(1 + taxaAA, 1 / 12) - 1;

  const inicio = new Date(inv.data || Date.now());

  return Array.from({ length: total }, (_, i) => {
    const mes        = new Date(inicio);
    mes.setMonth(mes.getMonth() + i + 1);
    const dias       = diffDays(inv.data, mes.toISOString().split("T")[0]);
    const saldo      = capital * Math.pow(1 + taxaMensal, i + 1);
    const rendimento = saldo - capital;
    const aliq       = inv.ir ? getIRAliq(dias) : 0;
    const ir         = rendimento * aliq;
    const saldoLiq   = saldo - ir;
    const rendLiq    = rendimento - ir;

    return {
      mes:          mes.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      saldo,
      rendimento,
      ir,
      saldoLiquido: saldoLiq,
      rendLiquido:  rendLiq,
    };
  });
}

// ─── Verifica alerta de faixa de IR ──────────────────────────────────────────
export function getIRAlert(inv) {
  if (!inv.ir || !inv.data) return null;
  const dias   = diffDays(inv.data);
  const faixas = [180, 360, 720];
  for (const limite of faixas) {
    const restam = limite - dias;
    if (restam > 0 && restam <= 30) {
      const aliqAtual = getIRAliq(dias) * 100;
      const aliqProx  = getIRAliq(limite + 1) * 100;
      return { inv, dias, restam, aliqAtual, aliqProx };
    }
  }
  return null;
}

// ─── Verifica alerta de vencimento ───────────────────────────────────────────
export function getVencAlert(inv) {
  if (!inv.vencimento) return null;
  const restam = diffDays(new Date().toISOString().split("T")[0], inv.vencimento) * -1 + diffDays(inv.vencimento);

  // Calcula dias até o vencimento
  const hoje   = new Date();
  const venc   = new Date(inv.vencimento);
  const diasAte = Math.floor((venc - hoje) / 86_400_000);

  if (diasAte >= 0 && diasAte <= 30) {
    return { inv, diasAte };
  }
  return null;
}
