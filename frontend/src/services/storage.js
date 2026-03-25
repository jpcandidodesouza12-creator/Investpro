import { LS_KEY, LS_SNAPS, MAX_SNAPS } from "../utils/constants";

// ─── Carrega estado salvo ─────────────────────────────────────────────────────
export function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Salva estado + cria snapshot automático ──────────────────────────────────
export function lsSave(data) {
  try {
    const current = localStorage.getItem(LS_KEY);
    if (current) {
      const snaps = lsLoadSnaps();
      const cur   = JSON.parse(current);
      const label = `${cur.investments?.length || 0} ativos`;
      snaps.unshift({ ts: Date.now(), label, data: current });
      localStorage.setItem(LS_SNAPS, JSON.stringify(snaps.slice(0, MAX_SNAPS)));
    }
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (_) {}
}

// ─── Snapshots ────────────────────────────────────────────────────────────────
export function lsLoadSnaps() {
  try {
    return JSON.parse(localStorage.getItem(LS_SNAPS) || "[]");
  } catch {
    return [];
  }
}

export function lsRestoreSnap(snapData) {
  try {
    const current = localStorage.getItem(LS_KEY);
    if (current) {
      const snaps = lsLoadSnaps();
      const cur   = JSON.parse(current);
      snaps.unshift({
        ts:    Date.now(),
        label: `(antes do restore) ${cur.investments?.length || 0} ativos`,
        data:  current,
      });
      localStorage.setItem(LS_SNAPS, JSON.stringify(snaps.slice(0, MAX_SNAPS)));
    }
    localStorage.setItem(LS_KEY, snapData);
    const restored = JSON.parse(snapData);
    return restored;
  } catch {
    return null;
  }
}
