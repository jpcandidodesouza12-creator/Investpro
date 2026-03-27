import { useState, useCallback } from "react";
import { lsLoad, lsSave, lsLoadSnaps, lsRestoreSnap } from "../services/storage";
import {
  DEFAULT_SETTINGS, DEF_CATS, DEF_INVS, DEF_QUOTES,
  defRenda,
} from "../utils/constants";

// ─── Estado inicial carregado do localStorage (lazy — executado só uma vez) ──
function loadInitialState() {
  const saved = lsLoad();
  return {
    invs:     saved?.investments ?? DEF_INVS,
    cats:     saved?.categories  ?? DEF_CATS,
    settings: saved?.settings    ?? DEFAULT_SETTINGS,
    deps:     saved?.deposits    ?? [],
    nii:      saved?.nii         ?? 3,
    nci:      saved?.nci         ?? 4,
    ndi:      saved?.ndi         ?? 1,
    quotes:   saved?.quotes      ?? DEF_QUOTES,
    renda:    saved?.renda       ?? defRenda(),
  };
}

export function useLocalStorage() {
  const initial = useState(loadInitialState)[0]; // carrega só uma vez

  const [invs,     setInvs]     = useState(() => initial.invs);
  const [cats,     setCats]     = useState(() => initial.cats);
  const [settings, setSettings] = useState(() => initial.settings);
  const [deps,     setDeps]     = useState(() => initial.deps);
  const [nii,      setNii]      = useState(() => initial.nii);
  const [nci,      setNci]      = useState(() => initial.nci);
  const [ndi,      setNdi]      = useState(() => initial.ndi);
  const [quotes,   setQuotes]   = useState(() => initial.quotes);
  const [renda,    setRenda]    = useState(() => initial.renda);
  const [snaps,    setSnaps]    = useState(() => lsLoadSnaps());

  // Persiste tudo e atualiza a lista de snapshots
  const save = useCallback((i, c, s, d, ni, nc, nd, q, r) => {
    lsSave({ investments:i, categories:c, settings:s, deposits:d, nii:ni, nci:nc, ndi:nd, quotes:q, renda:r });
    setSnaps(lsLoadSnaps());
  }, []);

  const restoreSnap = useCallback((snap) => {
    const restored = lsRestoreSnap(snap.data);
    if (!restored) return false;
    setInvs(restored.investments ?? DEF_INVS);
    setCats(restored.categories  ?? DEF_CATS);
    setSettings(restored.settings ?? DEFAULT_SETTINGS);
    setDeps(restored.deposits    ?? []);
    setNii(restored.nii          ?? 3);
    setNci(restored.nci          ?? 4);
    setNdi(restored.ndi          ?? 1);
    setQuotes(restored.quotes    ?? DEF_QUOTES);
    setRenda(restored.renda      ?? defRenda());
    setSnaps(lsLoadSnaps());
    return true;
  }, []);

  return {
    invs, setInvs,
    cats, setCats,
    settings, setSettings,
    deps, setDeps,
    nii, setNii,
    nci, setNci,
    ndi, setNdi,
    quotes, setQuotes,
    renda, setRenda,
    snaps,
    save,
    restoreSnap,
  };
}
