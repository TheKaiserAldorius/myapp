import { Routes, Route, useLocation, useEffect } from 'react-router-dom';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import OnlineCasesBlock from './components/OnlineCasesBlock';
import CasesPage from './pages/CasesPage';
import GamePage from './pages/GamePage';            
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import RatingPage from './pages/RatingPage';
import StarTopUp from './components/StarTopUp';
import { useUserStore } from './store/useUserStore';

const App = () => {
  const location = useLocation();
  const setTelegramInitData = useUserStore(state => state.setTelegramInitData);
  
  const showOnlineCases = location.pathname === '/';

  useEffect(() => {
    window.Telegram.WebApp.init();
    setTelegramInitData(window.Telegram.WebApp.initDataUnsafe);
  }, [setTelegramInitData]);

  return (
    <div className="app">
      <Header />

      {showOnlineCases && <OnlineCasesBlock />}

      <div className="main-content">
        <Routes>
          <Route path="/" element={<CasesPage />} />
          <Route path="/game/:caseId" element={<GamePage />} />     
          <Route path="/rating" element={<RatingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/topup" element={<StarTopUp />} />
        </Routes>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default App;
