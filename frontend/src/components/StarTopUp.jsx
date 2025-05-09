// frontend/src/components/StarTopUp.jsx

import React, { useState } from "react";
import { useUserStore } from "../store/useUserStore";

export default function StarTopUp() {
  const { telegramInitData } = useUserStore();
  const [amount, setAmount] = useState(100);

  const buy = async () => {
    const tgId = telegramInitData?.user?.id;
    if (!tgId) return;

    // Создаём счёт на бэке
    await fetch("/api/create_invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegram_id: tgId,
        amount,
      }),
    });

    // Открываем встроенный WebApp-инвойс, если доступен
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.openInvoice({
        chat_id: tgId,
        title: `Пополнение на ${amount} XTR`,
        description: `Вы пополняете на ${amount} XTR`,
        payload: telegramInitData.initData, // payload из initDataUnsafe
        provider_token: process.env.REACT_APP_PROVIDER_TOKEN, // установить через .env
        currency: "RUB",
        prices: [{ label: `${amount} XTR`, amount: amount * 100 }],
      });
    }
  };

  return (
    <div className="star-topup">
      <h2>Пополнить звёзды</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button onClick={buy}>Купить</button>
    </div>
  );
}
