import { useState, useCallback } from "react";
import { authLoad, authSave, authClear, authApi } from "../services/api";

export function useAuth() {
  const [auth, setAuth] = useState(() => authLoad());

  const isLoggedIn  = !!auth?.token;
  const user        = auth?.user        || null;
  const userRole    = auth?.user?.role  || "guest";
  const userModules = auth?.modules     || [];
  const isAdmin     = userRole === "admin";
  const token       = auth?.token       || null;

  const login = useCallback((data) => {
    authSave(data);
    setAuth(data);
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(auth?.token); } catch (_) {}
    authClear();
    setAuth(null);
  }, [auth?.token]);

  // Filtra o menu pelo perfil — admin vê tudo, outros só os módulos liberados
  const filterNav = useCallback((nav) => {
    if (isAdmin) return nav;
    return nav.filter(item =>
      userModules.includes(item.id) || item.id === "dashboard"
    );
  }, [isAdmin, userModules]);

  return {
    auth, token,
    isLoggedIn, user, userRole, userModules, isAdmin,
    login, logout, filterNav,
  };
}
