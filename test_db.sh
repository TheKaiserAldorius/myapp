#!/bin/bash

# IP-адрес VPS
VPS_IP="82.202.129.176"
POSTGRES_PORT=5432
DOCKER_CONTAINER_NAME="casinmain-db-1"

echo "=== Проверка доступности PostgreSQL на VPS ==="

# Проверка, слушает ли PostgreSQL порт 5432
echo "1. Проверка, слушает ли PostgreSQL порт $POSTGRES_PORT на VPS..."
sudo netstat -tuln | grep $POSTGRES_PORT
if [ $? -eq 0 ]; then
    echo "PostgreSQL слушает порт $POSTGRES_PORT на VPS."
else
    echo "PostgreSQL НЕ слушает порт $POSTGRES_PORT на VPS. Проверьте настройки postgresql.conf."
    exit 1
fi

# Проверка доступности порта 5432 с локальной машины
echo "2. Проверка доступности порта $POSTGRES_PORT с локальной машины..."
nc -zv $VPS_IP $POSTGRES_PORT
if [ $? -eq 0 ]; then
    echo "Порт $POSTGRES_PORT доступен с локальной машины."
else
    echo "Порт $POSTGRES_PORT НЕ доступен с локальной машины. Проверьте настройки файрвола."
    exit 1
fi

echo "=== Проверка PostgreSQL внутри Docker-контейнера ==="

# Проверка, запущен ли контейнер базы данных
echo "3. Проверка, запущен ли контейнер $DOCKER_CONTAINER_NAME..."
docker ps | grep $DOCKER_CONTAINER_NAME
if [ $? -eq 0 ]; then
    echo "Контейнер $DOCKER_CONTAINER_NAME запущен."
else
    echo "Контейнер $DOCKER_CONTAINER_NAME НЕ запущен. Запустите его с помощью 'docker start $DOCKER_CONTAINER_NAME'."
    exit 1
fi

# Проверка подключения к базе данных из контейнера
echo "4. Проверка подключения к базе данных из контейнера..."
docker exec -it $DOCKER_CONTAINER_NAME psql -h localhost -U postgres -c "\l"
if [ $? -eq 0 ]; then
    echo "Подключение к базе данных из контейнера успешно."
else
    echo "Не удалось подключиться к базе данных из контейнера. Проверьте настройки подключения."
    exit 1
fi

echo "=== Проверка конфигурации PostgreSQL ==="

# Проверка listen_addresses в postgresql.conf
echo "5. Проверка параметра listen_addresses в postgresql.conf..."
sudo grep "listen_addresses" /etc/postgresql/*/main/postgresql.conf
if [ $? -eq 0 ]; then
    echo "Параметр listen_addresses найден. Убедитесь, что он равен '*'."
else
    echo "Параметр listen_addresses НЕ найден. Добавьте его в postgresql.conf."
    exit 1
fi

# Проверка pg_hba.conf
echo "6. Проверка файла pg_hba.conf..."
sudo grep -E "host.*all.*all.*0.0.0.0/0.*md5" /etc/postgresql/*/main/pg_hba.conf
if [ $? -eq 0 ]; then
    echo "Правило для подключения найдено в pg_hba.conf."
else
    echo "Правило для подключения НЕ найдено. Добавьте строку 'host all all 0.0.0.0/0 md5' в pg_hba.conf."
    exit 1
fi

echo "=== Проверка файрвола ==="

# Проверка, открыт ли порт 5432 в файрволе
echo "7. Проверка, открыт ли порт $POSTGRES_PORT в файрволе..."
sudo ufw status | grep $POSTGRES_PORT
if [ $? -eq 0 ]; then
    echo "Порт $POSTGRES_PORT открыт в файрволе."
else
    echo "Порт $POSTGRES_PORT НЕ открыт в файрволе. Откройте его с помощью 'sudo ufw allow $POSTGRES_PORT'."
    exit 1
fi


echo "=== Все проверки завершены успешно! PostgreSQL доступен. ==="
