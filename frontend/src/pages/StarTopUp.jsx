import React from 'react';
import './StarTopUp.scss';

const StarTopUp = () => {
  const BOT = process.env.REACT_APP_BOT_USERNAME; // в .env
  const openBot = () => {
    const url = `https://t.me/${BOT}`;
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="star-topup">
      <h2>Пополнение баланса</h2>
      <p>Все пополнения проходят внутри бота Телеграм.</p>
      <button onClick={openBot} className="star-topup__btn">
        Открыть бот для пополнения
      </button>
    </div>
  );
};

export default StarTopUp;
