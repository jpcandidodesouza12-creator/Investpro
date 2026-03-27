import { P } from "../../styles/theme";

export function ChartCard({ title, children, action }) {
  return (
    <div style={P.chartCard}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div style={P.chartTitle}>{title}</div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

export function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0e0d0b", border:"1px solid #2a2820", borderRadius:8, padding:"10px 14px", fontFamily:"'IBM Plex Mono',monospace", fontSize:11 }}>
      <div style={{ color:"#c9bfaa", fontWeight:600, marginBottom:6, borderBottom:"1px solid #1e1c16", paddingBottom:4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", justifyContent:"space-between", gap:12, marginBottom:2 }}>
          <span style={{ color:"#6a6458" }}>{p.name}</span>
          <span style={{ color: p.stroke || p.fill, fontWeight:600 }}>
            {"R$ " + Number(p.value || 0).toLocaleString("pt-BR", { minimumFractionDigits:2, maximumFractionDigits:2 })}
          </span>
        </div>
      ))}
    </div>
  );
}
