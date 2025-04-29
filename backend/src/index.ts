import express from "express";
import bodyParser from "body-parser";
import paymentRoutes from "./routes/payment";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());

app.use("/api/payment", paymentRoutes);

// Telegram webhook setup (run once)
if (process.env.WEBHOOK_URL) {
  import("./services/telegramService").then(({ BOT_TOKEN }) => {
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `${process.env.WEBHOOK_URL}/api/payment/webhook` }),
    });
  });
}

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Payment service listening on ${port}`));
