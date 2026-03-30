import { P } from "../styles/theme";
import { getType } from "../utils/constants";
import { fmt } from "../utils/formatters";
import { Btn, IBtn, PageHeader, Empty } from "../components/common";

export function ScreenCategories({ invs, cats, isMobile, onAdd, onEdit, onDel }) {
  return (
    <div style={P.root}>
      <PageHeader title="Categorias" subtitle="Organize seus investimentos">
        <Btn onClick={onAdd}>+ Nova</Btn>
      </PageHeader>

      {cats.length === 0
        ? <Empty>Nenhuma categoria criada.</Empty>
        : (
          <div style={P.cardGrid}>
            {cats.map(cat => {
              const catInvs = invs.filter(i => i.categoriaId === cat.id);
              const total   = catInvs.reduce((a, c) => a + c.valor, 0);
              return (
                <div key={cat.id} style={{ ...P.invCard, borderColor:`${cat.cor}66` }} className="card-hover">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:14, height:14, borderRadius:3, background:cat.cor, flexShrink:0 }} />
                      <span style={{ color:"#f0ebe0", fontWeight:700, fontSize:15 }}>{cat.nome}</span>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <IBtn onClick={() => onEdit(cat)} title="Editar" iconName="edit" />
                      <IBtn onClick={() => onDel(cat.id)} title="Remover" iconName="trash" />
                    </div>
                  </div>

                  <div style={{ marginTop:14 }}>
                    <div style={{ color:cat.cor, fontSize:20, fontWeight:800, fontFamily:"'IBM Plex Mono',monospace" }}>{fmt(total)}</div>
                    <div style={{ color:"#555", fontSize:12, marginTop:3 }}>{catInvs.length} investimento{catInvs.length!==1?"s":""}</div>
                  </div>

                  {catInvs.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>
                      {catInvs.map(inv => {
                        const t = getType(inv.tipo);
                        return (
                          <span key={inv.id} style={{ background:"#13120f", border:`1px solid ${t.color}44`, borderRadius:4, padding:"2px 8px", fontSize:11, color:t.color, fontFamily:"'IBM Plex Mono',monospace" }}>
                            {t.icon} {inv.nome}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}
