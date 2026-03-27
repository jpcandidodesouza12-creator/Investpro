const ICONS = {
  dashboard:   `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/></svg>`,
  investments: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,14 7,9 11,12 18,5"/><polyline points="13,5 18,5 18,10"/></svg>`,
  renda:       `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="16" height="11" rx="2"/><path d="M6 5V4a2 2 0 014 0v1"/><circle cx="10" cy="11" r="2"/></svg>`,
  history:     `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><polyline points="10,6 10,10 13,12"/></svg>`,
  comparator:  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="2" x2="10" y2="18"/><path d="M4 6h4l-2-3-2 3z" fill="currentColor"/><path d="M12 14h4l-2 3-2-3z" fill="currentColor"/></svg>`,
  projection:  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16 C5 16 6 8 9 8 C12 8 11 12 14 10 C17 8 18 4 18 4"/><line x1="2" y1="18" x2="18" y2="18"/></svg>`,
  quotes:      `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5h16M2 9h10M2 13h7"/><circle cx="15" cy="14" r="4"/><line x1="18" y1="17" x2="20" y2="19"/></svg>`,
  categories:  `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l7-5 7 5v10a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><polyline points="8,18 8,12 12,12 12,18"/></svg>`,
  settings:    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="3"/><path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.2 3.2l1.4 1.4M15.4 15.4l1.4 1.4M3.2 16.8l1.4-1.4M15.4 4.6l1.4-1.4"/></svg>`,
  admin:       `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2L2 17h16z"/><line x1="10" y1="9" x2="10" y2="12"/><circle cx="10" cy="15" r=".5" fill="currentColor"/></svg>`,
  menu:        `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="3" y1="5" x2="17" y2="5"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="3" y1="15" x2="17" y2="15"/></svg>`,
  close:       `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></svg>`,
  plus:        `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="10" y1="3" x2="10" y2="17"/><line x1="3" y1="10" x2="17" y2="10"/></svg>`,
  edit:        `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l4 4-9 9H3v-4z"/><line x1="10" y1="6" x2="14" y2="10"/></svg>`,
  trash:       `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="5,6 6,18 14,18 15,6"/><line x1="3" y1="6" x2="17" y2="6"/><path d="M8 6V4h4v2"/></svg>`,
  deposit:     `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><line x1="10" y1="6" x2="10" y2="14"/><line x1="6" y1="10" x2="14" y2="10"/></svg>`,
  download:    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3v10M6 9l4 4 4-4"/><path d="M3 15v2h14v-2"/></svg>`,
  upload:      `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13V3M6 7l4-4 4 4"/><path d="M3 15v2h14v-2"/></svg>`,
  refresh:     `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 10a7 7 0 11-1.4-4.2"/><polyline points="17,3 17,8 12,8"/></svg>`,
  restore:     `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10a7 7 0 101.4-4.2"/><polyline points="3,3 3,8 8,8"/></svg>`,
  alert:       `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2L2 17h16z"/><line x1="10" y1="9" x2="10" y2="12"/><circle cx="10" cy="15" r=".5" fill="currentColor"/></svg>`,
};

export function Icon({ name, size = 16, style = {} }) {
  const svg = ICONS[name];
  if (!svg) return null;
  return (
    <span
      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:size, height:size, flexShrink:0, ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
