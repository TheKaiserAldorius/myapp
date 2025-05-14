import { useState } from 'react'
import { spinRoulette } from '../config/api'

export function useRollCase() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const roll = async (caseId) => {
    setLoading(true)
    try {
      const res = await spinRoulette(caseId)
      setResult(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return { roll, loading, error, result }
}
