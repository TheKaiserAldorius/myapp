// frontend/src/App.jsx

import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useUserStore } from './store/useUserStore'
import Header from './components/Header'
import BottomNavigation from './components/BottomNavigation'
import OnlineCasesBlock from './components/OnlineCasesBlock'
import CasesPage from './components/CasesPage'
import GamePage from './pages/GamePage'
import ProfilePage from './pages/ProfilePage'
import HistoryPage from './pages/HistoryPage'
import RatingPage from './pages/RatingPage'
import StarTopUp from './pages/StarTopUp'

export default function App() {
  const loc = useLocation()
  const {
    user,
    balance,
    telegramInitData,
    setTelegramInitData,
    setUser,
    setBalance,
    isLoading,
    setLoading,
    error,
    setError
  } = useUserStore()

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    // сохраняем initDataUnsafe, чтобы OnlineCasesBlock мог взять user.id
    const initUnsafe = tg.initDataUnsafe || {}
    setTelegramInitData(initUnsafe)

    tg.expand()
    tg.enableClosingConfirmation()
    tg.ready()

    if (!initUnsafe.user?.id) {
      tg.showAlert('Откройте приложение в Telegram')
      setLoading(false)
      return
    }

    fetch(`/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initDataUnsafe: initUnsafe })
    })
      .then(async res => {
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || `Status ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        setUser(data)
        return fetch(`/api/balance?telegram_id=${data.telegram_id}`)
      })
      .then(res => res.json())
      .then(b => setBalance(b.balance_xtr))
      .catch(e => {
        console.error('Auth/login error:', e)
        window.Telegram.WebApp.showAlert(e.message || 'Ошибка авторизации')
        setError(e.message)
      })
      .finally(() => setLoading(false))
  }, [setTelegramInitData, setUser, setBalance, setLoading, setError])

  if (error) {
    return (
      <div className="app-error">
        <h3>Ошибка авторизации</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Обновить</button>
      </div>
    )
  }

  return (
    <div className="app" style={{ '--tg-viewport-height': '100vh' }}>
      <Header />
      {!isLoading && loc.pathname === '/' && <OnlineCasesBlock />}

      <div className="main-content">
        {isLoading ? (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<CasesPage />} />
            <Route path="/game/:caseId" element={<GamePage />} />
            <Route path="/rating" element={<RatingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/topup" element={<StarTopUp />} />
          </Routes>
        )}
      </div>

      {!isLoading && <BottomNavigation />}
    </div>
  )
}