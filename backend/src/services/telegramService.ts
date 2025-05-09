import fetch from "node-fetch";

// Telegram Bot Token from environment
const BOT_TOKEN = process.env.BOT_TOKEN!;
export { BOT_TOKEN };

// Helper to build Bot API URL
const API = (method: string) => `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;

// Send invoice to user
export async function sendInvoice(
  chat_id: number,
  amount: number,
  payload: string
) {
  const prices = [{ label: `${amount} XTR`, amount: amount * 100 }];
  const body = {
    chat_id,
    title: "Пополнение баланса звёзд",
    description: `Вы пополняете баланс на ${amount} XTR`,
    payload,
    provider_token: process.env.PROVIDER_TOKEN,
    currency: "RUB",
    prices,
  };

  const res = await fetch(API("sendInvoice"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}
