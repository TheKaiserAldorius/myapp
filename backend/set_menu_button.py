# backend/set_menu_button.py
import os, requests

BOT_TOKEN   = os.getenv("BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL")

if not BOT_TOKEN or not WEB_APP_URL:
    raise RuntimeError("Нужны переменные BOT_TOKEN и WEB_APP_URL")

resp = requests.post(
    f"https://api.telegram.org/bot{BOT_TOKEN}/setChatMenuButton",
    json={
      "menu_button": {
        "type":    "web_app",
        "text":    "Открыть приложение",
        "web_app": {"url": WEB_APP_URL}
      }
    }
)
data = resp.json()
if not data.get("ok"):
    raise RuntimeError(f"Telegram error: {data}")
print("✅ WebApp-кнопка установлена")
