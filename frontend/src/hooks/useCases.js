import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

export function useCases() {
  const [cases, setCases]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/cases`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setCases(data);
      } catch (err) {
        console.error('Ошибка при загрузке кейсов:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, []);

  return { cases, loading };
}
