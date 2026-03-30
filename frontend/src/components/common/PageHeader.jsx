import { P, T } from "../../styles/theme";

export function PageHeader({ title, subtitle, children }) {
  return (
    <div style={P.pageHeader}>
      <div>
        <h1 style={P.pageTitle} className="page-title">{title}</h1>
        {subtitle && (
          <p style={P.pageSub}>{subtitle}</p>
        )}
      </div>
      {children && (
        <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>
          {children}
        </div>
      )}
    </div>
  );
}
