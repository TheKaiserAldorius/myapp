import os
import uuid
import requests
import hmac
import hashlib
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Case, Payment
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Поддержка формата DATABASE_URL
raw = os.getenv("DATABASE_URL", "")
# Psycopg2 тоже понимает postgres://, но на всякий случай приведём к postgresql://
DATABASE_URL = raw.replace("postgres://", "postgresql://", 1)
app.config.update(
    SQLALCHEMY_DATABASE_URI=DATABASE_URL,
    SQLALCHEMY_TRACK_MODIFICATIONS=False
)
CORS(app, resources={r"/api/*": {"origins": "*"}})
db.init_app(app)

BOT_TOKEN      = os.getenv("BOT_TOKEN", "")
PROVIDER_TOKEN = os.getenv("PROVIDER_TOKEN", "")

# Если вам нужен общий webhook-эндпоинт, можно его вынести сюда же, 
# но пока оставим только user_api.

@app.route('/api/user/gifts', methods=['GET'])
def get_user_gifts():
    tg_id = request.args.get('telegram_id')
    if not tg_id:
        return jsonify({'error':'telegram_id required'}), 400

    # SQLAlchemy-сессия
    user = User.query.filter_by(telegram_id=tg_id).first()
    if not user:
        return jsonify([])

    # Предполагаем, что у вас есть таблица user_prizes
    res = []
    rows = db.session.execute("""
        SELECT up.id AS gift_id,
               c.name,
               c.image_url,
               c.price AS stars
        FROM user_prizes up
        JOIN users u ON up.user_id = u.id
        JOIN cases c ON up.case_id = c.id
        WHERE u.telegram_id = :tg
          AND up.status = 'won'
        ORDER BY up.created_at DESC
    """, {"tg": tg_id})
    for r in rows:
        res.append(dict(r))
    return jsonify(res)

@app.route('/api/user/gifts/sell', methods=['POST'])
def sell_user_gift():
    data = request.get_json(force=True) or {}
    tg_id   = data.get('telegram_id')
    gift_id = data.get('gift_id')
    if not tg_id or not gift_id:
        return jsonify({'error':'telegram_id and gift_id required'}), 400

    # Аналогично — через SQLAlchemy
    row = db.session.execute("""
        SELECT up.user_id, c.price
        FROM user_prizes up
        JOIN users u ON up.user_id = u.id
        JOIN cases c ON up.case_id = c.id
        WHERE up.id = :gid
          AND u.telegram_id = :tg
          AND up.status = 'won'
    """, {"gid": gift_id, "tg": tg_id}).first()

    if not row:
        return jsonify({'error': 'gift not found'}), 404

    user_id, stars = row.user_id, row.price
    # Обновляем статус призов и баланс
    db.session.execute("UPDATE user_prizes SET status='sold' WHERE id = :gid", {"gid": gift_id})
    db.session.execute("UPDATE users SET balance_xtr = balance_xtr + :s WHERE id = :uid",
                       {"s": stars, "uid": user_id})
    db.session.commit()

    return jsonify({'ok': True, 'credited': stars})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 4000)), debug=True)
