import { useLocation, useNavigate } from "react-router-dom";
import "./BottomNavigation.scss";

// Импортируем иконки
import iconMainGiftPage from "../assets/navitems/iconmaingiftpage.png";
import iconRatingPage from "../assets/navitems/iconreitingpage.png";
import iconProfilePage from "../assets/navitems/iconprofilepage.png";
import iconHistoryPage from "../assets/navitems/iconhistorypage.png";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Массив с навигационными элементами
  const navItems = [
    { path: "/", label: "Главное", icon: iconMainGiftPage },
    { path: "/rating", label: "Рейтинг", icon: iconRatingPage },
    { path: "/profile", label: "Профиль", icon: iconProfilePage },
    { path: "/history", label: "История", icon: iconHistoryPage },
  ];

  return (
    <div className="bottom-navigation">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={location.pathname === item.path ? "active" : ""}
        >
          <img src={item.icon} alt={item.label} className="nav-icon" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavigation;
