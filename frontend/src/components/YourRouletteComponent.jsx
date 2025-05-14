import React, { useEffect } from 'react'
import { useRollCase } from '../hooks/useRollCase'
import './YourRouletteComponent.scss'

export default function YourRouletteComponent({ caseId, onClose }) {
  const { roll, loading, error, result } = useRollCase()

  useEffect(() => { roll(caseId) }, [caseId])

  if (loading) return <div className="roulette-loading">Крутим…</div>
  if (error)    return <div className="roulette-error">{error}</div>

  return (
    <div className="roulette-result">
      <h2>Поздравляем!</h2>
      <img src={result.reward.image_url} alt="" className="reward-image"/>
      <p>
        Вы выиграли <strong>{result.reward.name}</strong> стоимостью {result.reward.price}★
      </p>
      <button onClick={onClose}>Закрыть</button>
    </div>
  )
}
