import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchCarouselItems, spinRoulette } from '../config/api.js';
import './YourRouletteComponent.scss';

const REPEAT_COUNT = 7;
const TRANSITION_DURATION = 4000; // ms

export default function YourRouletteComponent({ caseId, onClose }) {
  const [carousel, setCarousel] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [wonIndex, setWonIndex] = useState(null);

  const trackRef     = useRef(null);
  const containerRef = useRef(null);

  // 1) загрузить элементы колеса
  useEffect(() => {
    fetchCarouselItems(caseId).then(items => setCarousel(items));
  }, [caseId]);

  // 2) повтрить их REPEAT_COUNT раз
  const displayItems = useMemo(
    () => Array(REPEAT_COUNT).fill(carousel).flat(),
    [carousel]
  );

  // 3) запуск спина
  const handlePlay = async () => {
    if (spinning || carousel.length === 0) return;
    setSpinning(true);
    setWonIndex(null);

    try {
      const { wonIndex: idx } = await spinRoulette(caseId);
      setWonIndex(idx);

      // вычисляем смещение, чтобы выигрыш оказался по центру
      const itemW = 100;   // ширина .item (css)
      const gap   = 16;    // gap между ними
      const step  = itemW + gap;
      const total = carousel.length;
      const loops = Math.floor(REPEAT_COUNT / 2);

      const containerCenter = containerRef.current.offsetWidth / 2;
      const centerSlot      = Math.floor(containerCenter / step);

      const targetIndex = total * loops + idx;
      const offset      = step * (targetIndex - centerSlot);

      // запускаем анимацию прокрутки
      requestAnimationFrame(() => {
        trackRef.current.style.transition = `transform ${TRANSITION_DURATION}ms ease-in-out`;
        trackRef.current.style.transform  = `translateX(-${offset}px)`;
      });
    } catch (err) {
      console.error('Spin error:', err);
    } finally {
      setTimeout(() => setSpinning(false), TRANSITION_DURATION + 100);
    }
  };

  // по нажатию Продать / Получить мы просто вернём назад
  const handleClose = () => {
    trackRef.current.style.transition = '';
    trackRef.current.style.transform  = '';
    onClose();
  };

  return (
    <div className="roulette-wrapper">
      <div className="carousel" ref={containerRef}>
        <div className="carousel-track" ref={trackRef}>
          {displayItems.map((it, i) => (
            <div
              key={i}
              className={`carousel-item${i % carousel.length === wonIndex ? ' won' : ''}`}
            >
              <img src={it.img} alt={it.name} />
              <div className="price-tag">
                <span>{it.price}★</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!spinning && wonIndex === null && (
        <button className="play-btn" onClick={handlePlay}>
          Крутим!
        </button>
      )}

      {!spinning && wonIndex !== null && (
        <div className="result-buttons">
          <button onClick={handleClose}>Получить</button>
          <button onClick={handleClose}>Продать</button>
        </div>
      )}

      {spinning && <div className="overlay">КРУТИМ…</div>}
    </div>
  );
}
