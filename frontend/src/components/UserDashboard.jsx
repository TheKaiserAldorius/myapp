// frontend/src/components/UserDashboard.jsx

import React, { useEffect, useState } from 'react';
import './UserDashboard.scss';

export default function UserDashboard() {
  const [wins, setWins] = useState([]);
  const [code, setCode] = useState('');
  const [refMsg, setRefMsg] = useState('');
  const tgId = window.Telegram.WebApp.initDataUnsafe.user.id;

  useEffect(() => {
    fetch(`/api/wins?telegram_id=${tgId}`)
      .then(r => r.json())
      .then(setWins)
      .catch(console.error);
  }, [tgId]);

  const sellPrize = async (win_id) => {
    const res = await fetch('/api/sell_prize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: tgId, win_id })
    });
    const json = await res.json();
    if (json.ok) {
      setWins(w => w.filter(item => item.win_id !== win_id));
    }
  };

  const submitCode = async () => {
    const res = await fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: tgId, code })
    });
    const json = await res.json();
    setRefMsg(json.ok ? `Бонус: ${json.bonus} XTR` : `Ошибка: ${json.error}`);
  };

  return (
    <div className="user-dashboard">
      <section className="wins">
        <h2>Мои выигрыши</h2>
        {wins.length === 0 ? <p>Пока нет выигрышей</p> : wins.map(w => (
          <div key={w.win_id} className="win-item">
            <img src={w.image_url} alt={w.name} className="win-img" />
            <div className="win-info">
              <span className="win-name">{w.name}</span>
              <span className="win-price">{w.price_xtr} XTR</span>
              <button onClick={() => sellPrize(w.win_id)}>Продать</button>
            </div>
          </div>
        ))}
      </section>

      <section className="referral">
        <h2>Реферальная программа</h2>
        <input
          type="text"
          placeholder="Введите код"
          value={code}
          onChange={e => setCode(e.target.value)}
        />
        <button onClick={submitCode}>Применить</button>
        {refMsg && <div className="referral-msg">{refMsg}</div>}
      </section>
    </div>
  );
}
