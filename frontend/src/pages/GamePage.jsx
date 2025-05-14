import React from 'react'
import { useParams } from 'react-router-dom'

export default function GamePage() {
  const { caseId } = useParams()
  return (
    <div style={{ padding:16, color:'#fff' }}>
      <h2>Игровая страница</h2>
      <p>Тут будет ваша рулетка для кейса #{caseId}</p>
      <button onClick={() => window.history.back()}>Назад</button>
    </div>
  )
}
