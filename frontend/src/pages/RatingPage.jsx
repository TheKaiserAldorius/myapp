// src/pages/RatingPage.jsx
import React, { useState } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import './RatingPage.scss'

import Frog1 from '../assets/frogs/Frog1.png'
import Frog2 from '../assets/frogs/Frog2.png'
import Frog3 from '../assets/frogs/Frog3.png'
import Frog4 from '../assets/frogs/Frog4.png'
import Frog5 from '../assets/frogs/Frog5.png'

import { useLeaderboard } from '../hooks/useLeaderboard'
import { useUserRank }    from '../hooks/useUserRank'
import { useUserStore }   from '../store/useUserStore'

import FirstPlaceAnimation  from '../assets/prize/first_medal_place.json'
import SecondPlaceAnimation from '../assets/prize/second_medal_place.json'
import ThirdPlaceAnimation  from '../assets/prize/third_place_medal.json'

export default function RatingPage() {
  const [period, setPeriod] = useState('global') // 'global' | 'weekly'
  const { leaders, loading } = useLeaderboard(period)
  const { position, loading: rankLoading } = useUserRank()
  const user = useUserStore(s => s.user)

  return (
    <div className="rating-page">
      {/* Табы */}
      <div className="rating-tabs">
        <button
          className={period === 'global' ? 'active' : ''}
          onClick={() => setPeriod('global')}
        >
          General
        </button>
        <button
          className={period === 'weekly' ? 'active' : ''}
          onClick={() => setPeriod('weekly')}
        >
          Weekly
        </button>
      </div>

      {/* Топ-3 «лягушки» */}
      <div className="top-section">
        <div className="first-second">
          <div className="second big-slot">
            <div className="position">2nd</div>
            <img src={Frog2} alt="2nd Frog" className="slot-img" />
          </div>
          <div className="first big-slot">
            <div className="position">1st</div>
            <img src={Frog1} alt="1st Frog" className="slot-img" />
          </div>
        </div>
        <div className="others">
          <div className="third">
            <div className="position">3rd</div>
            <img src={Frog3} alt="3rd Frog" className="slot-img" />
          </div>
          <div className="small-slot">
            <div className="position">4-10</div>
            <img src={Frog4} alt="4-10 Frog" className="slot-img" />
          </div>
          <div className="small-slot">
            <div className="position">11-20</div>
            <img src={Frog5} alt="11-20 Frog" className="slot-img" />
          </div>
        </div>
      </div>

      {/* Плашка с профилем и рангом */}
      <div className="current-user">
        <div className="avatar-placeholder" />
        <div className="current-info">
          <div className="name">{user?.username || 'Anonymous'}</div>
          {rankLoading ? (
            <div className="rank">Loading your rank...</div>
          ) : position != null ? (
            <div className="rank">Your rank: #{position}</div>
          ) : (
            <div className="rank">Rank not available</div>
          )}
        </div>
      </div>

      {/* Список лидеров */}
      <div className="leaders-list">
        {loading ? (
          <div className="leader-row">
            <span>Loading leaderboard...</span>
          </div>
        ) : leaders.length > 0 ? (
          leaders.map((u, i) => (
            <div key={u.id} className="leader-row">
              <div className="rank-badge">#{i + 1}</div>
              <div className="leader-avatar" />
              <div className="leader-info">
                <div className="name">{u.username || 'Anonymous'}</div>
                <div className="stars">{u.total_earned} stars</div>
              </div>

              {/* Медальки для топ-3 */}
              {i === 0 && (
                <Player
                  autoplay
                  loop
                  className="medal-icon"
                  src={FirstPlaceAnimation}
                />
              )}
              {i === 1 && (
                <Player
                  autoplay
                  loop
                  className="medal-icon"
                  src={SecondPlaceAnimation}
                />
              )}
              {i === 2 && (
                <Player
                  autoplay
                  loop
                  className="medal-icon"
                  src={ThirdPlaceAnimation}
                />
              )}
            </div>
          ))
        ) : (
          <div className="no-data">No leaders yet.</div>
        )}
      </div>
    </div>
  )
}
