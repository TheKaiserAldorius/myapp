import profileImage from "../assets/iconitems/profile.png"; // аватарка
import starIcon from "../assets/buttonsicons/StarTg.png"; // звезда
import plusIcon from "../assets/buttonsicons/plusbut.png"; // плюс
import backgroundStar from "../assets/buttonsicons/backstarbutton.png"; // фон баланса
import "./Header.scss";

const Header = () => {
  return (
    <header className="header">
      <div className="header__profile">
        <img src={profileImage} alt="Profile" className="profile-icon" />
        <div className="profile-info">
          <div className="profile-name">Aldoriusis K.</div>
          <div className="profile-stars">252 звёзд заработано</div>
        </div>
      </div>
      <div className="header__balance">
        <button className="balance-button">
          <div className="balance-background">
            <img src={starIcon} alt="Star" className="star-icon" />
            <img src={plusIcon} alt="Plus" className="plus-icon" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
