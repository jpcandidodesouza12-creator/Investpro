import { useState, useEffect } from 'react';
import { authApi } from '../services/api'; // Corrigido aqui ✅

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('investpro_token');
    if (token) {
      setUser({ token }); 
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // ALTERADO DE 'api.post' PARA 'authApi.post' ABAIXO:
    const response = await authApi.post('/auth/login', { email, password }); // ✅
    const { token } = response.data;
    localStorage.setItem('investpro_token', token);
    setUser({ token });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('investpro_token');
    setUser(null);
  };

  return { user, loading, login, logout, authenticated: !!user };
}