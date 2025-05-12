// src/hooks/useHistory.js
import { useState, useEffect } from 'react'
import { useUserStore } from '../store/useUserStore'

export function useHistory() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const user                  = useUserStore(state => state.user)
  const API                   = import.meta.env.VITE_API_URL || ''

  useEffect(() => {
    // Если нет юзера — сразу выходим
    if (!user?.telegram_id) {
      setItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    const url = `${API}/api/history?telegram_id=${user.telegram_id}`

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`)
        }
        return response.json()
      })
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setItems(json.data)
        } else {
          console.warn('History: unexpected payload', json)
          setItems([])
        }
      })
      .catch(err => {
        console.error('Failed to fetch history:', err)
        setItems([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user, API])

  return { items, loading }
}
