import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams }                        from 'react-router-dom';
import { fetchCarouselItems, spinRoulette } from '../config/api.js';
import { useLanguage }                      from '../components/LanguageContext';
import styles                               from './GamePage.module.css';
import starIcon                             from '../assets/buttonsicons/StarTg.png';

const REPEAT = 7;
const DURATION = 3500; // мс

export default function GamePage() {
  const { caseId } = useParams();
  const { language } = useLanguage();
  const [items, setItems] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [wonIndex, setWonIndex] = useState(null);

  const trackRef = useRef();
  const contRef  = useRef();

  // 1) загрузка
  useEffect(() => {
    fetchCarouselItems(caseId).then(setItems);
  }, [caseId]);

  // 2) мультиплицируем
  const display = useMemo(
    () => Array(REPEAT).fill(items).flat(),
    [items]
  );

  // 3) крутилка
  const handleSpin = async () => {
    if (spinning || !items.length) return;
    setSpinning(true);
    const { wonIndex: idx } = await spinRoulette(caseId);
    setWonIndex(idx);

    const itemW = 100, gap = 16, step = itemW + gap;
    const loops = Math.floor(REPEAT/2);
    const total = items.length;
    const center = contRef.current.offsetWidth/2;
    const slot = Math.floor(center/step);
    const target = total*loops + idx;
    const offset = step*(target - slot);

    requestAnimationFrame(()=>{
      trackRef.current.style.transition = `transform ${DURATION}ms ease-in-out`;
      trackRef.current.style.transform = `translateX(-${offset}px)`;
    });

    // стоп по окончании анимации
    setTimeout(()=> setSpinning(false), DURATION+100);
  };

  return (
    <div className={styles.rouletteWrapper}>
      <div className={styles.carousel} ref={contRef}>
        <div className={styles.carouselTrack} ref={trackRef}>
          {display.map((it,i) => (
            <div
              key={i}
              className={`${styles.carouselItem} ${i % items.length === wonIndex ? styles.won : ''}`}
            >
              <img src={it.img} alt="" className={styles.itemImg}/>
              <div className={styles.priceTag}>
                <img src={starIcon} alt="★" className={styles.star}/> {it.price}
              </div>
            </div>
          ))}
        </div>
      </div>

      {wonIndex === null ? (
        <button
          className={styles.playButton}
          onClick={handleSpin}
          disabled={spinning}
        >
          {spinning
            ? (language==='ru'?'Крутим…':'Spinning…')
            : (language==='ru'?'Испытать удачу':'Try your luck')}
        </button>
      ) : (
        <div className={styles.resultButtons}>
          <button onClick={() => window.history.back()}>
            {language==='ru'?'Получить':'Claim'}
          </button>
          <button onClick={() => window.history.back()}>
            {language==='ru'?'Продать':'Sell'}
          </button>
        </div>
      )}
    </div>
  );
}
