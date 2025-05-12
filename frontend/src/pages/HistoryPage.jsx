// src/pages/HistoryPage.jsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHistory } from '../hooks/useHistory'
import './HistoryPage.scss'

import histIcon    from '../assets/iconitems/HistoryCock.svg'
import giftIn      from '../assets/iconitems/cake.png'
import depositIc   from '../assets/iconitems/ring.png'
import giftOut     from '../assets/iconitems/clownbox.png'
import starIcon    from '../assets/buttonsicons/StarTg.png'
import moneyBag    from '../assets/prize/PaymentTons.svg'

const iconMap = {
  deposit:         depositIc,
  gift_received:   giftIn,
  gift_exchanged:  giftOut,
  sale:            moneyBag,
}

const translateType = (type) => {
  switch (type) {
    case 'deposit':         return 'Пополнение'
    case 'sale':            return 'Продажа'
    case 'gift_received':   return 'Подарок получен'
    case 'gift_exchanged':  return 'Подарок обменян'
    default:                return type
  }
}

export default function HistoryPage() {
  const { items, loading } = useHistory()
  const navigate = useNavigate()

  useEffect(() => {
    // сюда можно добавить логику кнопки назад
  }, [navigate])

  return (
    <div className="history-page">
      <div className="history-header">
        <div className="history-icon-circle">
          <img src={histIcon} alt="История" />
        </div>
        <div className="history-titles">
          <div className="history-title">История действий</div>
          <div className="history-subtitle">Следите за вашими операциями</div>
        </div>
      </div>

      <div className="history-list">
        {loading ? (
          <div className="history-loading">Загрузка истории…</div>
        ) : items.length > 0 ? (
          items.map((item) => {
            const showStars = item.type !== 'gift_exchanged'
            let sign, cls
            if (item.type === 'gift_received') {
              sign = '-'
              cls  = 'minus'
            } else if (item.type === 'deposit' || item.type === 'sale') {
              sign = '+'
              cls  = 'plus'
            }

            return (
              <div key={item.id} className="history-item">
                <img
                  src={iconMap[item.type] || histIcon}
                  alt={item.type}
                  className="item-icon"
                />
                <div className="item-content">
                  <div className="item-type">
                    {translateType(item.type)}{item.id && ` #${item.id}`}
                  </div>
                  <div className="item-meta">
                    {showStars && (
                      <span className="item-stars">
                        <img src={starIcon} alt="звезда" className="star-icon" />
                        <span className={cls}>
                          {sign}{item.stars}
                        </span>
                      </span>
                    )}
                    <span className="item-date">
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="history-empty">У вас ещё нет транзакций</div>
        )}
      </div>
    </div>
  )
}
