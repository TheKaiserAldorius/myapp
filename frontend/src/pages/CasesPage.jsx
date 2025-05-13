import React, { useState, useEffect, useRef } from 'react';
import { Button, Headline }            from '@telegram-apps/telegram-ui';
import { Page }                        from '@/components/Page';
import { Player }                      from '@lottiefiles/react-lottie-player';
import pageAnimation                   from '../assets/prize/!!!!!dizzy.json';
import { useCases }                    from '../hooks/useCases.js';
import { fetchCaseStatus }             from '../config/api.js';
import { useLanguage }                 from '../components/LanguageContext';
import { miniApp, useSignal, useLaunchParams } from '@telegram-apps/sdk-react';
import StarIcon                        from '../assets/prize/StarsIcon.webp';
import NewTape                         from '../assets/newTape/newtape.webp';
import styles                          from './CasesPage.module.css';

export default function CasesPage() {
  const { cases, loading } = useCases();
  const [statuses, setStatuses] = useState({});
  const [selected, setSelected] = useState(null);
  const playerRef = useRef(null);
  const { language } = useLanguage();
  const isDark       = useSignal(miniApp.isDark);
  const { platform } = useLaunchParams();

  // подтягиваем статус «disabled» для каждого кейса
  useEffect(() => {
    cases.forEach(c =>
      fetchCaseStatus(c.id)
        .then(dis => setStatuses(s => ({ ...s, [c.id]: dis })))
        .catch(() => setStatuses(s => ({ ...s, [c.id]: false })))
    );
  }, [cases]);

  // если выбран кейс — открываем GamePage по маршруту
  if (selected !== null) {
    return <Page backTo="/" back={false}><GamePage caseId={selected} /></Page>;
  }

  return (
    <Page back={false}>
      <div className={styles.lottieWrapper}>
        <Player
          ref={playerRef}
          autoplay
          keepLastFrame
          className={styles.lottieAnimation}
          src={pageAnimation}
        />
      </div>
      <Headline plain weight="1" className={styles.HeadText}>
        {language === 'ru'
          ? 'Какой кейс вы хотите открыть?'
          : 'Which case will you open?'}
      </Headline>

      {loading ? (
        <div className={styles.loadingText}>
          {language === 'ru' ? 'Загрузка кейсов…' : 'Loading cases…'}
        </div>
      ) : (
        <div className={styles.casesGrid}>
          {cases.map(c => {
            const disabled = statuses[c.id];
            return (
              <div
                key={c.id}
                className={`${styles.caseCard} ${disabled ? styles.disabledCard : ''}`}
                onClick={() => !disabled && setSelected(c.id)}
              >
                <div className={styles.cardContent}>
                  {c.is_new && (
                    <div className={styles.newTapeContainer}>
                      <img src={NewTape} alt="NEW" className={styles.newTape} />
                      <span className={styles.newTapeText}>
                        {language === 'ru' ? 'НОВЫЙ' : 'NEW'}
                      </span>
                    </div>
                  )}
                  <img src={c.image_url} alt={c.name} className={styles.caseImage} />
                  <h3 className={styles.caseTitle}>{c.name}</h3>
                  <div className={styles.caseStars}>
                    <img src={StarIcon} alt="★" />
                    {c.price}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}
