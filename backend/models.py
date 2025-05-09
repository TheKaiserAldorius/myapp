from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id           = db.Column(db.Integer, primary_key=True)
    telegram_id  = db.Column(db.String, unique=True, nullable=False)
    balance_xtr  = db.Column(db.Integer, default=0)
    last_active  = db.Column(db.DateTime, default=datetime.utcnow)
    created_at   = db.Column(db.DateTime, server_default=db.func.now())

class Case(db.Model):
    __tablename__ = 'cases'
    id        = db.Column(db.Integer, primary_key=True)
    name      = db.Column(db.String,  nullable=False)
    price     = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String)

class Payment(db.Model):
    __tablename__ = 'payments'
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount     = db.Column(db.Integer, nullable=False)
    payload    = db.Column(db.String,  nullable=False, unique=True)
    status     = db.Column(db.String,  default='pending')
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    user       = db.relationship('User', backref='payments')
