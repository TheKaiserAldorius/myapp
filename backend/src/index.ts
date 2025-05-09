import express from "express";
import bodyParser from "body-parser";
import paymentRoutes from "./routes/payment";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.use("/api/payment", paymentRoutes);

// Automatically set Telegram webhook if both URL and BOT_TOKEN are provided
if (process.env.WEBHOOK_URL && process.env.BOT_TOKEN) {
  const webhookUrl = `${process.env.WEBHOOK_URL}/api/payment/webhook`;
  fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  })
    .then((res) => console.log("Webhook set status:", res.status))
    .catch(console.error);
}

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Payment service listening on ${port}`));
