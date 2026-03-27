import { useMemo } from "react";
import { calcMonths, getIRAlert, getVencAlert } from "../utils/calculations";
import { FX_DEFAULT } from "../utils/constants";

// ─── Derivações computadas a partir da lista de investimentos ─────────────────
export function useInvestments(invs, settings) {
  const fx = settings?.fx || FX_DEFAULT;

  // Projeta 24 meses para cada investimento
  const projs = useMemo(() =>
    invs.map(inv => ({
      ...inv,
      months: calcMonths(inv, settings?.cdiRate ?? 14.51, fx),
    })),
    [invs, settings?.cdiRate, fx]
  );

  // Consolida projeções mensais de todos os investimentos
  const cons = useMemo(() => {
    if (!projs.length) return [];
    return Array.from({ length: 24 }, (_, i) => ({
      mes:          projs[0].months[i].mes,
      saldo:        projs.reduce((a, c) => a + c.months[i].saldo, 0),
      rendimento:   projs.reduce((a, c) => a + c.months[i].rendimento, 0),
      ir:           projs.reduce((a, c) => a + c.months[i].ir, 0),
      saldoLiquido: projs.reduce((a, c) => a + c.months[i].saldoLiquido, 0),
      rendLiquido:  projs.reduce((a, c) => a + c.months[i].rendLiquido, 0),
    }));
  }, [projs]);

  // Total investido em BRL
  const totalInv = useMemo(() =>
    invs.reduce((a, inv) => {
      const fxRate = inv.currency ? (fx[inv.currency] || 1) : 1;
      return a + (inv.valor || 0) * fxRate;
    }, 0),
    [invs, fx]
  );

  // Alertas de IR (mudança de faixa em até 30 dias)
  const irAlerts = useMemo(() =>
    invs.map(getIRAlert).filter(Boolean),
    [invs]
  );

  // Alertas de vencimento (em até 30 dias)
  const vencAlerts = useMemo(() =>
    invs.map(getVencAlert).filter(Boolean),
    [invs]
  );

  // Urgentes = qualquer alerta ativo
  const urgent = useMemo(() =>
    [...irAlerts, ...vencAlerts],
    [irAlerts, vencAlerts]
  );

  return { projs, cons, totalInv, irAlerts, vencAlerts, urgent };
}
