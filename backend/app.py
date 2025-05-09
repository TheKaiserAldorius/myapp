import os
import uuid
import json
import requests
import hmac
import hashlib
from datetime import datetime
from flask import Flask, request, jsonify, redirect, Response
from flask_cors import CORS
from dotenv import load_dotenv

from models import db, User, Case, Payment

# --- init ---
load_dotenv()
app = Flask(__name__)

# Приведение DATABASE_URL к postgresql://
raw = os.getenv("DATABASE_URL", "")
app.config['SQLALCHEMY_DATABASE_URI'] = raw.replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('ADMIN_SECRET', 'supersecretkey')

# Логирование URI
app.logger.info(f"→ DB_URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

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

@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    payload = request.get_json(force=True) or {}
    init    = payload.get("initDataUnsafe", {})
    # TODO: проверка signature
    tg_user = init.get("user", {})
    tg_id   = str(tg_user.get("id", ""))
    if not tg_id:
        return jsonify({"error":"telegram_id missing"}), 400

    user = User.query.filter_by(telegram_id=tg_id).first()
    if not user:
        user = User(telegram_id=tg_id)
        db.session.add(user)
    user.last_active = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "id": user.id,
        "telegram_id": tg_id,
        "first_name": tg_user.get("first_name", ""),
        "last_name":  tg_user.get("last_name", ""),
        "username":   tg_user.get("username", ""),
        "photo_url":  tg_user.get("photo_url", ""),
        "balance_xtr": user.balance_xtr
    })

@app.route("/api/balance", methods=["GET"])
def get_balance():
    tg_id = request.args.get("telegram_id", "")
    user = User.query.filter_by(telegram_id=tg_id).first()
    return jsonify({"balance_xtr": user.balance_xtr if user else 0})

@app.route("/api/cases", methods=["GET"])
def get_cases():
    cases = Case.query.order_by(Case.id).all()
    return jsonify([
        {"id": c.id, "name": c.name, "price": c.price, "image_url": c.image_url}
        for c in cases
    ])

# Alias route to accept trailing slash
@app.route("/api/cases/", methods=["GET"])
def get_cases_slash():
    return get_cases()

@app.route("/api/create_invoice", methods=["POST"])
def create_invoice():
    data   = request.get_json(force=True) or {}
    tg_id  = data.get("telegram_id")
    amount = int(data.get("amount", 0))
    if not tg_id or amount <= 0:
        return jsonify({"error":"invalid params"}), 400

    user = User.query.filter_by(telegram_id=tg_id).first()
    if not user:
        return jsonify({"error":"user not found"}), 404

    payload = str(uuid.uuid4())
    payment = Payment(user_id=user.id, amount=amount, payload=payload)
    db.session.add(payment)
    db.session.commit()

    requests.post(
        f"https://api.telegram.org/bot{BOT_TOKEN}/sendInvoice",
        json={
            "chat_id":        int(tg_id),
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
    if "pre_checkout_query" in upd:
        pcq = upd["pre_checkout_query"]
        requests.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/answerPreCheckoutQuery",
            json={"pre_checkout_query_id": pcq["id"], "ok": True}
        )
        return jsonify({"ok": True})

    msg = upd.get("message", {})
    pay = msg.get("successful_payment")
    if pay:
        payload = pay.get("invoice_payload")
        p = Payment.query.filter_by(payload=payload).first()
        if p and p.status == "pending":
            p.status = "paid"
            u = User.query.get(p.user_id)
            u.balance_xtr += pay.get("total_amount", 0) // 100
            db.session.commit()
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=True)
