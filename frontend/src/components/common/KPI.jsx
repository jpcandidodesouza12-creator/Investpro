import { P, T } from "../../styles/theme";
import { Icon } from "./Icon";

export function KPI({ label, value, color, icon, trend }) {
  return (
    <div style={P.kpiCard} className="card-hover">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={P.kpiLabel}>{label}</div>
        {icon && (
          <div style={{ width:28, height:28, borderRadius:6, background:`${color || T.accent}14`, display:"flex", alignItems:"center", justifyContent:"center", color: color || T.accent, flexShrink:0 }}>
            <Icon name={icon} size={13} />
          </div>
        )}
      </div>
      <div style={{ ...P.kpiValue, color: color || T.text }} className="kpi-value num">{value}</div>
      {/* Accent bar at bottom */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${color || T.accent}44, transparent)`, borderRadius:"0 0 10px 10px" }} />
    </div>
  );
}
