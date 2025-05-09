import os
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify

db_url = os.getenv("DATABASE_URL")  # postgres://.../casin
conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor)
app = Flask(name)

@app.route('/api/cases', methods=['GET'])
def get_cases():
with conn.cursor() as cur:
cur.execute(
"SELECT id, name, price, image_url FROM cases ORDER BY id"
)
cases = cur.fetchall()
return jsonify(cases)

if name == 'main':
port = int(os.getenv('PORT', 4000))
app.run(host='0.0.0.0', port=port)
