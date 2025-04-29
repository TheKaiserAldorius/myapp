import React from 'react';
import './ProfilePage.scss';
import profileImage from '../assets/iconitems/profile.png';
import eggImage      from '../assets/iconitems/cake.png';      // для примера
import ringImage     from '../assets/iconitems/ring.png';
import clownImage    from '../assets/iconitems/clownbox.png';
import starIcon from '../assets/buttonsicons/StarTg.png';

const userGifts = [
  { id: '#66072', img: eggImage,   stars: 200 },
  { id: '#66244', img: ringImage,  stars: 2500 },
  { id: '#36452', img: clownImage, stars: 25 },
];

const ProfilePage = () => {
  return (
    <div className="profile-page">
      <div className="profile-header">
        <img src={profileImage} alt="Avatar" className="avatar" />
        <div className="profile-info">
          <div className="name">Aldoriusis K.</div>
          <div className="rank">Вы на #542 месте</div>
        </div>
      </div>

      <div className="gifts-list">
        {userGifts.map(gift => (
          <div key={gift.id} className="gift-item">
            <img src={gift.img} alt={gift.id} className="gift-image" />
            <div className="gift-details">
  <div className="gift-id">{gift.id}</div>
  <div className="gift-stars">
    <img src={starIcon} alt="star" className="star-icon" />
    <span>{gift.stars}</span>
  </div>
</div>
            <div className="gift-actions">
              <button className="btn claim">Получить</button>
              <button className="btn sell">Продать</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
