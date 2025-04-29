import fetch from "node-fetch";
const BOT_TOKEN = process.env.BOT_TOKEN!;
const API = (method: string) => `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;

export async function sendInvoice(chat_id: number, amount: number, payload: string) {
  // Telegram expects prices in the smallest currency unit; for XTR we treat 1 XTR = 100 "cents"
  const prices = [{ label: `${amount} XTR`, amount: amount * 100 }];
  const body = {
    chat_id,
    title: "Пополнение баланса звёзд",
    description: `Вы пополняете баланс на ${amount} XTR`,
    payload,
    provider_token: process.env.PROVIDER_TOKEN,
    currency: "RUB",   // или любая другая валюта
    prices,
  };
  const res = await fetch(API("sendInvoice"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}
