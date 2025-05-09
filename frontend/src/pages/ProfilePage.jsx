import React, { useEffect, useState } from 'react'
import { useUserStore } from '../store/useUserStore'
import './ProfilePage.scss'

export default function ProfilePage() {
  const { user, balance } = useUserStore()
  const [gifts, setGifts] = useState([])
  const [rank, setRank] = useState(null)

  useEffect(() => {
    if (!user) return
    // Fetch user gifts
    fetch(`/api/user/gifts?telegram_id=${user.telegram_id}`)
      .then(r => r.json())
      .then(setGifts)
      .catch(console.error)
    // Fetch rank (if endpoint exists)
    fetch(`/api/user/rank?telegram_id=${user.telegram_id}`)
      .then(r => r.json())
      .then(data => setRank(data.rank))
      .catch(() => setRank(null))
  }, [user])

  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : 'Гость'

  return (
    <div className="profile-page">
      <div className="profile-header">
        {user?.photo_url ? (
          <img src={user.photo_url} alt="Avatar" className="profile-header__avatar" />
        ) : (
          <div className="profile-header__avatar placeholder">{fullName[0]}</div>
        )}
        <div className="profile-header__text">
          <h2 className="profile-header__name">{fullName}</h2>
          {rank && (
            <p className="profile-header__rank">Вы на #{rank} месте</p>
          )}
        </div>
      </div>

      <div className="profile-gifts">
        {gifts.map(g => (
          <div key={g.gift_id} className="gift-card">
            <img src={g.image_url} alt={g.name} className="gift-card__img" />
            <div className="gift-card__info">
              <div className="gift-card__title">#{g.gift_id}</div>
              <div className="gift-card__stars">⭐ {g.stars}</div>
            </div>
            <div className="gift-card__actions">
              <button className="btn btn--small">Получить</button>
              <button className="btn btn--small btn--outline">Продать</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
