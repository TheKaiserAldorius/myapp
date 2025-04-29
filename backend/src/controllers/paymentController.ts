import { Request, Response } from "express";
import { pool } from "../db";
import { sendInvoice } from "../services/telegramService";
import { v4 as uuidv4 } from "uuid";

export async function createInvoice(req: Request, res: Response) {
  const { telegram_id, amount } = req.body;
  if (!telegram_id || !amount) return res.status(400).send("Bad request");

  // 1) find or create user
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const userRes = await client.query(
      `INSERT INTO users (telegram_id) VALUES ($1)
       ON CONFLICT (telegram_id) DO UPDATE SET telegram_id=EXCLUDED.telegram_id
       RETURNING id`,
      [telegram_id]
    );
    const userId = userRes.rows[0].id;

    // 2) record a pending payment
    const payload = uuidv4();
    await client.query(
      `INSERT INTO payments (user_id, amount, payload, status)
       VALUES ($1,$2,$3,'pending')`,
      [userId, amount, payload]
    );

    // 3) send invoice via Telegram API
    await sendInvoice(telegram_id, amount, payload);
    await client.query("COMMIT");
    res.json({ success: true });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).send("Internal error");
  } finally {
    client.release();
  }
}

export async function handleWebhook(req: Request, res: Response) {
  const update = req.body;
  // 1) pre_checkout_query
  if (update.pre_checkout_query) {
    return res.json({ ok: true });
  }
  // 2) successful_payment
  if (update.message && update.message.successful_payment) {
    const payload = update.message.successful_payment.invoice_payload;
    const chatId = update?.message?.chat?.id;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // mark payment as paid
      const payRes = await client.query(
        `UPDATE payments SET status='paid' WHERE payload=$1 RETURNING user_id, amount`,
        [payload]
      );
      const { user_id, amount } = payRes.rows[0];
      // increment user balance
      await client.query(
        `UPDATE users SET balance_xtr = balance_xtr + $1 WHERE id=$2`,
        [amount, user_id]
      );
      await client.query("COMMIT");
      console.log(`User ${chatId} topped up ${amount} XTR`);
    } catch (e) {
      await client.query("ROLLBACK");
      console.error(e);
    } finally {
      client.release();
    }
  }
  res.sendStatus(200);
}
