import os
import uuid
import time
from datetime import datetime, timedelta

import requests
from flask import Flask, request, jsonify, redirect, abort
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy import func, union_all, text

from models import db, User, Case, Payment, HistoryGame

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

@app.before_first_request
def create_tables():
    db.create_all()

@app.route('/')
def root():
    return redirect(WEB_APP_URL)

# --- AUTH ---
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
        "username":     user.username or "",
        "photo_url":    tg_user.get("photo_url", ""),
        "balance_xtr":  float(user.balance_xtr or 0),
    })

# --- BALANCE ---
@app.route("/api/balance", methods=["GET"])
def get_balance():
    chat_id = request.args.get("telegram_id", type=int)
    user = User.query.filter_by(chat_id=chat_id).first()
    return jsonify({"balance_xtr": float(user.balance_xtr or 0) if user else 0})

# --- CASES ---
@app.route("/api/cases", methods=["GET"])
def get_cases():
    cases = Case.query.order_by(Case.id).all()
    return jsonify([
        {"id": c.id, "name": c.name, "price": c.price, "image_url": c.image_url}
        for c in cases
    ])

# --- INVOICES ---
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
        p = Payment.query.filter_by(payload=pay["invoice_payload"]).first()
        if p and p.status == "pending":
            p.status = "paid"
            u = User.query.get(p.user_id)
            u.stars_count += pay["total_amount"] // 100
            u.balance_xtr = (u.balance_xtr or 0) + (pay["total_amount"] / 100)
            db.session.commit()
    return jsonify({"ok": True})

# --- LEADERBOARD ---
@app.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    period = request.args.get("period")
    if period == "weekly":
        week_ago = datetime.utcnow() - timedelta(days=7)

        # пополнения за неделю
        deposit_q = db.session.query(
            Payment.user_id.label("user_id"),
            Payment.amount.label("value")
        ).filter(
            Payment.status == "paid",
            Payment.created_at >= week_ago
        )

        # выигрыши за неделю
        game_q = db.session.query(
            HistoryGame.user_id.label("user_id"),
            HistoryGame.price.label("value")
        ).filter(
            HistoryGame.date >= week_ago
        )

        ev = union_all(deposit_q, game_q).alias("ev")
        rows = db.session.query(
            ev.c.user_id,
            func.sum(ev.c.value).label("total_earned")
        ).group_by(ev.c.user_id) \
         .order_by(func.sum(ev.c.value).desc()) \
         .limit(100) \
         .all()

        data = [
            {
                "id":            uid,
                "username":      User.query.get(uid).username or "",
                "total_earned":  int(total)
            }
            for uid, total in rows
        ]
    else:
        users = User.query.order_by(User.stars_count.desc()).limit(100).all()
        data = [
            {"id": u.id_user, "username": u.username or "", "total_earned": u.stars_count}
            for u in users
        ]

    return jsonify({"success": True, "data": data})

# --- USER RANK ---
@app.route("/api/user/<int:user_id>/rank", methods=["GET"])
def get_user_rank(user_id):
    users = User.query.order_by(User.stars_count.desc()).all()
    for idx, u in enumerate(users, start=1):
        if u.id_user == user_id:
            return jsonify({"rank": idx})
    return jsonify({"rank": None}), 404

# --- HISTORY ---
@app.route("/api/history", methods=["GET"])
def get_history():
    tg_id = request.args.get("telegram_id", type=int)
    user = User.query.filter_by(chat_id=tg_id).first()
    if not user:
        return jsonify({"success": False, "data": [], "error": "user not found"}), 404

    uid     = user.id_user
    history = []

    # 1) Пополнения (все статусы)
    for p in Payment.query.filter_by(user_id=uid).order_by(Payment.created_at.desc()).all():
        history.append({
            "id":          f"dep_{p.id}",
            "type":        "deposit",
            "description": "Пополнение XTR",
            "stars":       p.amount,
            "date":        p.created_at.isoformat()
        })

    # 2) Продажи подарков
    sell_sql = text("""
      SELECT id_deposit AS id, price AS amount, date
      FROM history_deposit
      WHERE user_id = :uid AND source = 'sell'
      ORDER BY date DESC
    """)
    for row in db.session.execute(sell_sql, {"uid": uid}):
        history.append({
            "id":          f"sell_{row.id}",
            "type":        "sale",
            "description": "Продажа подарка",
            "stars":       row.amount,
            "date":        row.date.isoformat()
        })

    # 3) Полученные подарки
    for g in HistoryGame.query.filter_by(user_id=uid).order_by(HistoryGame.date.desc()).all():
        history.append({
            "id":          f"game_{g.id_game}",
            "type":        "gift_received",
            "description": "Подарок получен",
            "stars":       g.price,
            "date":        g.date.isoformat()
        })

    # 4) Обмены подарков (если есть created_at в gift_user_have)
    exch_sql = text("""
      SELECT id_gift_number AS id, created_at AS date
      FROM gift_user_have
      WHERE user_id = :uid AND received = true
      ORDER BY created_at DESC
    """)
    try:
        for row in db.session.execute(exch_sql, {"uid": uid}):
            history.append({
                "id":          f"exch_{row.id}",
                "type":        "gift_exchanged",
                "description": "Подарок обменян",
                "stars":       0,
                "date":        row.date.isoformat()
            })
    except Exception:
        pass

    history.sort(key=lambda x: x["date"], reverse=True)
    return jsonify({"success": True, "data": history})

# --- HEARTBEAT & ONLINE COUNT ---
@app.route("/api/heartbeat", methods=["GET"])
def heartbeat():
    tg_id = request.args.get("telegram_id", type=int)
    user = User.query.filter_by(chat_id=tg_id).first()
    if user:
        user.last_active = datetime.utcnow()
        db.session.commit()
    return jsonify({"ok": True})

@app.route("/api/online/stream", methods=["GET"])
def online_stream():
    def event_stream():
        while True:
            cut = datetime.utcnow() - timedelta(minutes=5)
            cnt = User.query.filter(User.last_active >= cut).count()
            yield f"data: {{\"online\": {cnt}}}\n\n"
            time.sleep(10)
    return app.response_class(event_stream(), mimetype='text/event-stream')

# --- RUN SERVER ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=True)
