NAME = transcendence

all: up migrate

up:
	docker compose up -d --build

down:
	docker compose down

re: down up migrate

stop:
	docker compose stop

start:
	docker compose start

migrate:
	@echo "Waiting for postgres to be ready..."
	@until docker exec postgres pg_isready -U $${POSTGRES_USER:-admin} > /dev/null 2>&1; do \
		echo "Postgres not ready, waiting..."; \
		sleep 2; \
	done
	@echo "Postgres is ready!"
	docker exec auth-service npx prisma db push --accept-data-loss || true
	docker compose exec postgres sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" -c "CREATE TABLE IF NOT EXISTS games (id TEXT PRIMARY KEY, \"roomId\" BIGINT UNIQUE, \"winnerId\" INT, \"loserId\" INT, \"winnerScore\" INT DEFAULT 0, \"loserScore\" INT DEFAULT 0, duration INT, status TEXT DEFAULT '\''waiting'\'', \"createdAt\" TIMESTAMP DEFAULT NOW(), \"endedAt\" TIMESTAMP);"'
	docker compose restart user-service || true
	@sleep 8
	@echo "All done! Checking tables:"
	docker compose exec postgres sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" -c "\dt"'
	
logs:
	docker compose logs --follow

ps:
	docker compose ps

clean: down
	docker compose rm -f
	docker volume rm -f transcendence_grafana_data transcendence_postgres_data

fclean: clean
	docker system prune -af

nuke:
	docker stop $(shell docker ps -aq) 2>/dev/null || true
	docker rm $(shell docker ps -aq) 2>/dev/null || true
	docker system prune -af

backup:
	@bash backups/scripts/backup.sh

restore:
	@echo "Usage: make restore FILE=backups/dumps/backup_YYYY-MM-DD_HH-MM-SS.sql"
	@test -n "$(FILE)" || exit 1
	docker exec -i postgres psql -U ${POSTGRES_USER:-admin} ${POSTGRES_DB:-transcendence} < $(FILE)

.PHONY: all up down re stop start clean fclean logs ps migrate nuke backup restore