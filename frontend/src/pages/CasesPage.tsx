
import { useNavigate } from 'react-router-dom';
import './CasesPage.scss';
import CakeImg    from '../assets/CaseItems/CakeCase.png';
import EggImg     from '../assets/CaseItems/EggCase.png';
import TopHatImg  from '../assets/CaseItems/TopHeadCase.png';
import SkeletonImg from '../assets/CaseItems/SceletonCase.png';
import JackboxImg from '../assets/CaseItems/JackboxCase.png';
import RingImg    from '../assets/CaseItems/RingCase.png';
import starIcon   from '../assets/buttonsicons/StarTg.png';

const casesList = [
  { id: 1, img: EggImg,      price: 30 },
  { id: 2, img: JackboxImg,  price: 30 },
  { id: 3, img: CakeImg,     price: 30 },
  { id: 4, img: TopHatImg,   price: 60 },
  { id: 5, img: SkeletonImg, price: 30 },
  { id: 6, img: RingImg,     price: 30 },
];

const CasesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="cases-page">
      <div className="cases-grid">
        {casesList.map((c) => (
          <div
            key={c.id}
            className="case-card"
            style={{ backgroundImage: `url(${c.img})` }}
            onClick={() => navigate(`/game/${c.id}`)}
          >
            <div className="case-footer">
              <img src={starIcon} alt="звезда" className="case-star-icon" />
              <span className="case-price">{c.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CasesPage;
