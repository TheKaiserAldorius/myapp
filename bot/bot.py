import os, uuid, psycopg2
from datetime import datetime
from aiogram import Bot, Dispatcher, types
from aiogram.utils import executor
from aiogram.types import LabeledPrice

BOT_TOKEN      = os.getenv("BOT_TOKEN")
PROVIDER_TOKEN = os.getenv("PROVIDER_TOKEN")
DB_URL         = os.getenv("DATABASE_URL")

bot = Bot(token=BOT_TOKEN)
dp  = Dispatcher(bot)

# postgres
raw = DB_URL.replace("postgresql://", "postgres://", 1)
conn = psycopg2.connect(raw)
conn.autocommit = True

# inline keyboard
kb = types.InlineKeyboardMarkup(row_width=2)
for stars,xtr in [(50,5),(100,10),(200,20)]:
    kb.insert(types.InlineKeyboardButton(
        f"{stars}⭐ ({xtr} XTR)", callback_data=f"topup_{stars}"
    ))

@dp.message_handler(commands=["start","topup"])
async def cmd_start(message: types.Message):
    uid = str(message.from_user.id)
    cur = conn.cursor()
    cur.execute("INSERT INTO users(telegram_id) VALUES(%s) ON CONFLICT DO NOTHING",(uid,))
    await message.answer(f"Ваш баланс: ...", reply_markup=kb)

@dp.callback_query_handler(lambda c: c.data.startswith("topup_"))
async def cb_topup(q: types.CallbackQuery):
    stars = int(q.data.split("_")[1])
    xtr   = stars//10
    prices = [LabeledPrice(label=f"{xtr} XTR", amount=stars*100)]
    await bot.send_invoice(
        chat_id=q.from_user.id,
        title="Пополнение баланса",
        description=f"{stars} Stars → {xtr} XTR",
        payload=str(uuid.uuid4()),
        provider_token=PROVIDER_TOKEN,
        currency="USD",
        prices=prices
    )
    await q.answer()

@dp.pre_checkout_query_handler(lambda q: True)
async def pre_checkout(q: types.PreCheckoutQuery):
    await bot.answer_pre_checkout_query(q.id, ok=True)

@dp.message_handler(content_types=types.ContentType.SUCCESSFUL_PAYMENT)
async def on_pay(message: types.Message):
    amount = message.successful_payment.total_amount//100
    xtr    = amount//10
    uid    = str(message.from_user.id)
    cur    = conn.cursor()
    cur.execute("UPDATE users SET balance_xtr=balance_xtr+%s WHERE telegram_id=%s",(xtr,uid))
    await message.answer(f"✅ Оплачено {xtr} XTR\nНовый баланс получен в мини-приложении.")

if __name__=="__main__":
    executor.start_polling(dp, skip_updates=True)
