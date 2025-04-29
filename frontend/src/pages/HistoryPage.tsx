import './HistoryPage.scss';

//иконки и доп материалы из iconitems
import giftReceivedIcon  from '../assets/iconitems/cake.png';      // подарок получен
import depositIcon       from '../assets/iconitems/ring.png';      // пополнение
import giftExchangedIcon from '../assets/iconitems/clownbox.png';  // подарок обменян
import starIcon from '../assets/buttonsicons/StarTg.png';

const historyItems = [
  {
    type: 'Подарок получен',
    icon: giftReceivedIcon,
    id: '#4125',
    stars: -200,
    date: '4/20/2025',
  },
  {
    type: 'Пополнение',
    icon: depositIcon,
    id: '#96688',
    stars: +2500,
    date: '4/20/2025',
  },
  {
    type: 'Подарок обменян',
    icon: giftExchangedIcon,
    id: '#2495',
    stars: +25,
    date: '4/20/2025',
  },
];

const HistoryPage = () => (
  <div className="history-page">
    <div className="history-header">
      <div className="history-icon-circle">
        <img src={giftReceivedIcon} alt="История" />
      </div>
      <div className="history-titles">
        <div className="history-title">История действий</div>
        <div className="history-subtitle">Следите за вашими действиями</div>
      </div>
    </div>

    {/* Список записей */}
    <div className="history-list">
      {historyItems.map((item, idx) => (
        <div key={idx} className="history-item">
          <img src={item.icon} alt={item.type} className="item-icon" />
          <div className="item-content">
            <div className="item-type">{item.type}</div>
            <div className="item-meta">
              <span className="item-id">{item.id}</span>
              <span className="item-stars">
                <img src={starIcon} alt="звезда" className="star-icon" />
                <span className={item.stars > 0 ? 'plus' : 'minus'}>
                  {item.stars > 0 ? `+${item.stars}` : item.stars}
                </span>
              </span>
              <span className="item-date">{item.date}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default HistoryPage;
