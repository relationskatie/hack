Write-Host "1)"
docker exec -it content_service-content_service-1 ls migrations/versions

Write-Host "2)"
docker exec -it content_service-content_service-1 rm -rf migrations/versions

Write-Host "3)"
docker exec -it content_service-content_service-1 mkdir -p migrations/versions

Write-Host "4)"
docker exec -i postgres_content psql -U content_user -d content_bd -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

Write-Host "5)"
docker exec -it content_service-content_service-1 alembic revision --autogenerate -m "initial migration"

Write-Host "6)"
docker exec -it content_service-content_service-1 alembic upgrade head

Write-Host "ALL CREATE"
