import { useCallback, useRef } from "react";
import { dataApi } from "../services/api";

const SYNC_DEBOUNCE_MS = 1500;

// ─── Sincroniza dados locais com o backend (Neon via Northflank) ──────────────
// Usa debounce para não sobrecarregar o backend a cada keystroke
export function useSync(token) {
  const timers = useRef({});

  const syncKey = useCallback(async (key, value) => {
    if (!token) return;

    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(async () => {
      try {
        await dataApi.save(token, key, value);
      } catch (err) {
        console.warn(`Falha ao sincronizar '${key}':`, err.message);
      }
    }, SYNC_DEBOUNCE_MS);
  }, [token]);

  // Carrega todos os dados do usuário do backend
  const loadFromCloud = useCallback(async () => {
    if (!token) return null;
    try {
      return await dataApi.getAll(token);
    } catch (err) {
      console.warn("Falha ao carregar dados da nuvem:", err.message);
      return null;
    }
  }, [token]);

  // Força sync imediato de todas as chaves (sem debounce)
  const syncAll = useCallback(async (data) => {
    if (!token) return;
    const keys = ["investments", "categories", "settings", "deposits", "quotes", "renda"];
    await Promise.allSettled(
      keys.map(key => dataApi.save(token, key, data[key] ?? null))
    );
  }, [token]);

  return { syncKey, loadFromCloud, syncAll };
}
