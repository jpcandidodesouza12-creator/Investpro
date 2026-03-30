import { API_URL, LS_AUTH } from "../utils/constants";

// ─── Auth storage ─────────────────────────────────────────────────────────────
export function authLoad() {
  try {
    const raw = localStorage.getItem(LS_AUTH);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function authSave(data) {
  try { localStorage.setItem(LS_AUTH, JSON.stringify(data)); } catch (_) {}
}

export function authClear() {
  try { localStorage.removeItem(LS_AUTH); } catch (_) {}
}

// ─── Base fetch ───────────────────────────────────────────────────────────────
export async function apiCall(method, path, body = null, token = null) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const headers   = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res  = await fetch(`${API_URL}${cleanPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (email, password)             => apiCall("POST", "/auth/login",    { email, password }),
  register: (name, email, password)       => apiCall("POST", "/auth/register", { name, email, password, confirm: password }),
  logout:   (token)                       => apiCall("POST", "/auth/logout",   null, token),
  me:       (token)                       => apiCall("GET",  "/auth/me",       null, token),
  password: (token, currentPassword, newPassword) =>
    apiCall("PUT", "/auth/password", { currentPassword, newPassword }, token),
};

// ─── Dados do usuário ─────────────────────────────────────────────────────────
export const dataApi = {
  getAll: (token)             => apiCall("GET",  "/data",       null,          token),
  get:    (token, key)        => apiCall("GET",  `/data/${key}`, null,         token),
  save:   (token, key, value) => apiCall("PUT",  `/data/${key}`, { value },   token),
};

// ─── Cotações — BCB + Brapi, sem chave de API ─────────────────────────────────
export const quotesApi = {
  get:        (token, params) => apiCall("GET", params ? `/quotes?${params}` : "/quotes", null, token),
  clearCache: (token)         => apiCall("DELETE", "/quotes/cache", null, token),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getUsers:       (token)              => apiCall("GET",    "/admin/users",                  null,    token),
  getPending:     (token)              => apiCall("GET",    "/admin/pending",                null,    token),
  createUser:     (token, data)        => apiCall("POST",   "/admin/users",                  data,    token),
  updateUser:     (token, id, data)    => apiCall("PUT",    `/admin/users/${id}`,             data,    token),
  deleteUser:     (token, id)          => apiCall("DELETE", `/admin/users/${id}`,             null,    token),
  setModules:     (token, id, modules) => apiCall("PUT",    `/admin/users/${id}/modules`,     { modules }, token),
  approveUser:    (token, id, role)    => apiCall("PUT",    `/admin/pending/${id}/approve`,   { role }, token),
  rejectUser:     (token, id)          => apiCall("PUT",    `/admin/pending/${id}/reject`,    null,    token),
  getModules:     (token)              => apiCall("GET",    "/admin/modules",                null,    token),
};
