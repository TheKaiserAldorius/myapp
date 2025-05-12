import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/useUserStore'
import starIcon from '../assets/buttonsicons/StarTg.png'
import './Header.scss'

export default function Header() {
  const navigate = useNavigate()
  const { user, balance } = useUserStore()
  const profile = user || {}
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Гость'

  return (
    <header className="header">
      <div className="header__user">
        {profile.photo_url ? (
          <img src={profile.photo_url} alt="Avatar" className="header__avatar" />
        ) : (
          <div className="header__avatar placeholder">{fullName[0]}</div>
        )}
        <div className="header__info">
          <div className="header__name">{fullName}</div>
          <div className="header__sub">{balance} звёзд заработано</div>
        </div>
      </div>
      <div className="header__actions">
        <div className="header__balance">
          <img
            src={starIcon}
            alt="Star"
            className="header__star-icon"
            style={{ width: '14px', height: '14px', marginRight: '5px', verticalAlign: 'middle' }}
          />
          {balance}
        </div>
        <button
          className="header__topup-btn"
          onClick={() => navigate('/topup')}
        >
          +
        </button>
      </div>
    </header>
  )
}
