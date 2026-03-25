import { useState, useEffect } from 'react';
import { authApi } from '../services/api';

export function useInvestments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInvestments = async () => {
    try {
      const response = await api.get('/investments');
      setInvestments(response.data);
    } catch (err) {
      console.error("Erro ao carregar investimentos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const addInvestment = async (data) => {
    await api.post('/investments', data);
    loadInvestments();
  };

  return { investments, loading, addInvestment, reload: loadInvestments };
}