// ─── Design tokens — Bloomberg Terminal × Modern Fintech ──────────────────────
export const T = {
  // Backgrounds
  bg:        "#08090A",
  surface:   "#0F1012",
  surface2:  "#141618",
  surface3:  "#1A1C1F",

  // Borders
  border:    "#1E2024",
  border2:   "#252830",
  borderHov: "#343840",

  // Text
  text:      "#F0F2F5",
  textSub:   "#6B7280",
  textMuted: "#374151",

  // Accents
  accent:    "#F5C518",
  accentDim: "#F5C51812",
  accentHov: "#FFD740",

  // Semantic
  green:     "#10B981",
  greenDim:  "#10B98112",
  red:       "#EF4444",
  redDim:    "#EF444412",
  blue:      "#3B82F6",
  blueDim:   "#3B82F612",
  purple:    "#8B5CF6",

  // Typography
  mono:      "'JetBrains Mono', 'IBM Plex Mono', monospace",
  sans:      "'DM Sans', 'Inter', sans-serif",
  display:   "'DM Sans', sans-serif",
};

// ─── Sidebar + Layout ─────────────────────────────────────────────────────────
export const S = {
  app:          { display:"flex", minHeight:"100vh", background:T.bg, fontFamily:T.sans, color:T.text },
  sidebar:      { position:"fixed", top:0, left:0, height:"100vh", background:T.surface, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", zIndex:100, transition:"width .22s cubic-bezier(.4,0,.2,1)", overflow:"hidden" },
  sidebarLogo:  { display:"flex", alignItems:"center", gap:10, padding:"20px 14px 16px", borderBottom:`1px solid ${T.border}`, flexShrink:0, cursor:"pointer", userSelect:"none" },
  logoText:     { fontSize:15, fontWeight:700, color:T.text, letterSpacing:-.3, whiteSpace:"nowrap", fontFamily:T.display },
  nav:          { flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:1, overflowY:"auto" },
  navItem:      { display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:8, background:"transparent", border:"none", color:T.textSub, cursor:"pointer", transition:"all .15s", fontSize:13, fontFamily:T.sans, fontWeight:500, width:"100%", whiteSpace:"nowrap", letterSpacing:-.1 },
  navActive:    { background:T.accentDim, color:T.accent, fontWeight:600, borderLeft:`2px solid ${T.accent}`, paddingLeft:8 },
  main:         { flex:1, minWidth:0, transition:"margin-left .22s cubic-bezier(.4,0,.2,1)" },
  mobileBar:    { position:"fixed", top:0, left:0, right:0, height:52, background:T.surface, borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12, padding:"0 14px", zIndex:100 },
  mobileCdi:    { marginLeft:"auto", fontSize:10, color:T.accent, fontFamily:T.mono, background:T.accentDim, padding:"3px 10px", borderRadius:20, border:`1px solid ${T.accent}22`, letterSpacing:.3 },
  hamburger:    { background:"transparent", border:`1px solid ${T.border2}`, color:T.textSub, cursor:"pointer", display:"flex", alignItems:"center", padding:"7px 8px", borderRadius:8, transition:"all .15s" },
  drawerOverlay:{ position:"fixed", inset:0, background:"rgba(0,0,0,.82)", backdropFilter:"blur(8px)", zIndex:200, display:"flex" },
  drawer:       { width:270, background:T.surface, borderRight:`1px solid ${T.border}`, height:"100%", display:"flex", flexDirection:"column", overflowY:"auto" },
  drawerHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 16px 14px", borderBottom:`1px solid ${T.border}`, flexShrink:0 },
  drawerItem:   { display:"flex", alignItems:"center", gap:13, padding:"12px 18px", background:"transparent", border:"none", color:T.textSub, cursor:"pointer", fontSize:14, fontFamily:T.sans, fontWeight:500, transition:"all .15s", width:"100%", textAlign:"left" },
  drawerItemActive:{ background:T.accentDim, color:T.accent, fontWeight:600, borderLeft:`2px solid ${T.accent}` },
  alertBanner:  { position:"fixed", top:0, left:0, right:0, background:"#1A0E00", borderBottom:`1px solid ${T.accent}33`, padding:"8px 20px", display:"flex", alignItems:"center", gap:10, zIndex:300, color:T.accent, fontFamily:T.mono, fontSize:11, letterSpacing:.2 },
  toast:        { position:"fixed", padding:"12px 18px", borderRadius:10, border:"1px solid", fontSize:12, fontFamily:T.mono, zIndex:500, backdropFilter:"blur(12px)", letterSpacing:.1 },
};

// ─── Page + component styles ──────────────────────────────────────────────────
export const P = {
  root:        { maxWidth:1140, margin:"0 auto" },
  pageHeader:  { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:16 },
  pageTitle:   { fontSize:24, fontWeight:700, color:T.text, letterSpacing:-.5, lineHeight:1.15, fontFamily:T.display },
  pageSub:     { fontSize:12, color:T.textSub, marginTop:5, fontFamily:T.mono, letterSpacing:.2 },

  // KPI cards
  kpiRow:      { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:10, marginBottom:20 },
  kpiCard:     { background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"16px 18px", position:"relative", overflow:"hidden" },
  kpiLabel:    { fontSize:10, color:T.textSub, textTransform:"uppercase", letterSpacing:1.6, fontFamily:T.mono, marginBottom:10 },
  kpiValue:    { fontSize:20, fontWeight:700, letterSpacing:-.4, fontFamily:T.mono },

  // Chart cards
  chartCard:   { background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"18px 20px" },
  chartTitle:  { fontSize:10, fontWeight:600, color:T.textSub, textTransform:"uppercase", letterSpacing:1.6, fontFamily:T.mono, marginBottom:16 },

  // Filters
  filterRow:   { display:"flex", flexWrap:"wrap", gap:8, marginBottom:18, alignItems:"center" },
  search:      { background:T.surface2, border:`1px solid ${T.border2}`, borderRadius:8, color:T.text, padding:"8px 12px", fontFamily:T.mono, fontSize:12, outline:"none", width:200 },

  // Investment cards
  cardGrid:    { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:12 },
  invCard:     { background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"16px", display:"flex", flexDirection:"column", gap:10 },
  metrics:     { display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 },
  metricBox:   { background:T.bg, borderRadius:7, padding:"8px 10px", border:`1px solid ${T.border}` },
  metricLabel: { color:T.textSub, fontSize:9, textTransform:"uppercase", letterSpacing:1.2, fontFamily:T.mono },
  metricValue: { color:"#CBD5E1", fontSize:12, fontWeight:600, fontFamily:T.mono, marginTop:3 },

  // Settings cards
  setCard:     { background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"18px 20px", marginBottom:12 },
  setTitle:    { fontSize:10, fontWeight:600, color:T.textSub, textTransform:"uppercase", letterSpacing:1.6, fontFamily:T.mono, marginBottom:16 },

  // Table
  table:       { width:"100%", borderCollapse:"collapse", fontFamily:T.mono, fontSize:12 },
  th:          { padding:"8px 14px", textAlign:"left", color:T.textSub, fontWeight:600, fontSize:9, letterSpacing:1.4, textTransform:"uppercase", borderBottom:`1px solid ${T.border}` },
  tr:          { borderBottom:`1px solid ${T.border}` },
  td:          { padding:"10px 14px", color:"#94A3B8", whiteSpace:"nowrap" },

  // Forms
  label:       { display:"block", fontSize:10, color:T.textSub, textTransform:"uppercase", letterSpacing:1.3, fontFamily:T.mono, marginBottom:6, marginTop:14 },
  input:       { background:T.bg, border:`1px solid ${T.border2}`, borderRadius:8, color:T.text, padding:"10px 12px", fontFamily:T.mono, fontSize:12, outline:"none", width:"100%", boxSizing:"border-box", transition:"border-color .15s" },

  // Buttons
  btn:         { background:T.accent, color:"#000", border:"none", padding:"10px 20px", borderRadius:8, fontFamily:T.sans, fontWeight:700, fontSize:13, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6, letterSpacing:-.1, transition:"all .15s" },
  btnSec:      { background:"transparent", border:`1px solid ${T.border2}`, color:T.textSub, padding:"9px 16px", borderRadius:8, fontFamily:T.sans, fontWeight:500, fontSize:12, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6, transition:"all .15s" },
  btnCancel:   { background:"transparent", border:`1px solid ${T.border}`, color:T.textSub, borderRadius:8, padding:"9px 18px", fontFamily:T.sans, fontWeight:500, fontSize:12, cursor:"pointer", transition:"all .15s" },
  iBtn:        { background:"transparent", border:`1px solid ${T.border}`, borderRadius:6, padding:"5px 8px", cursor:"pointer", color:T.textSub, display:"inline-flex", alignItems:"center", justifyContent:"center", transition:"all .15s" },

  // Misc
  note:        { fontSize:10, color:T.textSub, marginTop:10, fontFamily:T.mono, letterSpacing:.2 },
  empty:       { textAlign:"center", padding:"48px 24px", color:T.textSub, background:T.surface, borderRadius:10, border:`1px solid ${T.border}`, fontFamily:T.mono, fontSize:12 },
  pill:        { border:"1px solid", borderRadius:20, padding:"2px 8px", fontSize:10, fontFamily:T.mono, display:"inline-block", letterSpacing:.2 },
  toggleBtn:   { background:"transparent", border:"none", color:T.textSub, borderRadius:6, padding:"6px 14px", fontFamily:T.sans, fontWeight:500, fontSize:12, cursor:"pointer", transition:"all .15s" },
  toggleActive:{ background:T.accent, color:"#000", fontWeight:700 },
  grid2:       { display:"grid", gap:12, marginBottom:16 },
  metaCard:    { background:T.surface, border:`1px solid ${T.accent}22`, borderRadius:10, padding:"16px 18px", marginBottom:20 },
  metaTrack:   { height:3, background:T.surface3, borderRadius:2, overflow:"hidden", marginTop:8 },
  metaFill:    { height:3, background:T.accent, borderRadius:2, transition:"width .6s cubic-bezier(.4,0,.2,1)" },
};

// ─── Modal ────────────────────────────────────────────────────────────────────
export const M = {
  overlay:      { position:"fixed", inset:0, background:"rgba(0,0,0,.88)", display:"flex", justifyContent:"center", zIndex:400, backdropFilter:"blur(12px)", padding:16 },
  box:          { background:T.surface, border:`1px solid ${T.border2}`, padding:"24px", maxHeight:"92vh", overflowY:"auto", display:"flex", flexDirection:"column", gap:4 },
  title:        { fontSize:18, fontWeight:700, color:T.text, marginBottom:10, letterSpacing:-.3, fontFamily:T.display },
  typeBtn:      { background:T.bg, border:`1px solid ${T.border2}`, borderRadius:9, padding:"10px 4px", color:T.textSub, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, fontFamily:T.mono, fontSize:9, transition:"all .15s", letterSpacing:.3 },
  catChip:      { background:T.bg, border:`1px solid ${T.border2}`, borderRadius:6, padding:"6px 12px", color:T.textSub, fontSize:11, fontFamily:T.mono, cursor:"pointer", transition:"all .15s" },
  catChipActive:{ borderColor:T.accent, color:T.accent, background:T.accentDim },
  irNote:       { background:"#1A0808", border:"1px solid #EF444433", borderRadius:8, padding:"9px 12px", fontSize:11, color:"#F87171", fontFamily:T.mono, letterSpacing:.1 },
  actions:      { display:"flex", gap:8, justifyContent:"flex-end", marginTop:18 },
};
