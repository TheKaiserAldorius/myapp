// src/hooks/useLeaderboard.js
import { useState, useEffect } from 'react'

/**
 * @param {'global'|'weekly'} period
 */
export function useLeaderboard(period = 'global') {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const url = period === 'weekly'
      ? `/api/leaderboard?period=weekly`
      : `/api/leaderboard`

    setLoading(true)
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(res.status)
        return res.json()
      })
      .then(json => {
        if (!cancelled && json.success) {
          setLeaders(json.data)
        }
      })
      .catch(err => console.error('useLeaderboard error', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [period])

  return { leaders, loading }
}
