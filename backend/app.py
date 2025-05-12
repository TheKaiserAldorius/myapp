import os
import uuid
import time
from datetime import datetime, timedelta

import requests
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy import func, text

from models import db, User, Case, Payment

# --- ИНИЦИАЛИЗАЦИЯ ---
load_dotenv()
app = Flask(__name__)

raw = os.getenv("DATABASE_URL", "")
app.config['SQLALCHEMY_DATABASE_URI'] = raw.replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('ADMIN_SECRET', 'supersecretkey')

CORS(app, resources={r"/api/*": {"origins": "*"}})
db.init_app(app)

BOT_TOKEN      = os.getenv("BOT_TOKEN", "")
PROVIDER_TOKEN = os.getenv("PROVIDER_TOKEN", "")
WEB_APP_URL    = os.getenv("WEB_APP_URL", "")

# --- МАРШРУТЫ ---
@app.route('/')
def root():
    return redirect(WEB_APP_URL)

@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    payload = request.get_json(force=True) or {}
    init    = payload.get("initDataUnsafe", {})
    tg_user = init.get("user", {})
    chat_id = tg_user.get("id")
    if not chat_id:
        return jsonify({"error": "chat_id missing"}), 400

    user = User.query.filter_by(chat_id=chat_id).first()
    if not user:
        user = User(chat_id=chat_id, username=tg_user.get("username"))
        db.session.add(user)
    user.last_active = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "id":           user.id_user,
        "telegram_id":  chat_id,
        "first_name":   tg_user.get("first_name", ""),
        "last_name":    tg_user.get("last_name", ""),
        "username":     user.username,
        "photo_url":    tg_user.get("photo_url", ""),
        "balance_xtr":  float(user.balance_xtr or 0),
    })

@app.route("/api/balance", methods=["GET"])
def get_balance():
    chat_id = request.args.get("telegram_id", type=int)
    user = User.query.filter_by(chat_id=chat_id).first()
    return jsonify({"balance_xtr": float(user.balance_xtr or 0) if user else 0})

@app.route("/api/cases", methods=["GET"])
def get_cases():
    cases = Case.query.order_by(Case.id).all()
    return jsonify([
        {"id": c.id, "name": c.name, "price": c.price, "image_url": c.image_url}
        for c in cases
    ])

@app.route("/api/create_invoice", methods=["POST"])
def create_invoice():
    data    = request.get_json(force=True) or {}
    chat_id = data.get("telegram_id")
    amount  = int(data.get("amount", 0))
    if not chat_id or amount <= 0:
        return jsonify({"error": "invalid params"}), 400

    user = User.query.filter_by(chat_id=chat_id).first()
    if not user:
        return jsonify({"error": "user not found"}), 404

    payload = str(uuid.uuid4())
    payment = Payment(user_id=user.id_user, amount=amount, payload=payload)
    db.session.add(payment)
    db.session.commit()

    requests.post(
        f"https://api.telegram.org/bot{BOT_TOKEN}/sendInvoice",
        json={
            "chat_id":        int(chat_id),
            "title":          "Пополнение XTR",
            "description":    f"Зачисляется {amount} XTR",
            "payload":        payload,
            "provider_token": PROVIDER_TOKEN,
            "currency":       "USD",
            "prices":         [{"label": f"{amount} XTR", "amount": amount * 100}]
        }
    )
    return jsonify({"ok": True})

@app.route("/webhook", methods=["POST"])
def webhook():
    upd = request.get_json(force=True) or {}
    # Pre-checkout
    if "pre_checkout_query" in upd:
        pcq = upd["pre_checkout_query"]
        requests.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/answerPreCheckoutQuery",
            json={"pre_checkout_query_id": pcq["id"], "ok": True}
        )
        return jsonify({"ok": True})

    # Successful payment
    msg = upd.get("message", {})
    pay = msg.get("successful_payment")
    if pay:
        payload = pay.get("invoice_payload")
        p = Payment.query.filter_by(payload=payload).first()
        if p and p.status == "pending":
            p.status = "paid"
            u = User.query.get(p.user_id)
            u.stars_count += pay.get("total_amount", 0) // 100
            u.balance_xtr  = (u.balance_xtr or 0) + (pay.get("total_amount", 0) / 100)
            db.session.commit()
    return jsonify({"ok": True})

