// --- FUNÇÃO DE DIFERENÇA DE DIAS ---
const diffDays = (d1, d2) => {
  const start = new Date(d1 || new Date());
  const end = new Date(d2 || new Date());
  return Math.floor((end - start) / (1000 * 60 * 60 * 24));
};

// --- FUNÇÃO DE CÁLCULO PRINCIPAL ---
export function calcMonths(inv, cdiRate, fx = {}, total = 24) {
  try {
    if (!inv) return [];

    const capital = Number(inv.valor) || 0;
    const cdiAnual = Number(cdiRate) / 100; // 14.51 -> 0.1451
    const pctLido = Number(inv.pct) || 0; 
    
    // Normalização para aceitar "LCI/LCA" conforme seu print
    const tipo = String(inv.tipo || "").toLowerCase().trim();
    
    // Identifica se é Pós-fixado (LCI, LCA, CDB, etc)
    const ehPos = ["lci", "lca", "lci/lca", "cdb", "tesouro", "lc"].includes(tipo);

    let taxaAnualEfetiva;
    if (ehPos) {
      // Cálculo Correto: 98% do CDI (0.98 * 0.1451)
      taxaAnualEfetiva = (pctLido / 100) * cdiAnual;
    } else {
      // Taxa fixa (Onde estava o erro da LCI)
      taxaAnualEfetiva = pctLido / 100;
    }

    const taxaMensal = Math.pow(1 + taxaAnualEfetiva, 1 / 12) - 1;
    const dataInicio = inv.data || new Date().toISOString().split("T")[0];

    return Array.from({ length: total }, (_, i) => {
      const nMeses = i + 1;
      const dataAlvo = new Date(dataInicio);
      dataAlvo.setMonth(dataAlvo.getMonth() + nMeses);
      
      const saldoBruto = capital * Math.pow(1 + taxaMensal, nMeses);
      const rendimento = saldoBruto - capital;

      // Isenção de IR para LCI/LCA
      const isento = tipo.includes("lci") || tipo.includes("lca");
      
      let valorIr = 0;
      if (!isento && (inv.ir || ["cdb", "tesouro"].includes(tipo))) {
         // Tabela regressiva simplificada
         const dias = nMeses * 30;
         const aliq = dias <= 180 ? 0.225 : dias <= 360 ? 0.20 : dias <= 720 ? 0.175 : 0.15;
         valorIr = rendimento * aliq;
      }

      return {
        mes: dataAlvo.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        saldo: Number(saldoBruto.toFixed(2)),
        rendimento: Number(rendimento.toFixed(2)),
        ir: Number(valorIr.toFixed(2)),
        saldoLiquido: Number((saldoBruto - valorIr).toFixed(2)),
        rendLiquido: Number((rendimento - valorIr).toFixed(2))
      };
    });
  } catch (error) {
    console.error("Erro no cálculo:", error);
    return [];
  }
}

// --- EXPORTS ADICIONAIS PARA EVITAR QUEBRA DE OUTROS COMPONENTES ---
export function getIRAliq(dias) {
  return dias <= 180 ? 0.225 : dias <= 360 ? 0.20 : dias <= 720 ? 0.175 : 0.15;
}

export function getIRAlert() { return null; }
export function getVencAlert() { return null; }