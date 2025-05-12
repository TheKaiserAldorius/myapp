from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id_user = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.BigInteger, unique=True, nullable=False)
    username = db.Column(db.String(50))
    stars_count = db.Column(db.Integer, default=0)
    telegram_id = db.Column(db.BigInteger)
    balance_xtr = db.Column(db.Numeric(10, 2), default=0)
    last_active = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime)

    payments = db.relationship("Payment", back_populates="user", cascade="all, delete-orphan")

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id_user'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    payload = db.Column(db.String, unique=True, nullable=False)
    status = db.Column(db.String, default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="payments")

class Case(db.Model):
    __tablename__ = 'cases'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    price = db.Column(db.Integer)
    image_url = db.Column(db.String)
