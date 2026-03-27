import { P } from "../../styles/theme";
import { Icon } from "./Icon";

export function KPI({ label, value, color, icon }) {
  return (
    <div style={P.kpiCard} className="card-hover">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={P.kpiLabel}>{label}</div>
        {icon && (
          <div style={{ width:34, height:34, borderRadius:9, background:`${color}1a`, display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>
            <Icon name={icon} size={16} />
          </div>
        )}
      </div>
      <div style={{ ...P.kpiValue, color }} className="kpi-value">{value}</div>
    </div>
  );
}
