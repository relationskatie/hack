#!/bin/bash
set -e

echo "1) Проверяю миграции..."
docker exec -it content_service-content_service-1 ls migrations/versions || echo "versions пустой"

echo "2) Удаляю старые миграции..."
docker exec -it content_service-content_service-1 rm -rf migrations/versions

echo "3) Создаю пустую папку migrations/versions..."
docker exec -it content_service-content_service-1 mkdir -p migrations/versions

echo "4) Дропаю public schema и создаю заново..."
docker exec -i postgres_content psql -U content_user -d content_bd -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "5) Создаю новую миграцию..."
docker exec -it content_service-content_service-1 alembic revision --autogenerate -m "initial migration"

echo "6) Применяю миграции..."
docker exec -it content_service-content_service-1 alembic upgrade head

echo "✅ Готово! Схема пересоздана и миграции применены."
