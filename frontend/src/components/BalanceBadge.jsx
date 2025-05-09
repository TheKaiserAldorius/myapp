// frontend/src/components/BalanceBadge.jsx
import React, { useEffect } from 'react';
import { useUserStore } from '../store/useUserStore';
import starIcon from '../assets/buttonsicons/StarTg.png';
import plusIcon from '../assets/buttonsicons/plusbut.png';
import './BalanceBadge.scss';

const BACKEND = 'http://82.202.129.176:4000';
// TODO: заменить на telegramInitData.user.id после настройки Telegram.WebApp.initDataUnsafe
const TEST_TG_ID = 671938551;
// Фиксированная сумма пополнения (можно вынести в пропс или стейт)
const TOPUP_AMOUNT = 100;

export default function BalanceBadge() {
  const { telegramInitData, balance, setBalance } = useUserStore();

  useEffect(() => {
    const tgId = telegramInitData?.user?.id || TEST_TG_ID;
    // 1) один раз подгружаем текущий баланс
    fetch(`${BACKEND}/api/balance?telegram_id=${tgId}`)
      .then(r => r.json())
      .then(d => {
        if (typeof d.balance_xtr === 'number') {
          setBalance(d.balance_xtr);
        }
      })
      .catch(console.error);

    // 2) подписываемся на SSE-стрим обновлений баланса
    const es = new EventSource(
      `${BACKEND}/api/balance/stream?telegram_id=${tgId}`
    );
    es.onmessage = e => {
      try {
        const { balance: newBal } = JSON.parse(e.data);
        setBalance(newBal);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };
    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [telegramInitData, setBalance]);

  const handleTopUp = async () => {
    const tgId = telegramInitData?.user?.id || TEST_TG_ID;

    // Создаём инвойс на сервере
    const resp = await fetch(`${BACKEND}/create_invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegram_id: tgId,
        amount: TOPUP_AMOUNT
      })
    });
    const { payload } = await resp.json();

    // Открываем платёжное окно Telegram
    window.Telegram.WebApp.openInvoice({
      chat_id: tgId,
      title: `Пополнение на ${TOPUP_AMOUNT} XTR`,
      description: `Вы пополняете баланс на ${TOPUP_AMOUNT} XTR`,
      payload,
      provider_token: import.meta.env.VITE_PROVIDER_TOKEN,
      currency: 'RUB',
      prices: [
        { label: `${TOPUP_AMOUNT} XTR`, amount: TOPUP_AMOUNT * 100 }
      ]
    });
  };

  return (
    <div className="balance-badge">
      <img src={starIcon} alt="звезда" className="balance-badge__icon" />
      <span className="balance-badge__amount">{balance}</span>
      <button
        className="balance-badge__topup"
        onClick={handleTopUp}
        aria-label="Пополнить баланс"
      >
        <img src={plusIcon} alt="плюс" />
      </button>
    </div>
  );
}
