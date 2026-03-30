import { IR_TABLE, FX_DEFAULT } from "./constants";
import { diffDays } from "./formatters";

export function getIRAliq(dias) {
  const row = IR_TABLE.find(r => dias <= r.dias);
  return (row?.aliq ?? 15) / 100;
}

export function calcMonths(inv, cdiRate, fx = FX_DEFAULT, total = 24) {
  const fxRate = inv.intl ? (fx[inv.currency] || 1) : 1;
  const capital = (inv.valor || 0) * fxRate;

  // --- Raciocínio Arquitetural Corrigido ---
  // Incluímos lci e lca na base de cálculo do CDI.
  // Se for um título prefixado puro, ele deve ter um tipo diferente ou 
  // ser tratado especificamente.
  const isPostFixed = ["cdb", "tesouro", "lci", "lca"].includes(inv.tipo?.toLowerCase());

  const taxaAA = isPostFixed
    ? ((inv.pct || 100) / 100) * (cdiRate / 100)
    : (inv.pct || 0) / 100; 
  
  // Conversão de Taxa Anual para Mensal (Juros Compostos)
  const taxaMensal = Math.pow(1 + taxaAA, 1 / 12) - 1;
  const inicio = new Date(inv.data || Date.now());

  return Array.from({ length: total }, (_, i) => {
    const mes = new Date(inicio);
    mes.setMonth(mes.getMonth() + i + 1);
    
    const dias = diffDays(inv.data, mes.toISOString().split("T")[0]);
    const saldo = capital * Math.pow(1 + taxaMensal, i + 1);
    const rendimento = saldo - capital;

    // LCI/LCA geralmente possuem a flag inv.ir = false no banco de dados
    const aliq = inv.ir ? getIRAliq(dias) : 0;
    
    const ir = rendimento * aliq;
    const saldoLiq = saldo - ir;
    const rendLiq = rendimento - ir;

    return {
      mes: mes.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      saldo,
      rendimento,
      ir,
      saldoLiquido: saldoLiq,
      rendLiquido: rendLiq,
    };
  });
}

export function getIRAlert(inv) {
  if (!inv.ir || !inv.data) return null;
  const dias = diffDays(inv.data);
  const faixas = [180, 360, 720];
  for (const limite of faixas) {
    const restam = limite - dias;
    if (restam > 0 && restam <= 30) {
      const aliqAtual = getIRAliq(dias) * 100;
      const aliqProx = getIRAliq(limite + 1) * 100;
      return { inv, dias, restam, aliqAtual, aliqProx };
    }
  }
  return null;
}

export function getVencAlert(inv) {
  if (!inv.vencimento) return null;
  const hoje = new Date();
  const venc = new Date(inv.vencimento);
  
  // Cálculo simplificado de diferença de dias
  const diasAte = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));

  if (diasAte >= 0 && diasAte <= 30) {
    return { inv, diasAte };
  }
  return null;
}