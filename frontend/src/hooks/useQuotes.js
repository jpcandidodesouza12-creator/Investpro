import { useState, useEffect } from 'react';
import { authApi } from '../services/api'; 

export function useQuotes() {
  const [quotes, setQuotes] = useState({
    currencies: { USD: 0, EUR: 0 },
    assets: {},
    cdi: 0,
    lastUpdate: null
  });
  const [error, setError] = useState(null);

  const fetchQuotes = async () => {
    try {
      // Seu backend no Northflank deve ter esta rota /quotes
      // que faz o trabalho sujo de falar com as APIs externas usando as chaves de lá.
      const response = await api.get('/quotes');
      setQuotes(response.data);
    } catch (err) {
      console.error("Erro ao buscar cotações do backend:", err);
      setError(err);
    }
  };

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 1000 * 60 * 5); // Atualiza a cada 5 min
    return () => clearInterval(interval);
  }, []);

  return { quotes, error, refresh: fetchQuotes };
}