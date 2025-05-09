#!/usr/bin/env sh

# Настройка (можно задать извне или править тут)
API_URL=${API_URL:-http://82.202.129.176:4000}
TG_ID=${TG_ID:-6103982888}

echo "=== Heartbeat ==="
curl -s "${API_URL}/api/heartbeat?telegram_id=${TG_ID}"

echo "\n=== One-time online ==="
curl -s "${API_URL}/api/online"

echo "\n=== Streaming online (5 updates, every ~10s) ==="
# Используем curl -N для SSE, читаем первые 5 data: строк
curl -sN "${API_URL}/api/online/stream" | \
  awk '
    /^data: / {
      # вырезаем JSON после "data: "
      msg = substr($0, 7)
      print "→ online =", msg
      c++
      if (c>=5) exit
    }
  '
