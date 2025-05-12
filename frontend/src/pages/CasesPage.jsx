import React, { useState, useRef, useEffect } from 'react';
import { Button, Headline }         from '@telegram-apps/telegram-ui';
import { Player }                   from '@lottiefiles/react-lottie-player';
import pageAnimation                from '../assets/prize/!!!!!dizzy.json';
import { useCases }                 from '../hooks/useCases';
import { useCaseStatus }            from '../hooks/useCaseStatus';
import { useLanguage }              from '../components/LanguageContext';
import { miniApp, useSignal, useLaunchParams } from '@telegram-apps/sdk-react';
import StarIcon                     from '../assets/prize/StarsIcon.webp';
import NewTape                      from '../assets/newTape/newtape.webp';
import styles                       from './CasesPage.module.css';
import YourRouletteComponent        from '../components/YourRouletteComponent';

// Замените на реальные импорты картинок:
import caseHeart     from '../assets/cases/heart_case.webp';
import caseBear      from '../assets/cases/bear_case.webp';
import caseDurovCap  from '../assets/cases/durov\'s_cap_case.webp';
import caseSwiss     from '../assets/cases/swissWatch_case.webp';
import caseJack      from '../assets/cases/jack_in_the_case.webp';
import caseCake      from '../assets/cases/homemade_cake_case.webp';
import caseSkeleton  from '../assets/cases/skeleton_skull_case.webp';
import caseTopHat    from '../assets/cases/top_hat_case.webp';
import caseSignetRing from '../assets/cases/signet_ring_case.webp';
import caseVintageCigar from '../assets/cases/vintage_cigar_case.webp';
import caseBday      from '../assets/cases/bday_case.webp';
import caseEgg       from '../assets/cases/easter_case.webp';

export default function CasesPage() {
  const { cases, loading }       = useCases();
  const [selectedCase, setSelectedCase] = useState(null);
  const playerRef                = useRef(null);
  const { language }             = useLanguage();
  const isDark                   = useSignal(miniApp.isDark);
  const { platform }             = useLaunchParams();

  // если выбран case — показываем рулетку
  if (selectedCase !== null) {
    return (
      <YourRouletteComponent
        caseId={selectedCase}
        onClose={() => setSelectedCase(null)}
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.lottieWrapper}>
        <Player
          ref={playerRef}
          autoplay
          keepLastFrame
          src={pageAnimation}
          className={styles.lottieAnimation}
          onEvent={evt => evt === 'complete' && playerRef.current.pause()}
        />
      </div>

      <Headline plain weight="1" className={styles.HeadText}>
        {language === 'ru'
          ? 'Какой кейс вы хотите открыть?'
          : 'Which case will you open?'}
      </Headline>

      {loading ? (
        <div>Загрузка кейсов…</div>
      ) : (
        <div className={styles.casesGrid}>
          {cases.map(c => {
            const disabled = useCaseStatus(c.id);
            return (
              <div
                key={c.id}
                className={`${styles.caseCard} ${disabled ? styles.disabledCard : ''}`}
                onClick={() => !disabled && setSelectedCase(c.id)}
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

                  {disabled ? (
                    <Button disabled>blocked</Button>
                  ) : (
                    <div className={styles.caseStars}>
                      <img src={StarIcon} alt="star" />
                      {c.price}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
