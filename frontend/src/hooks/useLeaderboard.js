// src/hooks/useLeaderboard.js
import { useState, useEffect } from 'react';

export function useLeaderboard(period = 'global') {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    fetch(`/api/leaderboard${period==='weekly'? '?period=weekly':''}`)
      .then(r => r.json())
      .then(json => {
        if (!canceled && json.success) setLeaders(json.data);
      })
      .catch(console.error)
      .finally(() => { if (!canceled) setLoading(false); });
    return () => { canceled = true; };
  }, [period]);

  return { leaders, loading };
}