@app.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    period = request.args.get("period")
    # недельный рейтинг
    if period == "weekly":
        week_ago = datetime.utcnow() - timedelta(days=7)
        subq = db.session.query(
            Payment.user_id,
            func.sum(Payment.amount).label("total_earned")
        ).filter(Payment.created_at >= week_ago) \
         .group_by(Payment.user_id) \
         .subquery()

        rows = db.session.query(
            User.id_user, User.username, subq.c.total_earned
        ).join(subq, subq.c.user_id == User.id_user) \
         .order_by(subq.c.total_earned.desc()) \
         .limit(100) \
         .all()

        data = [
            {"id": u.id_user, "username": u.username or "", "total_earned": int(total)}
            for u, _, total in rows
        ]
    else:
        # общий рейтинг
        users = User.query.order_by(User.stars_count.desc()) \
                         .limit(100) \
                         .all()
        data = [
            {"id": u.id_user, "username": u.username or "", "total_earned": u.stars_count}
            for u in users
        ]

    return jsonify({"success": True, "data": data})

@app.route("/api/user/<int:user_id>/rank", methods=["GET"])
def get_user_rank(user_id):
    users = User.query.order_by(User.stars_count.desc()).all()
    for idx, u in enumerate(users, start=1):
        if u.id_user == user_id:
            return jsonify({"rank": idx})
    return jsonify({"rank": None}), 404

@app.route("/api/history", methods=["GET"])
def get_history():
    chat_id = request.args.get("telegram_id", type=int)
    user = User.query.filter_by(chat_id=chat_id).first()
    if not user:
        return jsonify({"success": False, "data": [], "error": "user not found"}), 404

    uid = user.id_user
    history = []

    # 1) Депозиты и продажи
    deposit_sql = text("""
      SELECT id_deposit AS id,
             price        AS amount,
             date,
             source
      FROM history_deposit
      WHERE user_id = :uid
    """)
    for row in db.session.execute(deposit_sql, {"uid": uid}):
        kind = "deposit" if row.source == "donate" else "sale"
        desc = "Пополнение XTR" if row.source == "donate" else "Продажа подарка"
        history.append({
            "id":          str(row.id),
            "type":        kind,
            "description": desc,
            "stars":       row.amount,
            "date":        row.date.isoformat()
        })

    # 2) Выигрыши в играх
    game_sql = text("""
      SELECT h.id_game AS id,
             h.price    AS amount,
             h.date
      FROM history_game h
      WHERE h.user_id = :uid
    """)
    for row in db.session.execute(game_sql, {"uid": uid}):
        history.append({
            "id":          str(row.id),
            "type":        "gift_received",
            "description": "Подарок получен",
            "stars":       row.amount,
            "date":        row.date.isoformat()
        })

    # Сортировка по дате, от новых к старым
    history.sort(key=lambda x: x["date"], reverse=True)

    return jsonify({"success": True, "data": history})

# --- ENDPOINT ONLINE COUNT ---
@app.route("/api/heartbeat", methods=["GET"])
def heartbeat():
    chat_id = request.args.get("telegram_id", type=int)
    user = User.query.filter_by(chat_id=chat_id).first()
    if user:
        user.last_active = datetime.utcnow()
        db.session.commit()
    return jsonify({"ok": True})

@app.route("/api/online/stream", methods=["GET"])
def online_stream():
    def event_stream():
        while True:
            now = datetime.utcnow()
            minutes_ago = now - timedelta(minutes=5)
            count = User.query.filter(User.last_active >= minutes_ago).count()
            yield f"data: {{\"online\": {count}}}\n\n"
            time.sleep(10)
    return app.response_class(event_stream(), mimetype='text/event-stream')

# --- ЗАПУСК СЕРВЕРА ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=True)
