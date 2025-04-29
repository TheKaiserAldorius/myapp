import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchCarouselItems,
  spinRoulette,
  fetchChanceItems,
} from '../api/game';
import './GamePage.scss';
import starIcon from '../assets/buttonsicons/StarTg.png';

const REPEAT_COUNT = 7;
const TRANSITION_DURATION = 4000; // ms

const GamePage = () => {
  const { caseId } = useParams();
  const cost = 250;

  const [carousel, setCarousel] = useState([]);
  const [chance, setChance]     = useState({ rare: [], common: [] });
  const [spinning, setSpinning] = useState(false);
  const [wonIndex, setWonIndex] = useState(null);

  const trackRef = useRef(null);
  const containerRef = useRef(null);

  const displayItems = useMemo(
    () => Array(REPEAT_COUNT).fill(carousel).flat(),
    [carousel]
  );

  useEffect(() => {
    fetchCarouselItems(caseId).then(setCarousel);
    fetchChanceItems(caseId).then(setChance);
  }, [caseId]);

  const handlePlay = () => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container || carousel.length === 0) return;

    track.style.animation = 'none';

    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    setWonIndex(null);
    setSpinning(true);

    spinRoulette(caseId, cost).then(({ wonIndex }) => {
      setWonIndex(wonIndex);
      setSpinning(false);

      const itemW = 80, gap = 12, step = itemW + gap;
      const total = carousel.length;
      const loops = Math.floor(REPEAT_COUNT/2);

      const containerCenter = container.offsetWidth/2;
      const centerSlot = Math.floor(containerCenter/step);

      const targetIndex = total*loops + wonIndex;
      const offset = step*(targetIndex - centerSlot);

      requestAnimationFrame(() => {
        track.style.transition = `transform ${TRANSITION_DURATION}ms ease-in-out`;
        track.style.transform = `translateX(-${offset}px)`;
      });
    });
  };

  const handleSell = () => {
    if (wonIndex != null) alert(`Продали за ${carousel[wonIndex].price}★`);
    setWonIndex(null);

    if (trackRef.current) trackRef.current.style.animation = '';
  };
  const handleClaim = () => {
    alert('Получили приз!');
    setWonIndex(null);
    if (trackRef.current) trackRef.current.style.animation = '';
  };

  return (
    <div className="game-page">
      <div className="carousel" ref={containerRef}>
        <div className="carousel-track" ref={trackRef}>
          {displayItems.map((it, i) => (
            <div
              key={i}
              className={`carousel-item${i % carousel.length === wonIndex ? ' won' : ''}`}
            >
              <img src={it.img} alt="" className="item-img" />
              <div className="item-price">
                <img src={starIcon} alt="★" className="star" />
                <span>{it.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {wonIndex === null ? (
        <button
          className="play-button"
          onClick={handlePlay}
          disabled={spinning}
        >
          {spinning ? 'Крутим…' : `Испытать удачу − ${cost}`}
          <img src={starIcon} alt="★" className="star-inline" />
        </button>
      ) : (
        <div className="action-buttons">
          <button className="btn sell" onClick={handleSell}>
            Продать − {carousel[wonIndex]?.price}
            <img src={starIcon} alt="★" className="star-inline" />
          </button>
          <button className="btn claim" onClick={handleClaim}>
            Получить
          </button>
        </div>
      )}

      <ChanceBlock title="Шанс 5%"  items={chance.rare} />
      <ChanceBlock title="Шанс 95%" items={chance.common} />
    </div>
  );
};

const ChanceBlock = ({ title, items }) => (
  <div className="chance-block">
    <h3 className="chance-title">{title}</h3>
    <div className="chance-list">
      {items.map((it,i) => (
        <div key={i} className="chance-item">
          <img src={it.img} alt={it.name} className="icon" />
          <div className="info">
            <span className="name">{it.name}</span>
            <div className="price">
              <img src={starIcon} alt="★" className="star"/>
              <span>{it.price}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default GamePage;
