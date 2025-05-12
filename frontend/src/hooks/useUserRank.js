// src/hooks/useUserRank.js
import { useState, useEffect } from 'react';

export function useUserRank(telegramId) {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!telegramId) return setLoading(false);
    let canceled = false;
    fetch(`/api/user/${telegramId}/rank`)
      .then(r => r.json())
      .then(json => {
        if (!canceled) setPosition(json.rank);
      })
      .catch(console.error)
      .finally(() => { if (!canceled) setLoading(false); });
    return () => { canceled = true; };
  }, [telegramId]);

  return { position, loading };
}
