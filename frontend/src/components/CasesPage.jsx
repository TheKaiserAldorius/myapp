  import React, { useState, useEffect } from 'react';
  import { Button, Headline } from '@telegram-apps/telegram-ui';
  import { Page } from '@/components/Page';
  import { Player } from '@lottiefiles/react-lottie-player';
  import pageAnimation from '../assets/prize/!!!!!dizzy.json';
  import { useCases } from '../hooks/useCases.js';
  import { fetchCaseStatus } from '../config/api.js';
  import YourRouletteComponent from './YourRouletteComponent';
  import { miniApp, useSignal, useLaunchParams } from '@telegram-apps/sdk-react';
  import StarIcon from '../assets/prize/StarsIcon.webp';
  import NewTape from '../assets/newTape/newtape.webp';
  import styles from './CasesPage.module.css';

  export default function CasesPage() {
    const { cases, loading } = useCases();
    const [statuses, setStatuses] = useState({});
    const [selected, setSelected] = useState(null);
    const { language } = useLanguage();
    const isDark = useSignal(miniApp.isDark);
    const { platform } = useLaunchParams();

    useEffect(() => {
      cases.forEach(c =>
        fetchCaseStatus(c.id)
          .then(disabled => setStatuses(s => ({ ...s, [c.id]: disabled })))
          .catch(() => setStatuses(s => ({ ...s, [c.id]: false })))
      );
    }, [cases]);

    if (selected !== null) {
      return (
        <YourRouletteComponent
          caseId={selected}
          onClose={() => setSelected(null)}
        />
      );
    }

    return (
      <Page back={false}>
        <div className={styles.lottieWrapper}>
          <Player
            ref={ref => { /* noop */ }}
            autoplay loop
            className={styles.lottieAnimation}
            src={pageAnimation}
          />
        </div>
        <Headline className={styles.HeadText}>
          {language === 'ru' ? 'Какой кейс вы хотите открыть?' : 'Which case will you open?'}
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
                      <img src={StarIcon} alt="star" />
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
