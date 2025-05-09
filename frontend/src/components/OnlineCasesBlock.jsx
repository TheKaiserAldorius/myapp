// frontend/src/components/OnlineCasesBlock.jsx

import React, { useEffect, useState } from 'react';
import './OnlineCasesBlock.scss';
import cakeImage     from '../assets/iconitems/cake.png';
import clownboxImage from '../assets/iconitems/clownbox.png';
import eggImage      from '../assets/iconitems/egg.png';
import ringImage     from '../assets/iconitems/ring.png';
import topheadImage  from '../assets/iconitems/tophead.png';
import { useUserStore } from '../store/useUserStore';

const caseImages = [
  eggImage, ringImage, cakeImage, clownboxImage,
  topheadImage, cakeImage, clownboxImage, cakeImage,
  clownboxImage, topheadImage, cakeImage, clownboxImage,
  ringImage, topheadImage, cakeImage, cakeImage,
];

export default function OnlineCasesBlock() {
  const [online, setOnline] = useState(null);
  const { telegramInitData } = useUserStore();

  useEffect(() => {
    // 1) Определяем tgId
    const testId = import.meta.env.VITE_TEST_TG_ID;
    const rawId  = telegramInitData?.user?.id || testId;
    const tgId   = rawId ? parseInt(rawId, 10) : null;

    // 2) Базовый URL API (из .env.production или Docker ENV)
    const API = import.meta.env.VITE_API_URL || '';

    // 3) Heartbeat (если нужно)
    if (tgId) {
      fetch(`${API}/api/heartbeat?telegram_id=${tgId}`)
        .catch(() => { /* можно показать ошибку пользователю */ });
    }

    // 4) SSE-подписка
    const es = new EventSource(`${API}/api/online/stream`);
    es.onmessage = e => {
      try {
        const { online: count } = JSON.parse(e.data);
        setOnline(count);
      } catch {
        // игнорируем парс-ошибки
      }
    };
    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [telegramInitData]);

  return (
    <div className="online-cases-block">
      <div className="online-block">
        <div className="online-number">
          {online !== null
            ? <span style={{ color: 'lime' }}>{online}</span>
            : '171'}
        </div>
        <div className="online-text">Онлайн</div>
      </div>

      <div className="cases-container">
        {caseImages.map((img, idx) => (
          <div className="case-wrapper" key={idx}>
            <img src={img} alt={`case ${idx}`} className="case-image" />
          </div>
        ))}
      </div>
    </div>
  );
}