-- users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  balance_xtr INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount INTEGER NOT NULL,         -- сумма в XTR
  payload TEXT NOT NULL,           -- invoice_payload
  status VARCHAR(20) NOT NULL,     -- pending, paid, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
