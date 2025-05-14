import { useState, useEffect } from 'react'
import { fetchCases } from '../config/api'

export function useCases() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let c = false
    fetchCases()
      .then(data => !c && setCases(data))
      .catch(() => !c && setCases([]))
      .finally(() => !c && setLoading(false))
    return () => { c = true }
  }, [])

  return { cases, loading }
}
