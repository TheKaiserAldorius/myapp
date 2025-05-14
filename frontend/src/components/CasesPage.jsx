import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CasesPage.css'               // убедитесь, что файл existe и в нём стили
import starIcon from '../assets/buttonsicons/StarTg.png'
import { fetchCases } from '../config/api.js'

export default function CasesPage() {
  const [casesList, setCasesList] = useState([])
  const [error, setError]         = useState(null)
  const navigate                  = useNavigate()

  useEffect(() => {
    let cancelled = false
    fetchCases()
      .then(data => { if (!cancelled) setCasesList(data) })
      .catch(err => { console.error(err); if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [])

  if (error) return <div className="error">Ошибка загрузки: {error}</div>

  return (
    <div className="cases-page">
      <div className="cases-grid">
        {casesList.map(c => (
          <div
            key={c.id}
            className="case-card"
            style={{ backgroundImage: `url(${c.image_url})` }}
            onClick={() => navigate(`/game/${c.id}`)}
          >
            <div className="case-footer">
              <img src={starIcon} alt="★" className="star" />
              <span>{c.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
