import { useState, useEffect } from 'react';
import { fetchCases } from '../config/api.js';

export function useCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    fetchCases()
      .then(data => { if (!canceled) setCases(data); })
      .catch(() => { if (!canceled) setCases([]); })
      .finally(() => { if (!canceled) setLoading(false); });
    return () => { canceled = true; };
  }, []);

  return { cases, loading };
}
