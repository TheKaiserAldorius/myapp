import { useState } from 'react';
import { API_BASE_URL } from '../config/api';

export function useRollCase() {
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [result, setResult]       = useState(null);

  const roll = async (caseId, telegramId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/open-case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId, telegram_id: telegramId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Server error');
      setResult(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { roll, loading, error, result };
}
