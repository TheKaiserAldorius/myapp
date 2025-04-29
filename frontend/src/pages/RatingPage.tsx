import React, { useState } from 'react';
import './RatingPage.scss';

// Лягушачьи иконки для топ-блока
import Frog1 from '../assets/frogs/Frog1.png';
import Frog2 from '../assets/frogs/Frog2.png';
import Frog3 from '../assets/frogs/Frog3.png';
import Frog4 from '../assets/frogs/Frog4.png';
import Frog5 from '../assets/frogs/Frog5.png';

const leaders = [
  { name: 'Omar Saris', stars: 97765, position: 1 },
  { name: 'Ryan Carder', stars: 67532, position: 2 },
  { name: 'Martin Levin', stars: 45421, position: 3 },
  // ...можешь добавить ещё
];

const RatingPage = () => {
  const [tab, setTab] = useState('general');

  return (
    <div className="rating-page">
      {/* Вкладки */}
      <div className="rating-tabs">
        <button
          className={tab === 'general' ? 'active' : ''}
          onClick={() => setTab('general')}
        >
          General
        </button>
        <button
          className={tab === 'weekly' ? 'active' : ''}
          onClick={() => setTab('weekly')}
        >
          Weekly
        </button>
      </div>

      {/* Верхний блок лидеров */}
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

      {/* Твой профиль в рейтинге */}
      <div className="current-user">
        <div className="avatar-placeholder" />
        <div className="current-info">
          <div className="name">Aldoriusis K.</div>
          <div className="rank">Вы на #542 месте</div>
        </div>
      </div>

      {/* Список лидеров */}
      <div className="leaders-list">
        {leaders.map((u) => (
          <div key={u.position} className="leader-row">
            <div className="rank-badge">#{u.position}</div>
            <div className="leader-avatar" />
            <div className="leader-info">
              <div className="name">{u.name}</div>
              <div className="stars">{u.stars.toLocaleString()} звёзд заработано</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingPage;
