import { useState } from "react";
import { useUserStore } from "../store/useUserStore";

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function StarTopUp() {
  const { telegramInitData, setBalance } = useUserStore();
  const [amount, setAmount] = useState(100);

  const buy = async () => {
    await fetch("/api/payment/create-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegram_id: telegramInitData.user.id,
        amount,
      }),
    });
    // открываем счёт в UI Telegram
    window.Telegram.WebApp.openInvoice({
      // параметры совпадают с теми, что мы отправили в sendInvoice
      title: `Пополнение на ${amount} XTR`,
      description: `Вы пополняете на ${amount} XTR`,
      payload: "",         // тот же уникальный payload
      provider_token: import.meta.env.VITE_PROVIDER_TOKEN,
      currency: "RUB",
      prices: [{ label: `${amount} XTR`, amount: amount * 100 }],
    });
  };

  return (
    <div className="star-topup">
      <h2>Пополнить звёзды</h2>
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
      />
      <button onClick={buy}>Купить</button>
    </div>
  );
}
