NAME = transcendence

all: up

up:
	docker compose up -d --build

down:
	docker compose down

re: down up

stop:
	docker compose stop

start:
	docker compose start

clean: down
	docker compose rm -f
	docker volume rm -f transcendence_grafana_data transcendence_postgres_data

fclean: clean
	docker system prune -af

logs:
	docker compose logs --follow

ps:
	docker compose ps

.PHONY: all up down re stop start clean fclean logs ps

backup:
	@bash backups/scripts/backup.sh

restore:
	@echo "Usage: make restore FILE=backups/dumps/backup_YYYY-MM-DD_HH-MM-SS.sql"
	@test -n "$(FILE)" || exit 1
	docker exec -i postgres psql -U ${POSTGRES_USER:-user} ${POSTGRES_DB:-transcendence} < $(FILE)
