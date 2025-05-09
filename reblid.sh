#!/bin/bash

# Название файла docker-compose
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Проверяем, существует ли docker-compose.yml
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
  echo "Ошибка: Файл $DOCKER_COMPOSE_FILE не найден в текущей директории."
  exit 1
fi

echo "=== Остановка и удаление текущих контейнеров ==="
docker-compose down

echo "=== Пересборка Docker-образов ==="
docker-compose build

echo "=== Запуск контейнеров в фоновом режиме ==="
docker-compose up -d

echo "=== Список запущенных контейнеров ==="
docker ps

echo "=== Логи backend-контейнера ==="
docker logs casinmain-backend -n 20

echo "=== Логи frontend-контейнера ==="
docker logs casinmain-frontend -n 20

echo "=== Логи базы данных ==="
docker logs casinmain-db -n 20

echo "=== Все контейнеры успешно запущены! ==="
